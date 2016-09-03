SvgIconMenuData = new ReactiveVar()
WinDims = new ReactiveVar({x2: $( window ).width(), y2: $( window ).height()})

Meteor.startup(function() {
  $(window).resize(function(evt) {
    WinDims.set({x: $( window ).width(), y: $( window ).height()})
  });
})

SVGMenu.SVGIconMenu = React.createClass({
  displayName: 'SVGIconMenu',

  getInitialState: function() {
    return {position: null};
  },

  componentDidMount() {
    console.log('mounted')
    this._isMounted = true
  },

  componentWillUnmount() {
    console.log('unmounted')
    this._isMounted = false
  },

  changeData: function(data) {
    console.log('changeData: ' + this._isMounted)
    if(this._isMounted)
      this.setState(data)
  },

  createMenu: function createMenu(data, cage) {
    this._draw = SVG(data.svg)
    this._menu = SVGMenu.createMenu(data, cage, this._draw);
  },

  removeMenu: function() {
    if(this._menu)
      this._menu.remove()
  },

  render: function render() {
    console.log('render')
    this.removeMenu()
    // we don't want to pass by reference
    var data = Object.create(this.props)
    data.position = this.state.position || this.props.position
    data.size = this.state.size || this.props.size
    data.magnitude = this.state.magnitude || this.props.magnitude
    var dims = WinDims.get();
    dims.x1 = 0;
    dims.y1 = 0;
    return React.createElement(
      'g',
      null,
      this.createMenu(data, dims)
    );
  }
});