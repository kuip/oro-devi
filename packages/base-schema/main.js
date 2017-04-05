import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Meteor } from 'meteor/meteor';

const BaseSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
  },
  createdAt: {
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  createdBy: {
    type: String,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return this.userId
      }
    }
  },
  updatedAt: {
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isUpdate) {
        return new Date();
      }
    }
  },
  updatedBy: {
    type: String,
    optional: true,
    autoValue: function () {
      if (this.isUpdate) {
        return this.userId
      }
    }
  }
});

export default BaseSchema;
