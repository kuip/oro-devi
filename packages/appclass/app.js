Creatable = class Creatable extends DC.BaseClass {
  constructor(obj) {
    super(obj)
    var self = this
    self.dateCreated = null
    self.creatorId = null
  }
}

Modifiable = class Modifiable extends DC.BaseClass {
  constructor(obj) {
    super(obj)
    var self = this
    self.dateModified = null
    //cache, hash
  }
  cache() {}
  hash() {}
}

Traceable = class Traceable extends DC.BaseClass {
  constructor(obj) {
    super(obj)
    var self = this
    self.originalId = null
    
  }
  showTrace() {}
}

Appable = class Appable extends DC.BaseClass {
  constructor(obj) {
    super(obj)
    var self = this
    self.apps = {}
  }

  addApp(name, type) {
    var Cclass = type == "viewer" ? Viewer : Editor
    this.apps[name] = new Cclass()
    return this.apps[name]
  }
}

Shareable = class Shareable extends DC.BaseClass {
  constructor(obj) {
    super(obj)
    var self = this
    self.permissions = {}
  }
}

Routable = class Routable extends DC.BaseClass {
  constructor(obj) {
    super(obj)
    var self = this
    self.routes = {}
  }

  addRoute(path, appInstance) {
    self.routes[path] = serverAppInst
  }
}

ServerRoutable = class ServerRoutable extends Routable{
  constructor(obj) {
    super(obj)
    var self = this
  }

  addRoute(path, serverAppInst) {
    super.addRoute(path, serverAppInst)
    if(Meteor.isServer) {
      Picker.route(path, serverAppInst.callb);
    }
  }

  executeRoute() {

  }
}

ClientRoutable = class ClientRoutable extends Routable{
  constructor(obj) {
    super(obj)
    var self = this
  }

  addRoute(path, serverAppInst) {
    super.addRoute(path, serverAppInst)
  }

  executeRoute() {
    
  }
}

App = class App extends DC.BaseClass{
  constructor(obj) {
    super(obj)
    var self = this
    self.components = {}
  }
}

Viewer = class Viewer extends App {
  constructor(obj) {
    super(obj)
    var self = this
  }

  addComponent(type, name, callback) {
    var Cclass = type == "server" ? ServerApp : ClientApp
    var args = {}
    if(callback)
      args.callback = callback
    self.components[name] = new Cclass(args)
  }
}

Editor = class Viewer extends App {
  constructor(obj) {
    super(obj)
    var self = this
  }
}

AppComponent = class AppComponent extends DC.BaseClass{
  constructor(obj) {
    super(obj)
    var self = this
  }
}

ServerComponent = class ServerComponent extends AppComponent {
  constructor(obj) {
    super(obj)
    var self = this
    self.callback = obj.callback
  }
}

ClientComponent = class ServerComponent extends AppComponent {
  constructor(obj) {
    super(obj)
    var self = this
  }
}

AppCluster = class AppCluster extends DC.BaseClass {
  start() {

  }
}



// Auguments:
augument(AppCluster, Appable)


// Able
DC.Creatable = Creatable
DC.Modifiable = Modifiable
DC.Traceable = Traceable
DC.Appable = Appable
DC.Shareable = Shareable
DC.Routable = Routable
DC.ServerRoutable = ServerRoutable
DC.ClientRoutable = ClientRoutable


// App
DC.App = App
DC.Viewer = Viewer
DC.Editor = Editor
DC.AppComponent = AppComponent
DC.ServerApp = ServerComponent
DC.ClientApp = ClientComponent
DC.AppCluster = AppCluster