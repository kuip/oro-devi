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

  if(req.method != 'POST' || url.indexOf('api/insert') < 0) {
    //console.log('go to next')
    next();
    return;
  }

  url.substring(url.lastIndexOf('?')+1).split('&').forEach((s) => {
    let pair = s.split('=');
    query[pair[0]] = pair[1];
  });
  let { title } = query,
    extension = title.substring(title.lastIndexOf('.')+1);
  console.log(title, extension);

  if(['json'].indexOf(extension) < 0) {
    //console.log('go to next')
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

Picker.route('/api/insert', function(params, req, res, next) {
  if (req.url.indexOf('/api/insert') < 0) {
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

  let _id,
    { title } = params.query,
    extension = title.substring(title.lastIndexOf('.')+1),
    script,
    contentType = FileClass.mime(extension),
    filename = title,
    oroinsert = {
      extension,
      title,
      creatorId: 'unknown'
    }

  if(FileClass.textmime(extension)) {
    oroinsert.script = req._content;
    _id = true;
  }
  else {
    let inserted = {
      _id: new Meteor.Collection.ObjectID(),
      filename,
      contentType,
      metadata: { },
      aliases: [ ]
    };
    _id = OroUploads.insert(inserted);

    console.log('inserted _id', _id);

    let postpath = Meteor.absoluteUrl() + 'gridfs/orouploads/post/' + _id;
    req.pipe(request.post(postpath));
    oroinsert.upload = _id._str;
  }

  let id = OroFile.insert(oroinsert);
  console.log('inserted orofile id ', id);
  if(_id && id) {
    res.statusCode = 200;
    res.statusMessage = `Success. Inserted ids: ` + _id + `; ` + id;
  }
  else {
    res.statusCode = 500;
    res.statusMessage = `Internal server error. Inserted ids: ` + _id + `; ` + id;
  }
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
