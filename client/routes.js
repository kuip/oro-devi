var _ReactRouter = ReactRouter;
var Router = _ReactRouter.Router;
var Route = _ReactRouter.Route;
var IndexRoute = _ReactRouter.IndexRoute;

var createHistory = ReactRouter.history.createHistory;

var routes = React.createElement(
  Route,
  { path: "/", component: AppBody },
  React.createElement(IndexRoute, { component: AppLoading }),
  React.createElement(Route, { path: "files(/**)", component: FilesComponent }),
  React.createElement(Route, { path: "file/**", component: FileComponent }),
  React.createElement(Route, { path: "svg", component: SvgComponent })

  //React.createElement(Route, { path: "*", component: AppNotFound }),
);

var router = React.createElement(
  Router,
  { history: createHistory() },
  routes
);

Meteor.startup(function () {
  ReactDOM.render(router, document.getElementById("app-container"));
});