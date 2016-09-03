OroFile = new Mongo.Collection('orofile')

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