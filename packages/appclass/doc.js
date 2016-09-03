DocumentDefault = class DocumentDefault extends BaseClass {
  constructor(obj) {
    super(obj)

    var self = this

    /*self._collection = obj.collection
    self._subscription = new ReactiveVar(obj.subscription)
    self._subscriptionHandle = null*/

    self._subscriptionHandle = null

    self._init = self._init.concat([['RV', 'subscription']])

  }

  get collection() {
    return this._collection
  }

  get subscription() {
    return this._subscription.get()
  }

  set subscription(subscription) {
    this._subscription.set(subscription)
  }

  get subscriptionHandle() {
    return this._subscriptionHandle
  }

  set subscriptionHandle(handle) {
    this._subscriptionHandle = handle
  }

  get query() {
    return this._query.get()
  }

  set query(query) {
    this._query.set(query)
  }
}


Document = class Document extends DocumentDefault {
  constructor(obj) {

    super(obj)

    var self = this
    
    /*self._id = new ReactiveVar(obj.id)
    self._doc = new ReactiveVar()
    self._name = new ReactiveVar()*/

    self._init = self._init.concat([['RV', 'id'], ['RV', 'doc'], ['RV', 'query'], ['RV', 'name'], ['subscribe'], ['trackDoc']])

    /*
      //set subscription
      self.subscribe()

      //set doc details
      self.trackDoc()
    */
  }

  subscribe() {
    var self = this

    Tracker.autorun(function() {
      var id = self.id || self.query
      console.log('doc subscribe()')
      console.log(self.nosubscribe)
      if(id && self.subscription && !self.nosubscribe) {
        console.log(id)
        console.log(self.subscription)
        self.subscriptionHandle = Meteor.subscribe(self.subscription, id)
      }
      else
        self.nosubscribe = false
    })
  }

  trackDoc() {
    var self = this
    Tracker.autorun(function() {
      var doc = self.collection.find(self.id ? {_id: self._id} : self.query).fetch()[0]
      if(doc) {
        Tracker.nonreactive(function() {
          self.doc = doc
          if(!self.id) {
            self.nosubscribe = true
            self.id = doc._id
          }
        })
      }
    })
  }

  get id() {
    return this._id.get()
  }

  set id(id) {
    this._id.set(id)
  }

  get doc() {
    return this._doc.get()
  }

  set doc(doc) {
    this._doc.set(doc)
  }

  update() {
    self.collection.update({_id: this.id}, {$set: this.doc})
  }

  remove(callb) {
    this.collection.remove({_id: self.id}, callb)
  }

  supdate(obj, callb) {
    Meteor.call('docupdate', 
      this.collection._name, 
      {_id: this.id}, 
      obj || this.doc, 
      function(err, res) {
        if(callb)
          callb(err, res)
    })
  }
}


Documents = class Documents extends DocumentDefault {
  constructor(obj) {
    super(obj)

    var self = this

    self._options = {}
    /*self._schema = obj.schema
    self._query = new ReactiveVar({})
    self._options = new ReactiveVar({})

    //collection docs
    self._docs = new ReactiveVar([])*/

    self._init = self._init.concat([['RV', 'query'], ['RV', 'options'], ['RV', 'docs'], ['subscribe'], ['trackDocs']])

    /*
      self.subscribe()
      self.trackDocs()
    */

  }

  trackDocs() {
    var self = this

    Tracker.autorun(function() {
      var docs = self.collection.find(self.query).fetch()

      //if(docs.length > 0) {
        Tracker.nonreactive(function() {
          self.docs = docs
        })
      //}
    })
  }

  get query() {
    return this._query.get()
  }

  set query(query) {
    this._query.set(query)
  }

  get options() {
    return this._options.get()
  }

  set options(options) {
    this._options.set(options)
  }

  get docs() {
    return this._docs.get()
  }

  set docs(docs) {
    this._docs.set(docs)
  }

  get schema() {
    return this._schema
  }

  set schema(schema) {
    this._schema = schema
  }

  subscribe() {
    var self = this

    Tracker.autorun(function() {
      var changed = self.query && self.subscription
      if(changed)
        self.subscriptionHandle = Meteor.subscribe(self.subscription, self.query)
    })
  }

  find(query, options) {
    this._items = this.collection.find(query || this.query, options || this.options ).fetch()
    return this._items
  }

  insert(obj, callb) {
    obj.creatorId = Meteor.userId() || 'unknown'
    this.collection.insert(obj, callb)
  }

  sinsert(obj, callb) {
    obj.creatorId = Meteor.userId() || 'unknown'
    Meteor.call('docinsert', this.collection._name, obj, function(err) {
        if(callb)
          callb(err)
    })
  }

  upsert(obj, callb) {
    // Should call method!
    obj.creatorId = Meteor.userId() || 'unknown'
    var id = obj._id
    delete obj._id
    obj = {$set: obj}
    this.collection.upsert({_id: id}, obj, callb)
  }

  update(obj, callb) {
    var id = obj._id
    var obj2 = JSON.parse(JSON.stringify(obj))
    delete obj2._id
    obj2 = {$set: obj2}
    this.collection.update({_id: id}, obj2, callb)
  }

  supdate(obj, callb) {
    console.log(obj)
     var id = obj._id
    var obj2 = JSON.parse(JSON.stringify(obj))
    delete obj2._id
    obj2 = {$set: obj2}

    Meteor.call('docupdate', 
      this.collection._name, 
      {_id: id}, 
      obj2, 
      function(err) {
        if(callb)
          callb(err)
    })
  }

  remove(ids, callb) {
    var self = this
    ids.forEach(function(id) {
      self.collection.remove(id, callb)
    })
  }

  sremove(query, callb) {
    Meteor.call('docsremove', this.collection._name, query, function(err) {
        if(callb)
          callb(err)
    })
  }

}



DC.Doc = Document
DC.Docs = Documents



/*
ClassB = class ClassB {
  constructor(obj={}) {
    this._args = obj
  }

  init() {
    for(key in this._args)
      this[key] = this._args[key]
  }
}

Class1 = class Class1 extends ClassB{
  constructor(obj={}) {
    super(obj)
    this.name = obj.name
    this.size = obj.size
  }
  method1() {
    console.log('Class1')
  }
  methoddddd1() {
    console.log('Class1')
  }
  method2() {
    console.log('Class1 method2')
  }
}

Class11 = class Class11 extends Class1{
  constructor(obj={}) {
    super(obj)
    this.height = obj.height
  }
  method1() {
    super()
    console.log('Class11')
  }
}

Class2 = class Class2 extends ClassB{
  constructor(obj={}) {
    super(obj)
    this.name2 = obj.name
    this.size2 = obj.size
  }
  method2() {
    console.log('Class2')
  }
  methoddd2() {
    console.log('Class2')
  }
}

Class22 = class Class22 extends Class2{
  constructor(obj={}) {
    super(obj)
    this.height22 = obj.height
  }
  method2() {
    super()
    console.log('Class22')
  }
  method22() {
    console.log('Class22 method22')
  }
}

Class3 = class Class3 extends ClassB{
  constructor(obj={}) {
    super(obj)
    this.name3 = obj.name
  }
  method3() {
    console.log('Class3')
  }
}

Class33 = class Class33 extends Class3 {
  constructor(obj={}) {
    super(obj)
    this.name33 = obj.name
  }
  method33() {
    console.log('Class33')
  }
}

augument(Class33, Class11, Class22)

console.log(new Class33({}))

DC.Class33 = Class33*/