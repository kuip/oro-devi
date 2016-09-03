TurtleController = class {
  constructor(obj) {
    // Radius
    this.rad = obj.rad
    // Position
    this.pos = obj.pos
    this.parent = obj.parent
    this.callback = obj.callback
    this.dist = obj.dist || 100

    this.svgstr = TurtleControllerSvg
    this.scale = 0.5
    this.id = "turtleControllerId"
    this.points = []
  }

  addP() {
    var bb = this.svg.bbox()
    this.points.push([bb.cx, bb.cy])
  }

  create() {
    this.parent.svg(this.svgstr)
    this.svg = SVG.get(this.id)
    this.addP()
    //this.svg.transform({x:-512, y:-512})
    this.svg.transform({scaleX: this.scale, scaleY: this.scale})

    this.setEvents()
  }

  show() {
    this.svg.opacity(1)
  }

  hide() {
    this.svg.opacity(0)
  }

  toggle() {
    if(this.svg.opacity())
      this.hide()
    else
      this.show()
  }

  move(p) {
    var bb = this.svg.bbox()
    console.log(JSON.stringify(bb))
    console.log(JSON.stringify(p))
    var transform = {x: 512*this.scale + (p[0]-bb.cx), y: 512*this.scale + (p[1]-bb.cy)}
    console.log('transf: ' + JSON.stringify(transform))
    this.svg.transform(transform)
  }

  setEvents() {
    var self = this
    /*SVG.get('tcu').on('click', function(e) {
      var lastP = self.points[self.points.length-1]
      self.points.push([
        lastP[0], lastP[1] - self.dist
      ])
      self.callback(self.points)
      self.move(self.points[self.points.length-1])
    })*/
    //("M0,0<90F1448<90F1024<190F1448<90F1024Z")
    this.graph = this.svg.tgraph(800, 800).attr({stroke:"#000", width:0.5}).fill('#f4f4f4')
    var str = "M0,0"
    
    SVG.get('tcu').on('click', function(e) {
      var lastP = self.points[self.points.length-1]
      str += 'F' + self.dist
      self.graph.t(str)
      console.log(str)
      self.graph.render()
      //self.move(self.points[self.points.length-1])
    })
    SVG.get('tcr').on('click', function(e) {
      var lastP = self.points[self.points.length-1]
      str += '<90F' + self.dist
      self.graph.t(str)
      console.log(str)
      //self.move(self.points[self.points.length-1])
    })
    SVG.get('tcd').on('click', function(e) {
      var lastP = self.points[self.points.length-1]
      str += '<180F' + self.dist
      self.graph.t(str)
      console.log(str)
      //self.move(self.points[self.points.length-1])
    })
    SVG.get('tcl').on('click', function(e) {
      var lastP = self.points[self.points.length-1]
      str += '>90F' + self.dist
      self.graph.t(str)
      console.log(str)
      //self.move(self.points[self.points.length-1])
    })
    
  }
}