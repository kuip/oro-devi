import React from 'react';

KeditorTemplate = React.createClass({

  componentWillMount() {
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.2.3.5.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.panzoom.min.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.draggable.min.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/dagre.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/dat.gui.min.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras_conf.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras_def.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/keraseditor.js"></script>');
    $('head').append('<link rel="stylesheet" type="text/css" href="/api/file/_devicore/keras.css">');
  },

  componentDidMount() {
    let { file, json } = this.props,
      script = file ? file.script : json,
      self = this;
    if(!script)
      return;

    drawModel({
      selector: "KeditorTemplate",
      json: JSON.parse(script)
    });

    layer_ndx = "model";
    update_layer(layer_ndx);

    save_btn.click(function(){
      self.save_src(JSON.stringify(source1)); //!! global variable from keras.js script
    })
  },

  save_src(src) {
    let { _id } = this.props.file || {};

    if(!_id || !src)
      return;

    OroFile.update({ _id }, {$set: {script: src}}, function(err, no) {
      console.log(err)
      console.log(no)
    });
  },

  render() {
    return React.createElement(
      "div",
      { className: "KeditorTemplate", id: "KeditorTemplate"},
      React.createElement(
        "div",
        { id: "json_source_editor", style: {display: "none"} },
        React.createElement(
          "div",
          { className: "overlay"}
        ),
        React.createElement(
          "div",
          { id: "json_source_container"},
          React.createElement(
            "div",
            { id: "tool_source_back", className: "toolbar_button"},
            React.createElement(
              "button",
              { id: "tool_source_save", onClick: save_src},
              React.createElement(
                "svg",
                { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16"},
                React.createElement(
                  "path",
                  { transform: "rotate(45, 12, 10)", fill: "#005500", id: "svg_102", d: "m7.9,15.9l4.9,-0.05l0,-13.75l3.8,0l0,17.6l-8.7,0l0,-3.8z"}
                )
              ),
              "Ok"
            ),
            React.createElement(
              "button",
              { id: "tool_source_cancel", onClick: hide_dialog },
              React.createElement(
                "svg",
                { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16"},
                React.createElement(
                  "path",
                  { fill: "#550000", id: "svg_101", d: "m2.10526,10.52632l7.36842,0l0,-7.36842l3.68421,0l0,7.36842l7.36842,0l0,3.68421l-7.36842,0l0,7.36842l-3.68421,0l0,-7.36842l-7.36842,0l0,-3.68421z", transform: "rotate(45, 11.3, 12.3)"}
                )
              ),
              "Cancel"
            )
          ),
          React.createElement(
            "form",
            {},
            React.createElement(
              "textarea",
              { id: "json_source_textarea", spellCheck: "false" }
            )
          )
        )
      ),
      React.createElement(
        "div",
        { id: "dialog_box", style: {display: "none"} },
        React.createElement(
          "div",
          { className: "overlay"}
        ),
        React.createElement(
          "div",
          { id: "dialog_container", style: {left: "1262.5px", top: "363.5px"} },
          React.createElement(
            "div",
            { id: "dialog_content"}
          ),
          React.createElement(
            "div",
            { id: "dialog_buttons"},
            React.createElement(
              "input",
              { type: "button", value: "Ok"}
            ),
            React.createElement(
              "input",
              { type: "button", value: "Cancel"}
            ),
          ),
        )
      ),
      React.createElement(
        "div",
        { id: "dialog_elements", style: {display: "none"} },
        React.createElement(
          "svg",
          { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16"},
          React.createElement(
            "path",
            { fill: "#550000", id: "svg_101", d: "m2.10526,10.52632l7.36842,0l0,-7.36842l3.68421,0l0,7.36842l7.36842,0l0,3.68421l-7.36842,0l0,7.36842l-3.68421,0l0,-7.36842l-7.36842,0l0,-3.68421z", transform: "rotate(45, 11.3, 12.3)"}
          )
        ),
        React.createElement(
          "svg",
          { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16"},
          React.createElement(
            "path",
            { transform: "rotate(45, 12, 10)", fill: "#005500", id: "svg_102", d: "m7.9,15.9l4.9,-0.05l0,-13.75l3.8,0l0,17.6l-8.7,0l0,-3.8z"}
          )
        )
      )
      );
  }
});


KeditorComponent = React.createClass({
  displayName: "KeditorComponent",

  mixins: [ReactMeteorData],

  getMeteorData: function getMeteorData() {
    let handle,
      id = this.props.params.id,
      { json } = this.props.location.query || {};

    handle = Meteor.subscribe('files', {_id: id});

    if(handle.ready()) {
      return {
        file: OroFile.findOne(id),
        json
      }
    }

    return {}
  },

  render: function render() {
    return this.data.file ? React.createElement(KeditorTemplate, this.data) : null
  }
});
