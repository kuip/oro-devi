FileDoc = class FileDoc extends DC.Doc {
  constructor(obj={}) {
    obj.collection = OroFile
    obj.subscription = 'file'
    if(obj.title)
      obj.query = {title: obj.title}
    super(obj)
    var self = this
  }
}

FileDocs = class FileDocs extends DC.Docs {
  constructor(obj={}) {
    obj.collection = OroFile
    obj.subscription = 'files'
    obj.schema = Schemas.FileSchema
    super(obj)
    var self = this
  }
}