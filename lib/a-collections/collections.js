OroFile = new Mongo.Collection('orofile')
OroUploads = new FileCollection('orouploads',
  { resumable: true,    // Enable built-in resumable.js chunked upload support
    http: [             // Define HTTP route
      { method: 'get',  // Enable a GET endpoint
        path: '/:md5',  // this will be at route "/gridfs/myFiles/:md5"
        lookup: function (params, query) {  // uses express style url params
          return { md5: params.md5 };       // a query mapping url to myFiles
}}]});

Schemas = {}
Schemas.FileSchema = new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    optional: true,
    //unique: true,
  },
  uuid: {
    type: String,
    label: "UUID",
    optional: true
  },
  extension: {
    type: String,
    label: "Extension"
  },
  script: {
    type: String,
    label: 'Script',
    optional: true
  },
  dateModified: {
    type: Date,
    label: "Date Modified",
    autoValue: function() {
      return new Date()
    }
  },
  dateCreated: {
    type: Date,
    label: "Date Created",
    autoValue: function() {
      if(!this.isSet)
        return new Date()
    }
  },
  creatorId: {
    type: String,
    label: "Creator Id",
  },
  version: {
    type: String,
    label: "Version",
    autoValue: function(){ return '1'}
  },
  locked: {
    type: Boolean,
    label: "Locked",
    autoValue: function(){ return false}
  },
  upload: {
    type: String,
    optional: true
  },
  dependencypath :{
    type: [String],
    label: 'Deps Path',
    optional: true
  },
  structuralpath :{
    type: [String],
    label: 'File Path',
    optional: true
  },
});


OroFile.attachSchema(Schemas.FileSchema)