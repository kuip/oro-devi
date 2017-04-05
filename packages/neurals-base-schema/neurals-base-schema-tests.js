// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by neurals-base-schema.js.
import { name as packageName } from "meteor/kuip:neurals-base-schema";

// Write your tests here!
// Here is an example.
Tinytest.add('neurals-base-schema - example', function (test) {
  test.equal(packageName, "neurals-base-schema");
});
