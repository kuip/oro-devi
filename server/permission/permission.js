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

OroUploads.allow({
  // This rule secures the HTTP REST interfaces' PUT/POST
  // Necessary to support Resumable.js
  write: function (userId, file, fields) {
    // Only owners can upload file data
    return true; //(userId === file.metadata.owner);
  }
});
