Meteor.methods({
  docinsert: function(collection, obj) {
    Mongo.Collection.get(collection).insert(obj)
  },
  docupdate: function(collection, query, obj) {
    Mongo.Collection.get(collection).update(query, obj)
  },
  docupsert: function(collection, query, obj) {
    Mongo.Collection.get(collection).upsert(query, obj)
  },
  docsremove: function(collection, query) {
    Mongo.Collection.get(collection).remove(query)
  }
})