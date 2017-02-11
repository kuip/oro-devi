import fs from 'fs';
ROOT = process.env.PWD

Meteor.methods({
  getFolderOptions: function(root) {
    //console.log('root: ' + root)

    var path = ['/']
    if(root != '') {
      var base = '/'
      var seps = root.substring(0, root.length-1).split('/')
      seps.forEach(function(s) {
        path.push(base+s+'/')
        base += s + '/'
      })
    }

    //console.log(JSON.stringify(path))

    var files = OroFile.find({}, {sort: {title: 1}}).forEach(function(f) {
      if(f.title.indexOf(root) == 0) {
        var rest = f.title.substring(root.length)
        //console.log('rest: ' + rest)
        var ind = rest.indexOf('/')
        if(ind != -1) {
          var folder = '/' + root + rest.substring(0,ind +1)
          if(path.indexOf(folder) == -1)
            path.push(folder)
        }
      }
    })

    //console.log(JSON.stringify(path))

    return path
  },
  syncFile: function(file) {
    var path = ROOT + '/' + file.title.substring(7)
    var res = fs.writeFileSync(path, file.script)
  },
  removeFile: function(path) {
    fs.unlinkSync(ROOT + '/' + path.substring(7))
  },
  removeUpload: function(_id) {
    OroUploads.remove({_id: new Mongo.ObjectID(_id)});
  },
  getRoutes: function() {
    let routes = {},
      file = OroFile.findOne({title: {$regex: /devicore\/routes/ }});
    if(file) {
      routes = JSON.parse(file.script || '{}');
    }
    return routes;
  },
  countFiles: function(query) {
    return OroFile.find(query).count();
  }
})
