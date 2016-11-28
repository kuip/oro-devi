// When a file is added
OroUploads.resumable.on('fileAdded', (file) => {
   // Keep track of its progress reactivaly in a session variable
   Session.set(file.uniqueIdentifier, 0)
   // Create a new file in the file collection to upload to
   OroUploads.insert({
         _id: file.uniqueIdentifier,    // This is the ID resumable will use
         filename: file.fileName,
         contentType: file.file.type
      },
      (err, _id) => {
         if(err) {
            console.warn("File creation failed!", err);
            return
         }
         // Once the file exists on the server, start uploading
         OroUploads.resumable.upload();
      }
   );
});

// Update the upload progress session variable
OroUploads.resumable.on('fileProgress', (file) => {
   Session.set(file.uniqueIdentifier, Math.floor(100*file.progress()));
});
// Finish the upload progress in the session variable
OroUploads.resumable.on('fileSuccess', (file) => {
   Session.set(file.uniqueIdentifier, undefined);
});
// More robust error handling needed!
OroUploads.resumable.on('fileError', (file) => {
   console.warn("Error uploading", file.uniqueIdentifier);
   Session.set(file.uniqueIdentifier, undefined);
});

// Set up an autorun to keep the X-Auth-Token cookie up-to-date and
// to update the subscription when the userId changes.
Tracker.autorun(() => {
   userId = Meteor.userId();
   Meteor.subscribe('uploads', userId);
});