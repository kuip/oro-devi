import utf8 from 'utf8';
import bodyParser from 'body-parser';
import request from 'request';
import busboy from 'busboy';

Picker.middleware(bodyParser.urlencoded({ extended: false }));
Picker.middleware(bodyParser.json());

Picker.middleware((req, res, next) => {
  console.log('-------------------------------------------middleware--------')
  //console.log(req)
  let { url } = req,
    query = {};

  if(req.method != 'POST' || url.indexOf('api/upsert') < 0) {
    //console.log('go to next')
    next();
    return;
  }

  url.substring(url.lastIndexOf('?')+1).split('&').forEach((s) => {
    let pair = s.split('=');
    query[pair[0]] = pair[1];
  });
  console.log('query', query)
  let { title, ext, name } = query
  title = title || name;
  let extension = ext || title.substring(title.lastIndexOf('.')+1);
  console.log(title, extension, ['json'].indexOf(extension));

  if(['json'].indexOf(extension) == 0) {
    console.log('go to next')
    next();
    return;
  }

  var busb = new busboy({ headers: req.headers });
  busb.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    let txt = '';
    file.setEncoding('utf8');
    file.on('data', function(data) {
      //console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      if(data) txt += data;
    });
    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
      req._content = txt;
      //req.file = { file, filename, encoding, mimetype };
      //file.pipe(fs.createWriteStream(saveTo));
    });
  });
  /*busb.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
  });*/
  busb.on('finish', function() {
    console.log('Done parsing form!');
    res.writeHead(303, { Connection: 'close', Location: '/' });
    next();
  });
  req.pipe(busb);
  console.log('--------------------END-----------------------middleware--------')
});

Picker.route('/api/file/(.*)', function(params, req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  var id = decodeURIComponent(params[0])
  var post = OroFile.findOne({_id: id})
  if(!post)
    post = OroFile.findOne({title: id})
  if(!post)
    post = OroFile.findOne({title: {$regex: id, $options: 'gi'}})
  if(!post) {
    res.statusCode = 404
    res.statusMessage = "Not found"
    res.end()
    return
  }

  // Let file collection handle this
  if(post.upload) {
    let upload = OroUploads.findOne(new Mongo.ObjectID(post.upload));
    if(!upload) {
      res.statusCode = 404;
      res.statusMessage = "Not found";
      res.end();
      return;
    }

    let filename = post.title.substring((post.title.lastIndexOf('/') + 1) || 0);
    res.writeHead(301, {Location: "/gridfs/orouploads/" + upload.md5 + '?filename=' + filename});
    res.end();
    return;
  }

  res.statusCode = 200;

  if(!post.script) {
    res.end();
    return;
  }



  res.setHeader('Content-Type', FileClass.mime(post.extension));

  if(['jpeg', 'jpg', 'png', 'mid', 'wav'].indexOf(post.extension) != -1) {
    post.script = post.script.substring(23)
    post.script = Base64.decode(post.script)
    post.script = toBuffer(post.script)
  }

  if(['json', 'kmodel'].indexOf(post.extension) != -1) {
    post.script = utf8.encode(post.script);
  }
  res.end(post.script);
});

Picker.route('/api/upsert', function(params, req, res, next) {
  if (req.url.indexOf('/api/upsert') < 0) {
    next();
    return;
  }

  let method = 'POST';
  if (req.method != method) {
    res.statusCode = 400;
    res.statusMessage = `Bad request. Should be POST method`;
    res.end(res.statusMessage);
    return;
  }
  console.log('params', params)

  let uploadId, extant, id,
    insert = true,
    { title, _id, name, ext } = params.query,
    filename = (title || (name + '.' + ext)),
    extension = filename.substring(filename.lastIndexOf('.')+1),
    script,
    contentType = FileClass.mime(extension),
    oroinsert = {
      extension,
      title: (title ? title : (name + '_' + Random.id())),
      creatorId: 'unknown'
    }
    console.log('oroinsert', oroinsert);
  extant = OroFile.findOne({$or: [{_id}, {title}]});

  if(FileClass.textmime(extension)) {
    console.log('textmime', extension)
    oroinsert.script = req._content;
    if(extant && req.body) {
      console.log('file with script exists')
      console.log(JSON.stringify(req.body));
      OroFile.update({ _id: extant._id }, {$set: {script: JSON.stringify(req.body)}});
      res.statusCode = 200;
      res.statusMessage = `Success. File updated.`,
      res.end(res.statusMessage);
      return;
    }
    //_id = true;
  }
  else {
    //extant = OroFile.findOne({$or: [{_id}, {title}]});
    // if there is an existing file, it should always have an upload field
    if(extant) {
      if(extant.upload) {
        console.log('we already have a file')
        uploadId = extant.upload;
        insert = false;
      }
      else {
        res.statusCode = 500;
        res.statusMessage = `Internal server error. File found`, JSON.stringify(extant), `. But doesn't have a binary file attached.`;
        res.end(res.statusMessage)
        return;
      }
    }
    else {
      let inserted = {
        _id: new Meteor.Collection.ObjectID(),
        filename,
        contentType,
        metadata: { },
        aliases: [ ]
      };
      uploadId = OroUploads.insert(inserted);
      uploadId = uploadId._str;
      console.log('inserted uploadId', uploadId);
      if(!uploadId) {
        res.statusCode = 500;
        res.statusMessage = `Internal server error. Could not insert binary file.`;
        res.end(res.statusMessage)
        return;
      }
    }

    let postpath = Meteor.absoluteUrl() + 'gridfs/orouploads/post/' + new Meteor.Collection.ObjectID(uploadId);
    console.log('postpath', postpath);
    req.pipe(request.post(postpath));
    oroinsert.upload = uploadId;
  }
  if(insert) {
    console.log('oroinsert2', oroinsert);
    id = OroFile.insert(oroinsert);
    console.log('inserted orofile id ', id);
  }
  //if(_id && id) {
  if(insert && id) {
    res.statusMessage = `Success. Inserted ids: ` + uploadId + `; ` + id;
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({ _id: id, uploadId: _id, inserted: insert }));
  }
  if(!insert && extant) {
    res.statusMessage = `Success. Uploaded file `, extant._id, `with upload`, uploadId;
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({ _id: extant._id, title: extant.title, inserted: insert }));
  }

  res.statusCode = 500;
  res.statusMessage = `Internal server error. Inserted ids: ` + uploadId + `; ` + id;
  res.end(res.statusMessage);
});

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return view;
}

function toBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}
