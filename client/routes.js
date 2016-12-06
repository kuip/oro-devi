import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';

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
  { history: browserHistory },
  routes
);

Meteor.startup(function () {
  ReactDOM.render(router, document.getElementById("app-container"));
});