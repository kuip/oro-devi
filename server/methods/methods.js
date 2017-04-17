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
  },
  cloneFile: function(_id) {
    //console.log('cloneFile _id', _id);
    if(!_id) {
      throw new Meteor.Error('Invalid _id');
    }
    let file = Meteor.call('getFile', _id);
    if(!file) return;
    delete file._id;
    let name = getFileNameRoot(Meteor.call('getFileName', file.title));
    file.title = name + '_' + Random.id() + '.' + Meteor.call('getFileExt', file.title);
    file.creatorId = this.userId || (Meteor.userId ? Meteor.userId() : null) || 'unknown';

    return OroFile.insert(file);
  },
  cloneRecipe: function(_id) {
    //console.log('cloneRecipe _id', _id);
    if(!_id) {
      throw new Meteor.Error('Invalid _id');
    }
    let file, name, script,
      kmodel, kmId,
      notebook, nbId,
      title, id,
      api = 'api/file/';
    file = Meteor.call('getFile', _id);

    if(!file) return;
    delete file._id;
    name = getFileNameRoot(Meteor.call('getFileName', file.title));
    file.title = name + '_' + Random.id() + '.' + Meteor.call('getFileExt', file.title);
    file.creatorId = this.userId || (Meteor.userId ? Meteor.userId() : null) || 'unknown';

    // we don't clone the weights, the model has to be retrained
    script = JSON.parse(file.script);
    delete script.weights;

    // clone kmodel
    title = script.kmodel.substring(script.kmodel.indexOf(api) + api.length);
    kmId = Meteor.call('cloneFile', title);
    if(!kmId)
      throw new Meteor.Error('Keras model could not be cloned');
    else
      kmodel = OroFile.findOne(kmId);
    script.kmodel = Meteor.absoluteUrl() + api + kmodel.title;

    // clone notebook
    title = script.notebook.substring(script.notebook.indexOf(api) + api.length);
    nbId = Meteor.call('cloneFile', title);
    if(!nbId)
      throw new Meteor.Error('Notebook could not be cloned');
    else
      notebook = OroFile.findOne(nbId);
    script.notebook = Meteor.absoluteUrl()+ api + notebook.title;

    file.script = JSON.stringify(script);
    id = OroFile.insert(file);
    console.log('cloneRecipe cloned file id', id);
    return id;
  }
})

let getFileNameRoot = function(name) {
  let idx = name.lastIndexOf('_');

  if(name.length > 18 && idx > -1) {
    name = name.substring(0, idx);
  }
  return name;
}
