FileClass = class FileClass extends DC.BaseClass {
  constructor(obj) {
    super(obj)
    var self = this

    //self.addRoute('api/file/:id', )
  }

  static mimes() {
    return {
      'svg': 'image/svg+xml',
      'js': 'application/javascript',
      'css': 'text/css',
      'json': 'application/json',
      'md': 'text/plain',
      'txt': 'text/plain',
      'gcode': 'text/plain',
      'jpeg': 'image/jpeg',
      'jpg': 'image/jpeg',
      'png': 'image/png',
      'bmp': 'image/bmp',
      'gif': 'image/gif',
      'html': 'text/html',
      'csv': 'text/plain',
      'tsv': 'text/plain',
      'uml': 'text/plain',
      'seq': 'text/plain',
      'bvh': 'application/octet-stream',
      'obj': 'application/octet-stream',
      'stl': 'application/sla',
      'woff': 'application/font-woff',
      'woff2': 'application/font-woff2',
      'otf': 'application/x-font-opentype',
      'tff': 'application/x-font-truetype',
      'eot': 'application/vnd.ms-fontobject',
      'xml': 'application/xml',
      'mid': 'application/x-midi',
      'wav': 'audio/wav',
      'mp3': 'audio/mp3',
      'ogg': 'audio/ogg'
    }
  }

  static mime(extension) {
    return FileClass.mimes()[extension]
  }

  static CMmodes() {
    return {
      'svg': 'htmlmixed',
      'html': 'htmlmixed',
      'md': 'markdown',
      'css': 'css',
      'js': 'javascript',
      'json': "javascript",
      'styl': 'stylus',
      'php': 'php',

      'txt': 'javascript',
      'gcode': 'javascript',
      'jpeg': 'javascript',
      'jpg': 'javascript',
      'png': 'javascript',
      'bmp': 'javascript',
      'gif': 'javascript',
      'csv': 'javascript',
      'tsv': 'javascript',
      'uml': 'javascript',
      'seq': 'javascript',
      'bvh': 'javascript',
      'obj': 'javascript',
      'stl': 'javascript',
      'woff': 'javascript',
      'woff2': 'javascript',
      'otf': 'javascript',
      'tff': 'javascript',
      'eot': 'javascript',
      'xml': 'javascript',
      'mid': 'javascript'

    }
  }

  static CMmode(extension) {
    return FileClass.CMmodes()[extension]
  }

  static AceModes() {
    return {
      'svg': 'svg',
      'html': 'html',
      'md': 'markdown',
      'css': 'css',
      'js': 'javascript',
      'json': "json",
      'styl': 'stylus',
      'php': 'php',

      'txt': 'text',
      'gcode': 'text',
      'jpeg': 'text',
      'jpg': 'text',
      'png': 'text',
      'bmp': 'text',
      'gif': 'text',
      'csv': 'text',
      'tsv': 'text',
      'uml': 'text',
      'seq': 'text',
      'bvh': 'text',
      'obj': 'text',
      'stl': 'text',
      'woff': 'text',
      'woff2': 'text',
      'otf': 'text',
      'tff': 'text',
      'eot': 'text',
      'xml': 'text',
      'mid': 'text'

    }
  }

  static AceMode(extension) {
    return FileClass.AceModes()[extension]
  }

  static classes() {
    return {
      'svg': SvgFile,
      'js': JsFile,
      'css': CssFile,
      'json': JsonFile,
      'md': MdFile,
      'txt': 'text/plain',
      'gcode': 'text/plain',
      'jpeg': ImageFile,
      'jpg': ImageFile,
      'png': ImageFile,
      'bmp': 'image/bmp',
      'gif': 'image/gif',
      'html': 'text/html',
      'csv': 'text/plain',
      'tsv': 'text/plain',
      'uml': 'text/plain',
      'bvh': 'application/octet-stream',
      'obj': 'application/octet-stream',
      'stl': 'application/sla',
      'woff': 'application/font-woff',
      'woff2': 'application/font-woff2',
      'otf': 'application/x-font-opentype',
      'tff': 'application/x-font-truetype',
      'eot': 'application/vnd.ms-fontobject',
      'xml': 'application/xml',
      'mid': 'application/x-midi'
    }
  }

  static factory(extension) {
    return new FileClass.classes()[extension]()
  }
}

FilesClass = class FilesClass extends DC.BaseClass {
  constructor(obj) {
    super(obj)
    var self = this

  }
}

ScriptFile = class ScriptFile extends FileClass {
  constructor(obj) {
    super(obj)
    var self = this
  }
}

CompositeFile = class CompositeFile extends FileClass {
  
}

SvgFile = class SvgFile extends CompositeFile {
  
}

MdFile = class MdFile extends CompositeFile {
  
}

JsFile = class JsFile extends ScriptFile {
  
}

CssFile = class CssFile extends ScriptFile {
  
}

HtmlFile = class HtmlFile extends ScriptFile {
  
}

UmlFile = class UmlFile extends ScriptFile {
  
}

GcodeFile = class GcodeFile extends ScriptFile {
  
}

ImageFile = class ImageFile extends ScriptFile {

}

JsonFile = class JsonFile extends ScriptFile {

}

// Auguments (multiple inheritance)
DC.augument(FileClass, FileDoc, DC.Appable, DC.ServerRoutable)

var F = {}
F.File = FileClass
F.Script = ScriptFile
F.Composite = CompositeFile
F.Svg = SvgFile
F.Md = MdFile
F.Js = JsFile
F.Css = CssFile
F.Html = HtmlFile
F.Uml = UmlFile
F.Gcode = GcodeFile
F.Img = ImageFile

F.Files = FilesClass

ORO.F = F

