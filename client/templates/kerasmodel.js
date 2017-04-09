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

  let self = this;
  this.randomId = Random.id();
  this._id = new ReactiveVar(this.randomId);
  this.recipe = new ReactiveVar();
  this.runURL = 'http://localhost:3000/';
  this.trainURL = 'http://localhost:8888/notebooks/Projects/notebooks/Neurals-default.ipynb?_id=';

  this.trainCallback = function() {
    let recipe = self.recipe.get();
    if(recipe)
      window.open(self.trainURL + recipe._id, '_blank');
  }
  this.retrainCallback = function() {
    let recipe = self.recipe.get();
    if(recipe)
      window.open(self.trainURL + recipe._id, '_blank');
  }
  this.runCallback = function() {
    let recipe = self.recipe.get();
    if(typeof recipe.script == 'string') {
      recipe.script = JSON.parse(recipe.script);
    }
    if(recipe && recipe.script.run)
      window.open(self.runURL + '?' + recipe._id + '/#/' + recipe.script.run, '_blank');
  }

  this.forkCallback = function() {
    let recipe = self.recipe.get();
    Meteor.call('cloneFile', recipe._id);
  }
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
    let { _id, script, model, recipe } = Template.currentData() || {};
    let recipeJson;
    if(!_id && model) {
      _id = self.randomId;
      script = model;
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
    if(recipe) {
      recipeJson = JSON.parse(recipe.script);
      self.recipe.set(recipe);
    }
    $("#canvas-panner-" + _id).css('background', 'rgba(227,226,229,0.3)');
    let trained = recipeJson.weights ? (recipeJson.weights.buf && recipeJson.weights.json) : 0;
    let runnable = recipeJson.run;
    drawModel({
      selector: "canvas-panner-" + _id,
      json: script,
      id: _id,
      trained,
      runnable,
      trainCallback: self.trainCallback,
      retrainCallback: self.retrainCallback,
      runCallback: self.runCallback,
      forkCallback: self.forkCallback
    });
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
