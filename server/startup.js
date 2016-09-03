fs = Npm.require('fs')
ROOT = process.env.PWD

recurs = 0
// Recursive file navigation
rFileNavigation = function(path, callback) {
  recurs ++;
  var files = fs.readdirSync(path),
    ind, temppath, content

  for(f of files) {
    ind = f.indexOf('.')
    temppath = path + '/' + f
    if(ind == -1 && recurs < 200)
      rFileNavigation(temppath, callback)
    else if(ind != 0) {
      content = fs.readFileSync(temppath, 'utf8')
      callback(temppath, content)
    }
  }
}

// Update file contents to Mongo
fileUpdate = function() {
  rFileNavigation(ROOT, function(path, content) {
    var subpath = 'meteor' + path.substring(ROOT.length)
    var extension = subpath.substring(subpath.lastIndexOf('.')+1)
    OroFile.upsert({title: subpath}, {$set: {
      title: subpath,
      extension: extension,
      script: content,
      creatorId: 'unknown'
    }})
  })
}


Meteor.startup(function() {
  //fileUpdate()
})

// Update