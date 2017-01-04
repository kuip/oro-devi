import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { getPage, customRouter } from '/client/lib/vars';


Template.registerHelper('log', function(a) {
	console.log(a);
});

Template.registerHelper('stringify', function(a) {
	return JSON.stringify(a);
});

Template.registerHelper('getPage', () => {
	return getPage.get();
});
