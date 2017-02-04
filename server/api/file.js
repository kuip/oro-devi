import utf8 from 'utf8';
import bodyParser from 'body-parser';

Picker.middleware(bodyParser.urlencoded({ extended: false }));
Picker.middleware(bodyParser.json());


Picker.route('/api/file/(.*)', function(params, req, res, next) {
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
    res.writeHead(301, {Location: "/gridfs/orouploads/" + upload.md5});
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
  let { extension, title, file } = params.query,
    { script } = req.body;

  if(req.method != 'POST' && !file) {
    res.statusCode = 400;
    res.statusMessage = `Bad request. Should be POST method`;
    res.end(res.statusMessage);
    return;
  }

  if(!title || (!script && !file)) {
    res.statusCode = 400;
    res.statusMessage = `Bad request. No ${ !script ? 'script' : 'title' } query found`;
    res.end(res.statusMessage);
    return;
  }

  if(typeof script == 'object') {
    script = JSON.stringify(script);
  }

  if(!file && typeof script != 'string') {
    res.statusCode = 400;
    res.statusMessage = `Bad request. Wrong script type`;
    res.end(res.statusMessage);
    return;
  }

  if(!extension)
    extension = 'txt';

  if(title.indexOf('.') == -1)
    title += '.' + extension

  // binary file upload, we insert a zero-length file and return the _id
  // so another put/post can be
  if(file) {
    let end = title.lastIndexOf('.'),
      len = title.length,
      filename = title.substring(Math.max(0,title.lastIndexOf('/')+1), len),
      contentType = FileClass.mime(extension);

    if(!contentType) {
      res.statusCode = 500;
      res.statusMessage = "Internal Server Error. Unknown Content-Type.";
      res.end(res.statusMessage);
    }

    _id = OroUploads.insert({
      _id: new Meteor.Collection.ObjectID(),
      filename,
      contentType,
      metadata: { },
      aliases: [ ]
      }
    );
    res.statusCode = 200;
    res.statusMessage = "Insert Successful";
    console.log('inserted _id', _id._str);
    if(_id) {
        let id = OroFile.insert({
          extension,
          script,
          title,
          creatorId: 'unknown',
          upload: _id._str,
        });
        console.log('inserted orofile id ', id);
        if(id) {
          res.statusCode = 200;
          res.statusMessage = "Insert Successful";
        }
        else {
          res.statusCode = 500;
          res.statusMessage = "Internal Server Error. Insert Unsuccessful";
        }
    }
    res.end('POST file to `/gridfs/orouploads/post/' + _id + '`');
    return;
  }
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
