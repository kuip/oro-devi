ConnectionIssueDialog = React.createClass({
  displayName: "ConnectionIssueDialog",

  render: function render() {
    // If we needed to display multiple kinds of notifications, we would split
    // this out into reusable components, but we only have this one kind so
    // we'll keep it all here.
    return React.createElement(
      "div",
      { className: "notifications" },
      React.createElement(
        "div",
        { className: "notification" },
        React.createElement("span", { className: "icon-sync" }),
        React.createElement(
          "div",
          { className: "meta" },
          React.createElement(
            "div",
            { className: "title-notification" },
            "Trying to connect"
          ),
          React.createElement(
            "div",
            { className: "description" },
            "There seems to be a connection issue"
          )
        )
      )
    );
  }
});