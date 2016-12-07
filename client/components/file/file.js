import React from 'react';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { getFolder } from '/client/lib/vars';
import 'meteor/numtel:template-from-string';

Tracker.autorun(function() {
  var dim = Session.get('window')
  if(dim)
    $('#workdesk').css({height: dim.h-50})
})

FileComponent = React.createClass({
  displayName: "FileComponent",

  mixins: [ReactMeteorData],

  getInitialState: function getInitialState() {
    //console.log('getInitialState')
    //this.file = new FileDoc({title: this.props.params.id})
    //this.file.init()
    return null;
  },

  componentWillMount() {
    //console.log('componentWillMount')
  },

  getMeteorData: function getMeteorData() {
    console.log('FileComponent getMeteorData')
    //console.log(this.props.params)
    let handle, handle2, doc, file, 
      title = this.props.params.splat,
      idx1 = title.lastIndexOf('/'),
      idx2 = title.indexOf('.tmpl'),
      folder = title.substring(0, idx1),
      name = title.substring(idx1+1, idx2);

    if(idx2 > 0) {
      handle = Meteor.subscribe('files', {title: {$regex: folder, $options: 'i'}});
    }
    else {
      handle = Meteor.subscribe('file', {title: title})
    }

    if(handle.ready()) {
      doc = OroFile.findOne({title: title});
      if(doc && doc.upload) {
        handle2 = Meteor.subscribe('fileuploads', {_id: doc.upload});
        file = OroUploads.findOne( new Mongo.ObjectID(doc.upload));
        if(file)
          window.location.href = '/gridfs/orouploads/' + file.md5;
        else
          doc = null;
      }
      if(!handle2 || handle2.ready()) {
        return {
          file: { 
            doc,
          },
          files: OroFile.find({title: {$regex: folder, $options: 'i'}}).fetch(),
          folder,
          name
        }
      }
    }

    return {}
  },

  render: function render() {
    //console.log('FileComponent render: ' + this.data.subsReady)
    return this.data.file ? React.createElement(FileDisplay, this.data) : null
  }
});

FileDisplay = React.createClass({

  componentWillMount() {
    console.log('FileDisplay componentWillMount');
    let doc = this.props.file.doc;

    if(!doc)
      return;

    if(['md'].indexOf(doc.extension) !== -1 && doc.script) {
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/nomnoml_ct/lib/lodash.min.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.min.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/raphael.min.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/nomnoml_ct/nomnoml.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/sequence-diagrams.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/railroad-diagrams.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/marked.js"></script>');
      $('head').append('<link rel="stylesheet" type="text/css" href="/api/file/railroad-diagrams.css">')
    }
    if(['uml'].indexOf(doc.extension) !== -1 && doc.script) {
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/nomnoml_ct/lib/lodash.min.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/nomnoml_ct/lib/svgpan.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/nomnoml_ct/nomnoml.js"></script>');
      $('head').append('<link rel="stylesheet" type="text/css" href="/api/file/railroad-diagrams.css">')
    }
    if(['seq'].indexOf(doc.extension) !== -1 && doc.script) {
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/nomnoml_ct/lib/lodash.min.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/nomnoml_ct/lib/lodash.min.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/raphael.min.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.min.2.0.0.js"></script>');
      $('head').append('<script type="application/javascript" src="/api/file/_devicore/sequence-diagram2.js"></script>');
      $('head').append('<link rel="stylesheet" type="text/css" href="/api/file/railroad-diagrams.css">')
    }

    // We are in an *index* template file
    if(doc.extension == 'tmpl' && doc.title.indexOf('index') >= 0 && doc.script) {
      let files = this.props.files,
        heads = '',
        title, script;

      // Load all Blaze templates that are dependencies (same folder as this index file)
      // If the template contains a <head></head>, 
      // we clear the default head tag and put the new content in it
      files.forEach((f) => {
        script = f.script;
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
    console.log('componentDidMount')
    var doc = this.props.file.doc

    if(!doc)
      return;

    if(['md'].indexOf(doc.extension) !== -1 && doc.script) {
      //window = Object.assign(window, Railroad)
      //$("#markdown"+doc._id ).empty()
      $('#canvas-panner').parents().css({width: '100%', height: '100%'})
      var script = marked(doc.script)
      $('#canvas-panner').html(script)
    }
    if(['uml'].indexOf(doc.extension) !== -1 && doc.script) {
      $('#canvas-panner').parents().css({width: '100%', height: '100%'})
      var canv = document.getElementById('canvas-panner')
      var source = '#edges: hard\n' + doc.script
      nomnoml.draw(canv, source);
    }
    if(['seq'].indexOf(doc.extension) !== -1 && doc.script) {
      if(!svgPan)
        if(typeof root !== 'undefined')
          svgPan = root.svgPan
      if(!svgPan)
        svgPan = window.svgPan
      if(!Diagram)
        if(typeof root !== 'undefined')
          Diagram = root.Diagram
      if(!Diagram)
        Diagram = window.Diagram

      $("#nomnomlseq"+doc._id).empty()
      $("#nomnomlseq"+doc._id).parents().css({width: '100%', height: '100%'})
      var source = Diagram.parse(doc.script)
      source.drawSVG("nomnomlseq"+doc._id, {theme: 'simple'})
    }

    if(['tmpl'].indexOf(doc.extension) != -1) {
      let name = this.props.name;
      if(Template[name])
        Blaze.renderWithData(Template[name], {}, document.getElementById('Template_' + doc._id));
    }
  },

  componentDidUpdate(nprops, nstate) {
    
  },

  componentWillUnmount() {
    //console.log('componentWillUnmount')
  },

  createMarkup : function createMarkup(script) { 
    return {__html: script}; 
  },

  render: function render() {
    var doc = this.props.file.doc
    if(!doc)
      return null;
    if(['jpeg', 'jpg', 'png'].indexOf(doc.extension) !== -1 && doc.script)
      return React.createElement("img",
        {src: doc.script}
      )

    if(['md'].indexOf(doc.extension) !== -1 && doc.script) {
      return React.createElement('div',
        {id: 'canvas-panner', style: {height: '100%', width: '100%'}},
      )
    }

    if(['uml'].indexOf(doc.extension) !== -1 && doc.script) {
      return React.createElement('div',
          {id: 'canvas-panner', style: {height: '100%', width: '100%'}}
        )
    }

    if(['seq'].indexOf(doc.extension) !== -1 && doc.script) {
      return React.createElement(
        "div",
          { id: "nomnomlseq"+doc._id, style: {height: '100%', width: '100%'} }
      )
    }

    if(['html'].indexOf(doc.extension) != -1) {
      return React.createElement(
        "div",
        { className: "FileComponent" , dangerouslySetInnerHTML: this.createMarkup(doc.script)}
        )
    }

    if(['tmpl'].indexOf(doc.extension) != -1) {
      return React.createElement(
        "div",
        { className: "FileComponent" , id: 'Template_' + doc._id }
        )
    }

    return React.createElement(
      "div",
      { className: "FileComponent" },
        doc.script
      )
  }
})


FilesComponent = React.createClass({
  displayName: "FilesComponent",

  mixins: [ReactMeteorData],

  getMeteorData: function getMeteorData() {
    //   ^[^\/]*[^\/]*\.\w+

    this.regex = ['^','','([\\w-])+(\\.)(\\w+)']

    var files = new FileDocs({
      query: {title: {$regex: this.regex.join(''), $options: 'gi'}}, 
      options: {sort: [['title', 'asc']]}
    })
    files.init()

    return {
      files: files
    };

  },

  render: function render() {
    return React.createElement(
      "div",
      { className: "FileComponent" },
      React.createElement('div',
        {id: 'workdesk', style: {height: Session.get('window').h - 50}},//also change up
        React.createElement(ShowFiles2, {files: this.data.files, regex: this.regex}),
        React.createElement('div',
          {id: 'workdesk2'},
          React.createElement(UploadFile, {files: this.data.files, filequery: this.props.params.splat}),
          React.createElement(IFrameWrapper)
        )
      ),
    )
  }
});

UploadFile = React.createClass({

  getInitialState: function getInitialState() {
    return { file: null}
  },

  deleteFile: function(event) {
    event.preventDefault();
    var loadedFile = Session.get('loadedFile')
    if(loadedFile) {
      if(loadedFile.title.indexOf('meteor') != 0)
        this.props.files.remove([loadedFile._id])
      else
        this.props.files.sremove({_id: loadedFile._id}, function(err) {
          console.log('file remove')
          if(err)
            console.log(err)
          if(!err)
            Meteor.call('removeFile', loadedFile.title)
        })
      if(loadedFile.upload)
        Meteor.call('removeUpload', loadedFile.upload);
    }

  },

  addNew: function(event) {
    event.preventDefault();
    var self = this
    var files = this.props.files
    var loadedFile = {}
    var extension = $('#selectExt').val()
    var title = $('#fileTitle').val() || 'Unknown'
    var script = this.refs.WC.state.script
    if(!script) {
      var cm = this.refs.CM.state.cm
      var script = cm.getValue()
    }
    else
      extension = 'jpeg'
    if(title.indexOf('.') == -1)
      title += '.' + extension
    loadedFile.extension = extension
    loadedFile.title = title
    loadedFile.script = script

    if(title.indexOf('meteor') != 0)
      files.insert(loadedFile, function(err, id) {
        console.log(err)
        console.log(id)
        self.setState({file: {title: title, id: id}})
        loadedFile._id = id
        Session.set('loadedFile', loadedFile)
      })
    else
      files.sinsert(loadedFile, function(err) {
        if(!err)
          Meteor.call('syncFile', loadedFile)
      })
  },

  onSubmit: function(event) {
    event.preventDefault();
    var self = this
    var loadedFile = Session.get('loadedFile') || {}
    var files = this.props.files
    var extension = event.target.select.value
    var title = event.target.input.value || 'Unknown'
    var script = this.refs.WC.state.script
    if(!script) {
      var cm = this.refs.CM.state.cm
      var script = cm.getValue()
    }
    else
      extension = 'jpeg'

    if(title.indexOf('.') == -1)
      title += '.' + extension

    loadedFile.extension = extension
    loadedFile.title = title
    loadedFile.script = script

    if(title.indexOf('meteor') != 0)
      files.update(loadedFile, function(err, no) {
        console.log(err)
        console.log(no)
        self.setState({file: {title: title, id: loadedFile._id}})
        Session.set('loadedFile', loadedFile)
      })
    else
      files.supdate(loadedFile, function(err) {
        if(!err)
          Meteor.call('syncFile', loadedFile)
      })
  },

  toggleUpload: function(event) {
    event.preventDefault();
    this.setState({ upload:  (this.state.upload ? false : true) });
  },

  loadNeural: function() {
    console.log(this.state);
    if(this.state && this.state.file);
      Neurals.loadJson(this.state.file.script);
  },

  render: function render() {
    var options = Object.keys(ORO.F.File.mimes())

    Tracker.autorun(function() {
      var f = Session.get('loadedFile')
      if(f && $('#fileTitle')[0]) {
        $('#fileTitle').val(f.title)
        $('#selectExt').val(f.extension)
      }
      else
        $('#fileTitle').val('')
    })

    return React.createElement("form",
        { onSubmit: this.onSubmit },
        React.createElement("div",
          {id: 'CMButtons'},
          React.createElement("input",
            {name: "input", label: "Title", id: 'fileTitle'}
          ),
          React.createElement("select",
            {name: 'select', id: 'selectExt'},
            options.map(function(o) {
              return React.createElement("option",
                {key: o, value: o, name: "option"},
                o
              )
            })
          ),
          React.createElement(WebcamImage, {files: this.props.files, ref: 'WC'}),
          React.createElement(
            "button",
            { type: "button", className: "btn-primary", onClick: this.addNew },
            "Insert"
          ),
          React.createElement(
            "button",
            { type: "submit", className: "btn-primary" },
            "Update"
          ),
          React.createElement(
            "button",
            { type: "button", className: "btn-primary", onClick: this.deleteFile},
            "Delete"
          ),
          React.createElement(
            "button",
            { type: "button", className: "btn-primary", onClick: this.toggleUpload},
            "Upload"
          ),
          this.state.file && this.state.file.extension == 'json' ? 
            React.createElement(
              "button",
              { type: "button", className: "btn-primary", onClick: this.loadNeural},
              "Load Keras Model"
            ) : null,
          this.state.file ?
            React.createElement('a',
              {href: '/file/' + this.state.file.title, target: '_blank'},
              this.state.file.title
            )
            : null
          ),
          this.state.upload ? React.createElement(OroUpload) : null,

          React.createElement(LoadAce, {textarea: 'editor', props: this.props, ref: 'CM'})
      )
  }
})

OroUpload = React.createClass({
  getInitialState: function getInitialState() {
    return { progress: -1, background: '' };
  },

  onDragEnter: function() {
    console.log('onDragEnter');
    this.setState({ background: 'hovered' });
  },

  onMouseOut: function() {
    console.log('onMouseOut');
    this.setState({ background: '' });
  },

  render: function () {
    OroUploads.resumable.assignDrop($('.fileDrop'));
    return React.createElement("div",
        { id: "fileDrop", 
          onDragEnter: this.onDragEnter,
          onMouseOut: this.onMouseOut,
          className: "fileDrop " + this.state.background
        }
      );
  }
})

WebcamImage = React.createClass({

  getInitialState: function getInitialState() {
    return { fileId: null, script: null}
  },

  onClick: function(event) {
    var self = this
    var files = this.props.files
    var title = $('#UploadPicTitle').val()
    MeteorCamera.getPicture(function(err, data) {
      console.log(err)
      self.setState({script: data})
    })
  },

  render: function render() {
    return React.createElement(
        "button",
        { type: "button", className: "btn-primary", onClick: this.onClick},
        "Take Pic"
      )
  }
});

ShowFiles = React.createClass({

  mixins: [ReactMeteorData],

  getMeteorData: function getMeteorData() {
    const subsReady = this.props.files.subscriptionHandle.ready()
    //{title: {$regex: this.props.regex, $options: 'gi'}}
    return {
      subsReady: subsReady,
      data: this.props.files.find()
    };

  },

  onChange: function(e) {
    e.preventDefault()
    var val = e.target.value
    var regex = this.props.regex
    //console.log(regex)
    if(val == '')
      this.props.files.query = {title: {$regex: regex, $options: 'gi'}}
    else
      this.props.files.query = {title: {$regex: val, $options: 'gi'}}
  },

  loadScript: function(e) {
    e.preventDefault()
    var id = $(e.target).parent().attr('id')
    var file = this.props.files.find({_id: id})[0]
    Session.set('loadedFile', file)
  },

  render: function render() {
    var self = this
    return React.createElement('div', {id: 'showFiles'},
      React.createElement('input', {name: 'filter', id: 'filter', onChange: this.onChange}),
      React.createElement('br'),
       this.data.subsReady ? 
        this.data.data.map(function(f) {
          return React.createElement('a', 
            {href: '#', id:f._id, name:f._id, key: f._id, onClick: self.loadScript},
            f.title,
            React.createElement('br')
          )
        })
        : ''
    )
  }
})

ShowFiles2 = React.createClass({

  getInitialState: function() {
    return {
      query: {},
      regex: this.props.regex
    }
  },

  mixins: [ReactMeteorData], 

  getMeteorData: function getMeteorData() {
    const subsReady = this.props.files.subscriptionHandle.ready()

    return {
      subsReady: subsReady,
      data: this.props.files.find(this.state.query)
    };

  },

  onChange: function(e) {
    e.preventDefault()
    var val = e.target.value
    var regex = this.state.regex
    var state = this.state
    if(val == '')
      state.query = {}
    else
      state.query = {title: {$regex: val, $options: 'gi'}}

    this.setState(state)
  },

  loadScript: function(e) {
    e.preventDefault()
    var id = $(e.target).attr('id')
    var file = this.props.files.find({_id: id})[0]
    Session.set('loadedFile', file)
  },

  folderOnChange: function(e) {
    e.preventDefault()
    var val = e.target.value
    var state = this.state
    getFolder.set(val.substring(1));
    state.regex[1] = val.substring(1).replace(/\//g, '\\/')
    this.props.files.query = {title: {$regex: state.regex.join(''), $options: 'gi'}}
    this.setState(state)
  },

  parseRoot: function(root) {
    return root.replace(/\\/g, '')
  },

  render: function render() {
    var self = this
    return React.createElement('div', {id: 'showFiles'},
      React.createElement('div', {id: 'showFilesControls'},
        '/' + this.parseRoot(this.props.regex[1]),
        React.createElement(SelectFolder, {onChange: this.folderOnChange, root: this.state.regex[1], parseRoot: this.parseRoot}),
        React.createElement('br'),
        React.createElement('input', {name: 'filter', id: 'filter', onChange: this.onChange})
      ),
       this.data.subsReady ? 
        this.data.data.map(function(f) {
          return React.createElement('a', 
            {href: '#', id:f._id, name:f._id, key: f._id, onClick: self.loadScript},
            f.title,
            React.createElement('br')
          )
        })
        : ''
    )
  }
})

SelectFolder = React.createClass({

  getInitialState() {
    this.setOptions()

    return {
      options: [],
      value: this.props.parseRoot(this.props.root)
    }
  },

  setOptions: function(root) {
    var self = this
    var r = this.props.parseRoot(root || this.props.root)
    //console.log('parsedR: ' + r)
    Meteor.call('getFolderOptions', r, function(err, res) {
      if(err)
        console.log(err)
      if(res) {
        self.setState({options: res, value: '/' + r})
      }
    })
  },

  componentWillReceiveProps: function(newprops) {
    this.setOptions(newprops.root)
  },

  render: function render() {
    //console.log('value: ' + this.state.value)
    
    return React.createElement('select', {id: 'showFilesSelect', ref: 'selectFolder', onChange: this.props.onChange, value: this.state.value},
          this.state.options.map(function(o) {
            return React.createElement("option",
              {key: o, value: o, name: "option"},
              o
            )
          })
        )
  }
})

FileIFrame = React.createClass({
  render: function render() {
    var self = this
    
    return React.createElement('div', {id: 'fileIFrame'},
      React.createElement('iframe', {src: this.props.src})
    )
  }
})

IFrameWrapper = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData: function getMeteorData() {
    var f = Session.get('loadedFile')

    if(!f)
      return {src: '/file/manual.md'}

    var base = '/api/file/', title = f.title

    if(['html', 'svg', 'uml', 'seq', 'md', 'json'].indexOf(f.extension) != -1)
      Session.set('lastLoaded', f)
    
    if(['md', 'uml', 'seq', 'jpg', 'png', 'jpeg'].indexOf(f.extension) != -1)
      base = '/file/'
    else if(['js', 'css'].indexOf(f.extension) != -1) {
      var last = Session.get('lastLoaded')
      if(last) {
        title = last.title
        if(['uml', 'seq', 'md'].indexOf(last.extension) != -1)
          base = '/file/'
      }
      else {
        base = '/file/'
        title = 'manual.md'
      }
    }

    var self = this

    if($('iframe')[0])
      $('iframe')[0].contentWindow.location.reload(true)

    return {
      src: base + title
    }
  },

  render: function render() {
      return React.createElement(FileIFrame, {src: this.data.src})
  }
})
 
LoadAce = React.createClass({
  getInitialState() {
    return {
      cm: null
    };
  },

  componentWillMount() {
    $('head').append('<script type="application/javascript" src="/api/file/ace/noconflict/ace.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/ace/noconflict/ext-searchbox.js"></script>');
  },

  componentDidMount() {
    var self = this
    if(!self.state.cm) {
        if(!ace)
          if(typeof root !== 'undefined')
            ace = root.ace
        if(!ace)
          ace = window.ace

        self.state.cm = ace.edit(self.props.textarea)
        //self.state.cm.setTheme("ace/theme/chrome");
        self.state.cm.$blockScrolling = Infinity
        self.state.cm.session.setUseWrapMode(true)
    }
    Tracker.autorun(function() {
      var file = Session.get('loadedFile')
      if(!self.state.cm && file)
        Session.set('loadedFile', null)
      else if(self.state.cm && file && file.script) {
        self.state.cm.setValue(file.script)
        var mode = FileClass.AceMode(file.extension)
        var api = "/api/file/ace/noconflict/mode/" + mode + ".js"
        $('head').append('<script type="application/javascript" src="' + api + '"></script>');
        //require([
        //  api
        //], function() {
          self.state.cm.session.setMode("ace/mode/" + mode);
        //})
      }
    })
  },

  render: function render() {
    return React.createElement('div', {id: 'editor'});
  }
})
