import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { getPage } from '/client/lib/vars';


Template.registerHelper('log', function(a) {
	console.log(a);
});

Template.registerHelper('getPage', () => {
	return getPage.get();
});
