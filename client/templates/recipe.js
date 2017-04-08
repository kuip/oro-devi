Template.Recipe.onCreated(function() {
  let self = this;
  self.recipe = new ReactiveVar();
  self.kmodel = new ReactiveVar();

  self.autorun(function() {
    let data = Template.currentData();
    if(!data) return;

    let script = JSON.parse(data.script);
    self.recipe.set(script);
    //console.log(script);
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
  kmodel: function() {
    return Template.instance().kmodel.get();
  }
});

Template.Recipe.onRendered(function() {
  //console.log(this);
});
