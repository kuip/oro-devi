Model = new Mongo.Collection('models');
Layer = new Mongo.Collection('layers');
LayerSubset = new Mongo.Collection('layerSubsets');


Schemas.ModelSchema = new SimpleSchema({
  json: {
    type: String
  },
  optimizer: {
    type: String,
    optional: true
  }
});

Schemas.LayerSchema = new SimpleSchema({
  ordering: {
    type: Number
  },
  subset: {
  	type: String,
  	optional: true
  },
  model: {
  	type: String,
  	optional: true
  },
  json: {
    type: String
  }
});

Schemas.LayerSubsetSchema = new SimpleSchema({
  json: {
    type: String
  },
  subset: {
  	type: String,
  	optional: true
  },
  model: {
  	type: String,
  	optional: true
  }
});


Model.attachSchema(Schemas.ModelSchema)
Layer.attachSchema(Schemas.LayerSchema)
LayerSubset.attachSchema(Schemas.LayerSubsetSchema)

export { Model, Layer, LayerSubset, Schemas }