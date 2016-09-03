Meteor.startup(function() {
  $(window).resize(function(evt) {
    Session.set("window", {w: $( window ).width(), h: $( window ).height()})
  });
  Session.set('window', {w: $(document).width(), h: $(document).height()})
})