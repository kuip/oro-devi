AppNotFound = React.createClass({
  displayName: "AppNotFound",

  render: function render() {
    return React.createElement(
      "div",
      { className: "page not-found" },
      React.createElement(
        "div",
        { className: "content-scrollable" },
        React.createElement(
          "div",
          { className: "wrapper-message" },
          React.createElement(
            "div",
            { className: "title-message" },
            "Page not found"
          )
        )
      )
    );
  }
});