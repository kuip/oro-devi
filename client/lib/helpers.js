import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.registerHelper('log', function(a) {
	console.log(a);
});