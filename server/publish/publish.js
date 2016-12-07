Meteor.publish('file', function(id) {
  if(typeof id == 'string')
    var query = {_id: id}
  else
    var query = id
  console.log('file sub: ' + JSON.stringify(query))
  return OroFile.find(query)
})

Meteor.publish('files', function(query) {
  /*console.log(query)
  for(k in query)
    if(query[k]['$regex'])
      query[k]['$regex'] = new RegExp(query[k]['$regex'])*/

  console.log(query)
  console.log(OroFile.find(query).count())
  return OroFile.find(query)
})

Meteor.publish('fileuploads', function(query) {
  query = query || {}
  query['metadata._Resumable'] = { $exists: false };
  if(query._id)
    query._id = new Mongo.ObjectID(query._id);
  console.log(query)
  console.log(OroUploads.find(query).count())
  return OroUploads.find(query)
})

// Only publish files owned by this userId, and ignore
// file chunks being used by Resumable.js for current uploads
Meteor.publish('uploads',
  function (clientUserId) {
    console.log("clientUserId === this.userId", clientUserId === this.userId);
    if (clientUserId === this.userId) {
      return OroUploads.find({ 'metadata._Resumable': { $exists: false },
                            'metadata.owner': this.userId });
    } else {        // Prevent client race condition:
      return null;  // This is triggered when publish is rerun with a new
                    // userId before client has resubscribed with that userId
    }
  }
);

// file chunks being used by Resumable.js for current uploads
Meteor.publish('upload',
  function (id) {
    if (clientUserId === this.userId) {
      return OroUploads.find({ 'metadata._Resumable': { $exists: false },
                            'metadata.owner': this.userId });
    } else {        // Prevent client race condition:
      return null;  // This is triggered when publish is rerun with a new
                    // userId before client has resubscribed with that userId
    }
  }
);


// Allow rules for security. Should look familiar!
// Without these, no file writes would be allowed
OroUploads.allow({
  // The creator of a file owns it. UserId may be null.
  insert: function (userId, file) {
    // Assign the proper owner when a file is created
    file.metadata = file.metadata || {};
    file.metadata.owner = userId;
    return true;
  },
  // Only owners can remove a file
  remove: function (userId, file) {
    // Only owners can delete
    return true; //(userId === file.metadata.owner);
  },
  // Only owners can retrieve a file via HTTP GET
  read: function (userId, file) {
    return true; //(userId === file.metadata.owner);
  },
  // This rule secures the HTTP REST interfaces' PUT/POST
  // Necessary to support Resumable.js
  write: function (userId, file, fields) {
    // Only owners can upload file data
    return true; //(userId === file.metadata.owner);
  }
});