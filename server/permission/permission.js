OroFile.allow({
  insert: function (userId, doc) {
    return true
  },
  update: function (userId, doc, fields, modifier) {
    return true
  },
  remove: function (userId, doc) {
     return true
  }
});

OroFile.deny({
  update: function (userId, doc, fields, modifier) {
     return false
  },
  remove: function (userId, doc) {
    return false
  }
});