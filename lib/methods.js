Meteor.methods({
  cloneFile: function(_id) {
    if(!_id) {
      throw new Meteor.Error('Invalid _id');
    }
    let file = OroFile.findOne(_id);
    delete file._id;
    file.title += '_' + Random.id();
    file.creatorId = this.userId || Meteor.userId() || 'unknown';
    OroFile.insert(file);
  }
});
