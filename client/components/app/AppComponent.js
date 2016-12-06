import React from 'react';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { getPage } from '/client/lib/vars';
import { pathParams } from '/client/lib/utils';
import 'meteor/numtel:template-from-string';
import '/client/lib/helpers.js';



TemplateComponent = React.createClass({

	setPage() {
		getPage.set(this.props.name);
	},

  componentWillMount() {
  	console.log('TemplateComponent componentWillMount')
  	// getPage global helper
  	this.setPage();

    let doc = this.props.file.doc;

    if(!doc)
      return;

    // We are in an *index* template file
    if(doc.script) {
      let files = this.props.files,
        heads = '',
        title, script;

      // Load all Blaze templates that are dependencies (same folder as this index file)
      // If the template contains a <head></head>, 
      // we clear the default head tag and put the new content in it
      files.forEach((f) => {
        script = f.script;

        // We save the entrypoint (index* file)
        if(f.title.indexOf('index') >= 0) {
        	let params = pathParams(f.title, 'tmpl');
        	this.indexTemplate = params.name;
        }
        if(f.extension == 'tmpl') {

          let idx1 = script.indexOf('<head>'),
            idx2 = script.indexOf('</head>');

          if(idx1 >= 0) {
            let head = script.substring(idx1+6, idx2);
            script = script.substring(0, idx1) + script.substring(idx2+7);
            head = head.replace(/(?:\r\n|\r|\n|\t)/gm, '');
            heads += head;
          }
          title = f.title.substring(f.title.lastIndexOf('/')+1, f.title.indexOf('.' + doc.extension));
          Template[title] = Template.fromString(script);
        }
      });

      $('head').html(heads);
    }
  },

  componentDidMount() {
    var doc = this.props.file.doc

    if(!doc)
      return;

    //let name = this.props.name;
    if(Template[this.indexTemplate])
      Blaze.renderWithData(Template[this.indexTemplate], {}, document.getElementById('Template_' + doc._id));
  },

  render: function render() {
    var doc = this.props.file.doc
    if(!doc)
      return null;

    return React.createElement(
      "div",
      { className: "TemplateComponent" , id: 'Template_' + doc._id }
      );
  }
})


AppComponent = React.createClass({
  displayName: "AppComponent",

  mixins: [ReactMeteorData],

  getMeteorData: function getMeteorData() {
    let handle, 
      title = this.props.params.splat,
      idx1 = title.lastIndexOf('/'),
      idx2 = title.indexOf('.tmpl'),
      folder = title.substring(0, idx1);

    if(idx2 == -1) {
    	idx2 = title.length;
    	title += '.tmpl';
    }

    name = title.substring(idx1+1, idx2);

    handle = Meteor.subscribe('files', {title: {$regex: folder, $options: 'i'}});
   
    if(handle.ready())
      return {
        file: {doc: OroFile.findOne({title: title})},
        files: OroFile.find({title: {$regex: folder, $options: 'i'}}).fetch(),
        folder,
        name
      }

    return {}
  },

  render: function render() {
    return this.data.file ? React.createElement(TemplateComponent, this.data) : null
  }
});
