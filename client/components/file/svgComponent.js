import React from 'react';

var curvetype = new ReactiveVar('algo1'),
  isClosed = new ReactiveVar(1),
  attd = new ReactiveVar(30)

var draw, draw2
var gr1, gr
var pathgr
var pointsgr
var circlegr
shapes = []
var panZ
var turtleLayer
turtleControl = ''
var turtleMode = 0

Tracker.autorun(function() {
  var c = isClosed.get()
  var a = attd.get()
  Tracker.nonreactive(function() {
    updateShape()
  })
})

Tracker.autorun(function() {
  var ct = curvetype.get()
  Tracker.nonreactive(function() {
    resetShape()
  })
})

SvgComponent = React.createClass({
  render: function render() {
    $('body').prepend('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" id="drawing"></svg>')
    $('head').append('<script type="text/javascript" src="/api/file/oroboro/svg/libspiro.js" ></script>')
    $('head').append('<script type="text/javascript" src="/api/file/oroboro/svg/matrix.js" ></script>')
    $('head').append('<script type="text/javascript" src="/api/file/oroboro/svg/LUDecomposition.js" ></script>')
    $('head').append('<script type="text/javascript" src="/api/file/oroboro/svg/panzoom.js" ></script>')
    $('head').append('<script type="text/javascript" src="/api/file/oroboro/svg/ellipse.js" ></script>')

    // no scroll bar
    $('html').css({overflow: 'hidden'})

    draw = SVG('drawing')

    return React.createElement(
      "g",
      { id: "content"},
      React.createElement(EditMenu),
      React.createElement(SVGCanvas)
      )
  }
})

var marg = 2, margy = 5
var dim = 70

EditMenu = React.createClass({
  render: function render() {
    
    var d = 15.625*1.5
    var newsh = draw.group()
    newsh.image('/icons/convert.svg')
      .size(2*d, 2*d)
      .cx(marg+dim).cy(margy+dim*6+d)
      .opacity(0.4)
    newsh.circle(2*d)
      .fill('#000000').opacity(0.1)
      .cx(marg+dim).cy(margy+dim*6+d)
      .on('click', function() {
        savePoints()
      })
      .on('mousedown', function() {
        this.opacity(0.3)
      })
      .on('mouseup', function() {
        this.opacity(0.1)
      })
    newsh.image('/icons/plus.svg')
      .size(2*d, 2*d)
      .cx(marg+dim).cy(margy+dim*6+3*d)
      .opacity(0.3)
    newsh.circle(2*d)
      .fill('#000000').opacity(0.1)
      .cx(marg+dim).cy(margy+dim*6+3*d)
      .on('click', function() {
        setShape()
      })
      .on('mousedown', function() {
        this.opacity(0.3)
      })
      .on('mouseup', function() {
        this.opacity(0.1)
      })
    newsh.image('/icons/view.svg')
      .size(2*d, 2*d)
      .cx(marg+dim-2*d).cy(margy+dim*6+d)
      .opacity(0.3)
    newsh.circle(2*d)
      .fill('#000000').opacity(0.3)
      .cx(marg+dim-2*d).cy(margy+dim*6+d)
      .on('click', function() {
        if(pointsgr.opacity() == 1) {
          pointsgr.opacity(0)
          SVG.get('testlayer').opacity(0)
          this.opacity(0.1)
        }
        else {
          pointsgr.opacity(1)
          SVG.get('testlayer').opacity(1)
          this.opacity(0.3)
        }
      })
    newsh.circle(2*d)
      .fill('#000000').opacity(0.1)
      .cx(marg+dim-2*d).cy(margy+dim*6+3*d)
      .on('click', function() {
        combineShapes()
      })
      .on('mousedown', function() {
        this.opacity(0.3)
      })
      .on('mouseup', function() {
        this.opacity(0.1)
      })
    newsh.circle(2*d)
      .fill('#000000').opacity(0.1)
      .cx(marg+dim-2*d).cy(margy+dim*6+5*d)
      .on('click', function() {
        combineShapes2()
      })
      .on('mousedown', function() {
        this.opacity(0.3)
      })
      .on('mouseup', function() {
        this.opacity(0.1)
      })
    newsh.image('/icons/teeth.svg')
      .size(2*d, 2*d)
      .cx(marg+dim).cy(margy+dim*6+5*d)
      .opacity(0.3)
    newsh.circle(2*d)
      .fill('#000000').opacity(0.1)
      .cx(marg+dim).cy(margy+dim*6+5*d)
      .on('click', function() {
        combineTeeth()
      })
      .on('mousedown', function() {
        this.opacity(0.3)
      })
      .on('mouseup', function() {
        this.opacity(0.1)
      })
    newsh.circle(2*d)
      .fill('#000000').opacity(0.1)
      .cx(marg+dim-2*d).cy(margy+dim*6+7*d)
      .on('click', function() {
        turtleMode = 1
        toggleTurtle()
      })
      .on('mousedown', function() {
        this.opacity(0.3)
      })
      .on('mouseup', function() {
        this.opacity(0.1)
      })
    return React.createElement(
      "g",
      { id: "editMenu"},
      React.createElement(OController.ButtonController, {buttonType: "ChoiceButton", svg: "drawing", radius: dim, position: {x: marg+dim, y: margy+dim}, defaultValue: 'algo1',
          valuebuttons: [ 
            { value: 'algo1', url: '/icons/algo1.svg'},
            { value: 'spiro', url: '/icons/spiro.svg'},
            { value: 'simple', url: '/icons/simple.svg'},
            { value: 'ortho', url: '/icons/ortho.svg'},
            { value: 'gear', url: '/icons/teeth.svg'},
            { value: 'ellipse', url: '/icons/ellipse.svg'},
            { value: 'link', url: '/icons/link.svg'},
            { value: 'rounded', url: '/icons/arcs.svg'}
          ],
          hidden: false,
          minimizeCallback: function(button) {
            //button.destroy()
          },
          callback: function(value) {
            curvetype.set(value)
          }
        }),
      React.createElement(OController.ButtonController, {buttonType: "ChoiceButton", svg: "drawing", radius: dim, position: {x: marg+dim, y: margy+dim*3}, defaultValue: 1,
          valuebuttons: [ 
            { value: 1, url: '/icons/closed.svg'},
            { value: 0, url: '/icons/open.svg'},
          ],
          hidden: false,
          minimizeCallback: function(button) {
            //button.destroy()
          },
          callback: function(value) {
            isClosed.set(value)
          }
        }),
      React.createElement(OController.ButtonController, {buttonType: "Button", svg: "drawing", radius: dim, position: {x: marg+dim, y: margy+dim*5}, defaultValue: 30,
          range: {min: 0, max: 500}, decimals: 0,
          hidden: false,
          minimizeCallback: function(button) {
            //button.destroy()
          },
          callback: function(value) {
            attd.set(value)
          }
        })
    )
  }
})


SVGCanvas = React.createClass({
  render: function render() {

    draw.group().attr('id', 'testlayer')
    //gr1 = draw.group().attr('id', 'canvaslayer1')
    //draw2 = gr1.nested().attr('id', 'canvassvg')
    //gr = draw2.group().attr('id', 'canvaslayer')
    gr = draw.group().attr('id', 'canvaslayer')//.addClass('svg-pan-zoom_viewport')
    pathgr = gr.group().attr('id', 'pathlayer')
    clickgr = gr.group().attr('id', 'clicklayer')
    pointsgr = gr.group().attr('id', 'pointslayer')
    turtleLayer = gr.group().attr('id', 'turtleLayer')

    /*panZ = svgPanZoom('#drawing', {
      viewportSelector: '.svg-pan-zoom_viewport',
      zoomScaleSensitivity: 0.1,
      minZoom: 0.05,
      dblClickZoomEnabled: false,
      panEnabled: false,
      zoomEnabled: false,
      fit: false,
      //contain: false
      //fit: true,
      //contain: true
    })*/

/*if(panZ.isPanEnabled)
          panZ.disablePan()
        else
          panZ.enablePan()
        if(panZ.isZoomEnabled())
          panZ.disableZoom()
        else
          panZ.enableZoom()*/

    /*panZ = SVGPan(document.getElementById('canvassvg'), {
                enablePan: true,
                enableZoom: true,
                enableDrag: false,
                zoomScale: 0.2,
                callback: function(a){
                    
                }
            });*/

    // Initialize a first shape
    setShape()

    clickgr.rect('100%', '100%')
      .x(dim*2)
      .fill('rgba(0,0,0,0)')
      .on('click', function(e) {
        if(!turtleMode)
          shapes[shapes.length-1].addPoint(e.pageX, e.pageY, e)
        else
          toggleTurtle([e.pageX, e.pageY])
      })

    return React.createElement(
      'g',
      React.createElement(
        'g'
      )
    )
  }
})

function getParams() {
    return {
        curvetype: curvetype.get(),
        closed: isClosed.get(),
        attd: attd.get(),
        parent: pathgr,
        pParent: pointsgr
    }
}

function setShape(p = getParams()) {
    var sh
    switch(p.curvetype) {
        case 'spiro':
            sh = new SpiroShape(p)
            break;
        case 'algo1':
            sh = new Algo1Shape(p)
            break
        case 'simple':
            sh = new SimpleShape(p)
            break
        case 'ortho':
            sh = new OrthoShape(p)
            break
        case 'gear':
            sh = new GearShape(p)

            break
        case 'ellipse':
            sh = new EllipseShape(p)
            break
        case 'link':
            sh = new LinkShape(p)
            break
        case 'rounded':
            sh = new RoundedShape(p)
            break
        default:
            sh = new SimpleShape(p)
    }
    if(sh.closed)
        sh.svg.stroke({color:'rgba(0,0,0,0.5', width:1}).fill({color: '#272822', opacity: 0.2})
    else
        sh.svg.fill('none').stroke({color: '#000000', width: 1}).opacity(0.8)
    shapes.push(sh)
}

function updateCanvas() {
    var p = getParams()
    var objs = shapes.map(function(sh) {
        var pp = cloneObj(p)
        pp.closed = sh.closed
        pp.attd = sh.attd || pp.attd
        pp.points = sh.pointsToOro()
        sh.distroy()
        return pp
    })
    shapes = []
    objs.forEach(function(p) {
        setShape(p)
    })
}

function resetShape() {
    var sh = shapes[shapes.length-1]
    if(!sh) return
    var p = getParams()
    p.points = sh.pointsToOro()
    sh.distroy()
    shapes.splice(shapes.length-1, 1)
    setShape(p)
}

function updateShape() {
    var sh = shapes[shapes.length-1]
    if(!sh) return
    var p = getParams()
    sh.closed = p.closed
    sh.attd = p.attd
    sh.redraw()
    if(!sh.closed) {
      sh.svg.fill('none').stroke({color: '#000000', width: 1}).opacity(0.8)
    }
    else
      sh.svg.fill({color: '#272822', opacity: 0.2}).stroke({width:1, color:'rgba(0,0,0,0.5'})
}

function combineShapes() {
    if(shapes.length < 2)
        return
    var p = getParams()
    var len = shapes.length
    var sh1 = shapes[len-1]
    var sh2 = shapes[len-2]
    if(['spiro', 'algo1'].indexOf(sh1.curvetype) == -1) {
        p.points = combinePaths(shapes[len-1].pointsToOro(), shapes[len-2].pointsToOro())
    }
    else {
        p.points = combineCPaths(shapes[len-1].pointsToOro(), shapes[len-2].pointsToOro(), sh1)
    }
    p.closed = sh2.closed
    p.attd = sh2.attd
    p.curvetype = sh2.curvetype
    sh1.svg.stroke({color: "#C91313", width: 1})
    console.log(p)
    //sh1.distroy()
    //shapes.splice(shapes.length-1, 1)
    setShape(p)
}
var newp
function combineShapes2() {
    if(shapes.length < 2)
        return
    var p = getParams()
    var len = shapes.length
    var sh1 = shapes[len-1]
    var sh2 = shapes[len-2]
    /*if(['spiro', 'algo1'].indexOf(sh2.curvetype) == -1) {
        p.points = combinePaths2(sh1.pointsToOro(), sh2.pointsToOro(), sh1, sh2)
        p.closed = sh2.closed
        p.attd = sh2.attd
        p.curvetype = sh2.curvetype
        console.log(p)
        sh1.svg.stroke({color: "#C91313", width: 1})
        //sh1.distroy()
        //shapes.splice(shapes.length-1, 1)
        setShape(p)
    }
    else {*/
        newp = sh1.parent.path(sh1.svg.attr('d')).fill('none').stroke({color: "#C91313"})
        drawPoints(newp)
        sh1.svg.plot(combineCPaths2(sh1, sh2))
        sh1.svg.opacity(0.3).fill('#000000').stroke({color: '#20B2AA', width: 1})
    //}
}

function combineTeeth() {
    if(shapes.length < 2)
        return
    var p = getParams()
    var len = shapes.length
    var sh1 = shapes[len-1]
    var sh2 = shapes[len-2]
    newp = sh1.parent.path(sh1.svg.attr('d')).fill('none').stroke({color: "#C91313"})
    drawPoints(newp)
    sh1.svg.plot(combineCTeeth(sh1, sh2))
    sh1.svg.opacity(0.4).fill('#000000').stroke({color: '#20B2AA', width: 1})
}

function savePoints() {
  shapes[shapes.length-1].showAll()
}

function drawPoints(path) {
    var pp = path.array().value,
    par = SVG.get('testlayer')
    for(var i=0; i<pp.length-1;i++) {
        if(pp[i][0] == 'C') {
            par.circle(5).cx(pp[i][1]).cy(pp[i][2]).fill('#272822')
            par.circle(5).cx(pp[i][3]).cy(pp[i][4]).fill('#272822')
            par.line(getx(pp[i-1]), gety(pp[i-1]), pp[i][1], pp[i][2]).stroke({color: '#272822', width:1})
            par.line(pp[i][3], pp[i][4], pp[i][5], pp[i][6]).stroke({color: '#272822', width:1})
        }
    }
}

function toggleTurtle(p) {
  if(!turtleControl) {
    setShape()
    turtleControl = new TurtleController({
      rad: 60, parent: turtleLayer, pos: p || [200,200],
      callback: function(points) {
        var sh = shapes[shapes.length-1]
        if(!sh) return
        //sh.points = points
        //sh.redraw()
        console.log(JSON.stringify(points))
        sh.svg.plot(points)
      }
    })
    turtleControl.create()
  }
  else
    turtleControl.toggle()
}