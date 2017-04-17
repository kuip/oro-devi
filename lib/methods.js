Meteor.methods({
  getFile: function(identifier) {
    console.log('getFile identifier', identifier);
    if(!identifier) {
      throw new Meteor.Error('No identifier provided');
    }
    return OroFile.findOne({$or: [
      { _id: identifier },
      { title: identifier }
    ]});
  },
  getFileName: function(title) {
    return title.substring(0, title.lastIndexOf('.'));
  },
  getFileExt: function(title) {
    return title.substring(title.lastIndexOf('.') + 1);
  }
});
