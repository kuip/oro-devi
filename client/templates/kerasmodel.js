import { loadScript } from './loadScript.js';

Template.Kmodel.onRendered(function() {
  console.log('Kmodel rendered!!')
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.2.3.5.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.panzoom.min.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/svg.draggable.min.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/dagre.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras_conf.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras_def.js"></script>');
  $('head').append('<script type="application/javascript" src="/api/file/_devicore/keras.js"></script>');

	let { _id, script } = Template.currentData() || {};
	if(!script) {
    return;
  }
  $("#canvas-panner-" + _id).html('');
  drawModel("canvas-panner-" + _id, JSON.parse(script));
});

Template.Kmodel.helpers({
  id: () => {
    let { _id } = Template.currentData() || {};
    return _id;
  }
});
