OroFile = new Mongo.Collection('orofile')
OroUploads = new FileCollection('orouploads', {
  resumable: true,    // Enable built-in resumable.js chunked upload support
  http: [             // Define HTTP route
    {
      method: 'delete',
      path: 'delete/:_id',
      lookup: function (params, query) {
        return { _id: params._id };
      }
    },
    { method: 'get',  // Enable a GET endpoint
      path: '/:md5',  // this will be at route "/gridfs/myFiles/:md5"
      lookup: function (params, query) {  // uses express style url params
        return { md5: params.md5 };       // a query mapping url to myFiles
      }
    },
    { method: 'put',  // Enable a PUT endpoint
        path: '/put/:_id',  // this will be at route "/gridfs/myFiles/put/:_id"
        lookup: function (params, query) {  // uses express style url params
          console.log('----##----- orouploads handler PUT lookup ----##----- ');
          return { _id: params._id };       // a query mapping url to myFiles
        },
        handler: function (req, res, next) {
          console.log('######## orouploads handler PUT ##########');
           if (req.headers && req.headers.origin) {
             res.setHeader('Access-Control-Allow-Origin', 'http://meteor.local'); // For Cordova
             res.setHeader('Access-Control-Allow-Credentials', true);
           }
           next();
        }
    },
    // POST data to a file based on _id and a secret value stored as metadata
    // where the secret is supplied as a MIME/Multipart parameter
    { method: 'post',
      path:   '/post/:_id',
      lookup: function (params, query, multipart) {
        console.log('----##----- orouploads handler POST lookup ----##----- ');
        console.log(params)
        console.log(query)
        console.log(multipart)
        return { _id: params._id }
      },
      handler: function (req, res, next) {
        console.log('########## orouploads handler POST ##########');
        //console.log(req)
         if (req.headers && req.headers.origin) {
           res.setHeader('Access-Control-Allow-Origin', 'http://meteor.local'); // For Cordova
           res.setHeader('Access-Control-Allow-Credentials', true);
         }
         next();
      }
    }

  ]
});

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
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
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
