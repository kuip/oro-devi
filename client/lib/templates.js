import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

let loadScript = function() {
	let title = this.data;
	this.handle = Meteor.subscribe('file', {title: title});
	this.script = new ReactiveVar();

	this.autorun(() => {
		let file = OroFile.findOne({title: title});
		if(file) {
			this.script.set(file.script);
		}
	});
}


Template.RawScript.onCreated(loadScript);

Template.RawScript.helpers({
	script: function() {
		return Template.instance().script.get() || '';
	}
});

Template.Markdown.onCreated(loadScript);

Template.Markdown.onRendered(function() {
	$('head').append('<script type="application/javascript" src="/api/file/_devicore/nomnoml_ct/lib/lodash.min.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.min.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/raphael.min.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/nomnoml_ct/nomnoml.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/sequence-diagrams.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/railroad-diagrams.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/marked.js"></script>');
  $('head').append('<link rel="stylesheet" type="text/css" href="/api/file/railroad-diagrams.css">')

	this.autorun(() => {
		let script = this.script.get();
		if(script) {
	    script = marked(script);
	    $('#canvas-panner').html(script);
	    $('#canvas-panner').parents().css({width: '100%', height: '100%'});

	    // Fix svg height
	    Meteor.setTimeout(function() {
		    $('.fit svg').each((i, elem) => {
		    	let width = $(elem).find('g rect').attr('width'),
		    		height = $(elem).find('g rect').attr('height');
		    	$(elem).parent().css({width: width+'px', height: height+'px'});
		    });
		  }, 400);
	  }
	});
});