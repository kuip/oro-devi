import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import BaseSchema from 'kuip:base-schema';

const RecipeSchema = new SimpleSchema([ BaseSchema, {
  kmodel: {
    type: String
  },
  weights: {
    type: Object,
    optional: true
  },
  'weights.json': {
    type: String,
    optional: true
  },
  'weights.buf': {
    type: String,
    optional: true
  },
  'weights.hdf5': {
    type: String,
    optional: true
  },
  notebook: {
    type: String,
    optional: true
  },
  input: {
    type: String,
    optional: true
  },
  adaptor: {
    type: String,
    optional: true
  },
  stats: {
    type: Object,
    optional: true
  },
  'stats.errors': {
    type: String,
    optional: true
  }
}]);

export default RecipeSchema;
