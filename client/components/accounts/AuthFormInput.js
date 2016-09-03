AuthFormInput = React.createClass({
  displayName: "AuthFormInput",

  propTypes: {
    hasError: React.PropTypes.bool,
    label: React.PropTypes.string,
    iconClass: React.PropTypes.string,
    type: React.PropTypes.string,
    name: React.PropTypes.string
  },
  render: function render() {
    var className = "input-symbol";
    if (this.props.hasError) {
      className += " error";
    }

    return React.createElement(
      "div",
      { className: className },
      React.createElement("input", {
        type: this.props.type,
        name: this.props.name,
        placeholder: this.props.label }),
      React.createElement("span", {
        className: this.props.iconClass,
        title: this.props.label })
    );
  }
});