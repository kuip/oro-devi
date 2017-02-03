import utf8 from 'utf8';

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
  let { extension, script, title } = params.query;

  if(!script || !title) {
    res.statusCode = 400;
    res.statusMessage = `Bad request. No ${ !script ? 'script' : 'title' } query found`;
    res.end();
    return;
  }
  if(!extension)
    extension = 'txt';

  if(title.indexOf('.') == -1)
    title += '.' + extension

  let id = OroFile.insert({
    extension,
    script,
    title,
    creatorId: 'unknown',
  });
  console.log('inserted id ', id);
  if(id) {
    res.statusCode = 200;
    res.statusMessage = "Insert Successful";
  }
  else {
    res.statusCode = 500;
    res.statusMessage = "Internal Server Error. Insert Unsuccessful";
  }
  res.end();
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
