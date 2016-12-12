import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';

let customRoutes = {};

var routes = React.createElement(
  Route,
  { path: "/", component: AppBody },
  React.createElement(IndexRoute, { component: AppLoading }),
  React.createElement(Route, { path: "files(/**)", component: FilesComponent }),
  React.createElement(Route, { path: "file/**", component: FileComponent }),
  React.createElement(Route, { path: "svg", component: SvgComponent }),
  React.createElement(Route, { path: "app/**", component: AppComponent }),

  //React.createElement(Route, { path: "*", component: AppNotFound }),
);

var router = React.createElement(
  Router,
  { 
    history: browserHistory,
    onUpdate: function() {
      console.log('--------onUpdate');
      console.log(this);
      console.log(customRoutes);
    }
  },
  routes
);

// Customized routes from the db
Meteor.subscribe('routes');

console.log(router);

console.log(Router);

Tracker.autorun(() => {
  customRoutes = OroFile.find({title: {$regex: /devicore\/routes/ }}).fetch()[0];
});

Meteor.startup(function () {
  ReactDOM.render(router, document.getElementById("app-container"));
});