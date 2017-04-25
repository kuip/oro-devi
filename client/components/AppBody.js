import React from 'react';
import ReactRouter from 'react-router';

import { AccountsComponent } from 'meteor/oro8oro:base-accounts';

const Link = ReactRouter.Link;

// true if we should show an error dialog when there is a connection error.
// Exists so that we don't show a connection error dialog when the app is just
// starting and hasn't had a chance to connect yet.
var ShowConnectionIssues = new ReactiveVar(false);

var CONNECTION_ISSUE_TIMEOUT = 5000;

// Only show the connection error box if it has been 5 seconds since
// the app started
setTimeout(function () {
  // Show the connection error box
  ShowConnectionIssues.set(true);
}, CONNECTION_ISSUE_TIMEOUT);

// This component handles making the subscriptons to globally necessary data,
// handling router transitions based on that data, and rendering the basic app
// layout
AppBody = React.createClass({
  displayName: "AppBody",

  mixins: [ReactMeteorData],

  getInitialState: function getInitialState() {
    return null;
  },

  getMeteorData: function getMeteorData() {

    // Get the current routes from React Router
    var routes = this.props.routes;

    return {
      currentUser: Meteor.user(),
      disconnected: ShowConnectionIssues.get() && !Meteor.status().connected,
      routes: routes
    };
  },

  render: function render() {

    return React.createElement(
      "div",
      { id: "container" },
      //React.createElement(UserSidebarSection, { user: this.data.currentUser }),
      this.data.disconnected ? React.createElement(ConnectionIssueDialog, null) : "",
      React.createElement(AccountsComponent),
      React.createElement(
        "div",
        { id: "content-container" },
        this.props.children
      )
    );
  }
});
