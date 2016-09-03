//https://gist.github.com/WebReflection/3373484
!function(Object, getPropertyDescriptor, getPropertyNames){
  // (C) WebReflection - Mit Style License
  if (!(getPropertyDescriptor in Object)) {
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    Object[getPropertyDescriptor] = function getPropertyDescriptor(o, name) {
      var proto = o, descriptor;
      while (proto && !(
        descriptor = getOwnPropertyDescriptor(proto, name))
      ) proto = proto.__proto__;
      return descriptor;
    };
  }
  if (!(getPropertyNames in Object)) {
    var getOwnPropertyNames = Object.getOwnPropertyNames, ObjectProto = Object.prototype, keys = Object.keys;
    Object[getPropertyNames] = function getPropertyNames(o) {
      var proto = o, unique = {}, names, i;
      while (proto != ObjectProto) {
        for (names = getOwnPropertyNames(proto), i = 0; i < names.length; i++) {
          unique[names[i]] = true;
        }
        proto = proto.__proto__;
      }
      return keys(unique);
    };
  }
}(Object, "getPropertyDescriptor", "getPropertyNames");



augument = (target, ...sources) => {
  //console.log(target)
  var attribs = {}

  sources.forEach(source => {
    //console.log(source)
    //Object.defineProperties(target.prototype, Object.getOwnPropertyNames(source.prototype).reduce((descriptors, key) => {
    Object.defineProperties(target.prototype, Object.getPropertyNames(source.prototype).reduce((descriptors, key) => {
      if(key !== 'constructor') {
        //descriptors[key] = Object.getOwnPropertyDescriptor(source.prototype, key);
        descriptors[key] = Object.getPropertyDescriptor(source.prototype, key);
      }
      return descriptors;
    }, {}));

    // Retrieve private constructor properties
    var src = new source()
    var keys = Object.keys(src)
    keys.forEach(k => {

      // If same name array or object, concat values
      if(attribs[k] && src[k] instanceof Array)
        attribs[k] = attribs[k].concat(src[k])
      else if(attribs[k] && src[k] instanceof Object)
        for(kk in src[k])
          attribs[k][kk] = src[k][kk]
      else
        attribs[k] = src[k]
    })

  });

    // Add private constructor properties as class properties:
    keys = Object.keys(attribs)
    //console.log(attribs)
    keys.forEach(k => {
      Object.defineProperty(target.prototype, k, {
        configurable: true, 
        enumerable: true,
        value: attribs[k],
        writable: true
      })
    })

    // Add private constructor properties as getters and setters:
    /*keys.forEach(k => {
      var p = k
      if(p[0] == '_')
        p = p.substring(1)
      Object.defineProperty(target.prototype, p, {
        configurable: true, 
        enumerable: true,
        get: function() {
          console.log('get ' + k)
          return src[k]
        },
        set: function(newp) {
          console.log('set ' + k)
          src[k] = newp
        }
      })
    })*/

  return target;
}



BaseClass = class BaseClass {
  constructor(obj={}) {
    //Initialization methods to run in init() - String name
    this._init = []

    // Initialized in init()
    this._args = obj
  }

  init() {
    // delete the private property - the class property _init remains
    if(this._init.length == 0)
      delete this._init

    var directArgs = this._args
    // delete the private property - the class property _args remains
    delete this._args

    if(!this._args)
      this._args = {}
    // add the private properties in _args to class property _args
    for(a in directArgs)
      this._args[a] = directArgs[a]

    // First initialize arguments
    // Private properties will have the same name as the argument key
    for(key in this._args)
      this[BaseClass.n(key)] = this._args[key]
    delete this._args

    // Run initialization functions
    var self = this
    this._init.forEach(function(i) {
      var args = i.slice(1)
      self[i[0]](...args)
    })
  }

  RV(attr) {
    var temp = this[BaseClass.n(attr)]
    this[BaseClass.n(attr)] = new ReactiveVar(temp)
  }

  // How we write attributes: _ or not etc.
  static n(attr) {
    return '_' + attr
  }
}


DC = {}
DC.augument = augument
DC.BaseClass = BaseClass
