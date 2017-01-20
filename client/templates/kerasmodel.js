Template.Kmodel.onRendered(function() {
  console.log('Kmodel rendered!!')
  if(typeof SVG == 'undefined') {
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.2.3.5.js"></script>');
  }
  if(typeof view == 'undefined' || !view.panZoom) {
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.panzoom.min.js"></script>');
  }
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.draggable.min.js"></script>');
  if(typeof dagre == 'undefined') {
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/dagre.js"></script>');
  }
  if(typeof drawModel == 'undefined') {
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras_conf.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras_def.js"></script>');
    $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras.js"></script>');
  }

  //this.autorun(() => {
    let { _id, script } = Template.currentData() || {};
  	if(!script) {
      return;
    }
    $("#canvas-panner-" + _id).html('');
    $("#canvas-panner-" + _id).css('background', 'rgba(227,226,229,0.3)');
    drawModel("canvas-panner-" + _id, JSON.parse(script), _id);
  //});
});

Template.Kmodel.helpers({
  id: () => {
    let { _id } = Template.currentData() || {};
    return _id;
  }
});

Template.Kmodel.events({
  'click .kmodel': (e, inst) => {
    console.log(inst.data.title);
  }
});

Template.Kmodel.onDestroyed(function() {
  console.log('destryyyy')
  let { _id } = Template.currentData() || {};
  $("#canvas-panner-" + _id).html('');
});
