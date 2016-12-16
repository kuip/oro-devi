import { Meteor } from 'meteor/meteor';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';

let customRoutes = ORO.globalCustomRoutes;

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



// Customized routes from the db
Meteor.subscribe('routes');

// Temporary (replace with server cache)
customRoutesRec = {"script":"{\n    \"/\": \"app/neurals-v1/home\"\n}"};
console.log(customRoutesRec.script)
customRoutes = JSON.parse(customRoutesRec.script);

/*Tracker.autorun(() => {
  customRoutes = OroFile.find({title: {$regex: /devicore\/routes/ }}).fetch();
  console.log(JSON.stringify(customRoutes));
});*/


Meteor.startup(function () {
  /*let rr = Meteor.call('getRoutes', (err, res) => {
    console.log(res);
  });*/
  
  var router = React.createElement(
  Router,
  { 
    history: browserHistory,
    onUpdate: function() {
      //console.log(this);
      let redir = customRoutes[this.router.location.pathname];
      if(redir) {
        console.log('redirect to: ' + redir);
        this.props.history.push(redir);
      }
    }
  },
  routes
);
  ReactDOM.render(router, document.getElementById("app-container"));
});
