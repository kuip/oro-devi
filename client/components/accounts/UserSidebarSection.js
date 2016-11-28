import React from 'react';
import ReactRouter from 'react-router';

var Link = ReactRouter.Link;

UserSidebarSection = React.createClass({
  displayName: "UserSidebarSection",

  getInitialState: function getInitialState() {
    return {
      menuOpen: false
    };
  },

  propTypes: {
    user: React.PropTypes.object
  },

  toggleMenuOpen: function toggleMenuOpen(event) {
    event.preventDefault();

    this.setState({
      menuOpen: !this.state.menuOpen
    });
  },

  loginGoogle: function login(event) {
    event.preventDefault();
    console.log('login')
    Meteor.loginWithGoogle({
      requestPermissions: [
        'profile', 'email'
      ],
      loginStyle: "popup"
    });
  },

  loginTwitter: function login(event) {
    event.preventDefault();
    console.log('login')
    Meteor.loginWithTwitter({
      requestPermissions: [
        'profile', 'email'
      ],
      loginStyle: "popup"
    });
  },

  logout: function logout() {
    Meteor.logout();
  },

  render: function render() {
    var contents = undefined;

    if (this.props.user) {
      /*var email = this.props.user.emails[0].address;
      var emailUsername = email.substring(0, email.indexOf('@'));*/

      contents = React.createElement(
        "div",
        { className: "loginButtons" },
        React.createElement(
          "button",
          { className: "btn-secondary", onClick: this.logout },
          "Logout"
        )
      );
    } else {
      contents = React.createElement(
        "div",
        { className: "loginButtons" },
        React.createElement(
          'button',
          { type: 'button', className: 'btn-primary' , onClick: this.loginGoogle},
          'Google Sign in'
        ),
        React.createElement(
          'button',
          { type: 'button', className: 'btn-primary', 
          onClick: this.loginTwitter},
          'Twitter Sign in'
        )
      );
    }

    return React.createElement(
      "div",
      null,
      contents
    );
  }
});