import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';

let router, routes,
  customRoutes = new ReactiveVar(),
  customRouter = new ReactiveVar();

routes = React.createElement(
  Route,
  { path: "/", component: AppBody },
  React.createElement(IndexRoute, { component: AppLoading }),
  React.createElement(Route, { path: "files(/**)", component: FilesComponent }),
  React.createElement(Route, { path: "file/**", component: FileComponent }),
  React.createElement(Route, { path: "svg", component: SvgComponent }),
  React.createElement(Route, { path: "app/**", component: AppComponent })
);

router = React.createElement(
  Router,
  { 
    history: browserHistory,
    onUpdate: function() {
      customRouter.set(this);
    }
  },
  routes
);


// Customized routes from the db
Meteor.subscribe('routes');

Tracker.autorun(() => {
  file = OroFile.findOne({title: {$regex: /devicore\/routes/ }});
  if(file && file.script) {
    customRoutes.set(JSON.parse(file.script));
  }
});


Meteor.startup(function () {
  ReactDOM.render(router, document.getElementById("app-container"));

  Tracker.autorun(function() {
    let rr = customRoutes.get();
    let r = customRouter.get();

    if(rr && r) {
      let redir = rr[r.router.location.pathname];
        if(redir) {
          console.log('redirect to: ' + redir);
          r.props.history.push(redir);
        }
    }
  })
});
