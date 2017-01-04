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

Template.registerHelper('redirect', function(link, selector) {
	if(!link || !selector) {
		return;
	}
	let r = customRouter.get(),
		inst = Template.instance(),
		evMap = {};

	evMap['click '+selector] = function(ev) {
		r.props.history.push(link);
	}
	inst.view.template.__eventMaps.push(evMap);
});
