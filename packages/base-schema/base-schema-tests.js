// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by base-schema.js.
import { name as packageName } from "meteor/kuip:base-schema";

// Write your tests here!
// Here is an example.
Tinytest.add('base-schema - example', function (test) {
  test.equal(packageName, "base-schema");
});
