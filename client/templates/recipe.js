Template.Recipe.onCreated(function() {
  let self = this;
  self.recipe = new ReactiveVar();
  self.kmodel = new ReactiveVar();
  self.kid = new ReactiveVar();
  self.identifier = new ReactiveVar(1);

  self.autorun(function() {
    let kmodelDoc = OroFile.findOne({
      $or: [{ _id: self.identifier.get()}, { title: self.identifier.get()}]
    });

    if(kmodelDoc) {
      self.kid.set(kmodelDoc._id);
    }
  });

  self.autorun(function() {
    let data = Template.currentData();
    if(!data) return;

    let script = JSON.parse(data.script);
    self.recipe.set(script);

    if(script.kmodel.indexOf(Meteor.absoluteUrl()) > -1) {
      let api = 'api/file/';
      let identifier = script.kmodel.substring(script.kmodel.indexOf(api) + api.length)
      self.handle = self.subscribe('files', {
        $or: [{ _id: identifier}, { title: identifier}]
      });
      self.identifier.set(identifier);
    }
    else {
      self.identifier.set(null);
    }

    $.get(script.kmodel, function() {})
      .done(function(data) {
        //console.log(data);
        if(typeof data === 'string'){
          data = JSON.parse(data);
        }
        self.kmodel.set(data);
      })
      .fail(function(error) {
        console.log( error );
      });
  });
});

Template.Recipe.helpers({
  ready: function() {
    if(Template.instance().identifier.get())
      return Template.instance().kid.get();
    return true;
  },
  model: function() {
    return Template.instance().kmodel.get();
  },
  recipe: function() {
    return Template.currentData();
  },
  _id: function() {
    return Template.instance().kid.get();
  }
});

Template.Recipe.onRendered(function() {
  //console.log(this);
});
