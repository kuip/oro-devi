Template.Kmodel.onCreated(function() {
  //console.log('Kmodel created!!')
  if(typeof SVG == 'undefined') {
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.2.3.5.js"></script>');
  }

  $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.panzoom.min.js"></script>');

  $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.draggable.min.js"></script>');

  if(typeof dagre == 'undefined' || !dagre.graphlib) {
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/dagre.js"></script>');
  }
  if(typeof drawModel == 'undefined') {
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras_conf.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras_def.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras.js"></script>');
  }

});

Template.Kmodel.onCreated(function() {
  this.randomId = Random.id();
  this._id = new ReactiveVar(this.randomId);
});

Template.Kmodel.helpers({
  id: () => {
    let { _id } = Template.currentData() || {};
    return _id || Template.instance()._id.get();
  }
});

Template.Kmodel.onRendered(function() {
  let self = this;
  this.autorun(() => {
    let { _id, script, keras_version } = Template.currentData() || {};
    if(!_id && keras_version) {
      _id = self.randomId;
      script = Template.currentData();
    }
    else if(_id && script) {
      script = JSON.parse(script);
    }

    if($("#canvas-panner-" + _id)[0]) {
      $("#canvas-panner-" + _id).html('');
    }
  	if(!script || !_id) {
      return;
    }
    self._id.set(_id);
    $("#canvas-panner-" + _id).css('background', 'rgba(227,226,229,0.3)');
    drawModel("canvas-panner-" + _id, script, _id);
  });
});

Template.Kmodel.events({
  'click .kmodel': (e, inst) => {
    console.log(inst.data.title);
  }
});

Template.Kmodel.onDestroyed(function() {
  //console.log('destryyyy   Kmodel')
  let { _id } = Template.currentData() || {};
  $("#canvas-panner-" + _id).html('');
});
