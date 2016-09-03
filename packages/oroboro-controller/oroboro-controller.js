var circle = React.createFactory('circle')
var path = React.createFactory('path')


OController.ButtonController = React.createClass({
  createButton (obj) {
    var button = new OController[obj.buttonType](SVG(obj.svg), obj)
    button.show()
  },
 
  render: function() {
    return React.createElement(
      "g", 0.5, 
      this.createButton(this.props)
    )
  }
});

/*OController.ControllerSet = React.createClass({
  createButtons (obj) {
    var button = new OController[obj.buttonType](SVG(obj.svg), obj)
    button.show()
  },
 
  render: function() {
    return React.createElement(
      "g", 0.5, 
      this.createButtons(this.props)
    )
  }
});*/

OController.Button = class {
  constructor(draw, obj) {
    var self = this
    this.draw = draw
    this.id = Random.id()
    this.button = draw.group().attr('id', 'ocontroller_' + this.id)
    this.radius = obj.radius
    this.diameter = obj.radius*2
    this.value = new ReactiveVar(obj.defaultValue)
    this.range = obj.range
    this.valuebuttons = obj.valuebuttons
    this.valuebuttonstype = 'fixed'
    this.components = {}
    this.position = obj.position
    this.min = obj.range && obj.range.min ? obj.range.min : 0
    this.max = obj.range && obj.range.max ? obj.range.max : 270
    this.mid = (this.min + this.max) / 2
    this.type = "range"
    this.callback = obj.callback
    this.minimizeCallback = obj.minimizeCallback
    this.maximizeCallback = obj.maximizeCallback

    this.minangle = 0
    this.maxangle = 270
    this.midangle = this.minangle + (this.minangle + this.maxangle) / 2
    if(obj.decimals || obj.decimals == 0)
      this.decimals = obj.decimals
    else
      this.decimals = obj.decimals
    this.hidden = new ReactiveVar(obj.hidden)

    this.defaultColor = '#4d4d4d'
    this.defaultOpacity = obj.opacity || 0.4
    this.defaults = {
      outercircle: {
        stroke: {
          color: this.defaultColor,
          width: this.radius/35
        },
        fill: 'rgba(0,0,0,0)',
        opacity: this.defaultOpacity,
        radius: this.radius
      },
      innercircle: {
        stroke: {
          color: this.defaultColor,
          width: this.radius / 200
        },
        fill: 'rgba(0,0,0,0)',
        opacity: this.defaultOpacity,
        radius: this.radius * 7 / 10
      },
      smallcircle: {
        fill: this.defaultColor,
        opacity: this.defaultOpacity,
        radius: this.radius / 80
      },
      arrowup: {
        fill: this.defaultColor,
        opacity: this.defaultOpacity
      },
      arrowdown: {
        fill: this.defaultColor,
        opacity: this.defaultOpacity
      },
      knobup : {
        stroke: {
          color: this.defaultColor,
          width: this.radius/35
        },
        fill: this.defaultColor,
        opacity: this.defaultOpacity,
        path: 'M478.988525390625 120.81394958496094C488.4335632324219 109.49141693115234 534.7097778320312 108.07914733886719 546.0322265625 121.45960998535156C554.6903686523438 132.47882080078125 525.97998046875 186.000732421875 511.8123474121094 186.000732421875C496.3739318847656 186.78781127929688 469.4510498046875 132.31695556640625 478.8960876464844 121.60104370117188Z'
      },
      knobdown : {
        stroke: {
          color: this.defaultColor,
          width: this.radius/35
        },
        fill: this.defaultColor,
        opacity: this.defaultOpacity
      },
      middlecircle: {
        stroke: {
          color: this.defaultColor,
          width: this.radius/35
        },
        fill: this.defaultColor,
        opacity: this.defaultOpacity,
        radius: this.radius / 16 * 5
      }
    }
    this.defaults.knob = {
        stroke: {
          color: this.defaultColor,
          width: this.radius/35
        },
        fill: this.defaultColor,
        opacity: this.defaultOpacity,
        path: "M511.213 733.891C428.34 733.891 362 691.558 362 512C362 332.442 496.42 187.787 512 187C528.1 187 662 332.442 662 512C662 691.558 594.1 733.9 511.213 733.9Z",
        size: {
          width: this.radius * 3 / 4 * 0.83,
          height: this.radius * 546.9 / 400 * 0.83,
        },
        originalwidth: 300,
        originalheight: 546.9,
        maxAngle: self.midangle * Math.PI/180,
        cx: self.position.x,
        cy: self.position.y - 46.2*self.radius / 400  //y=450 pt 496.42 centru
      }
    this.defaults.margincircle = {
      radius: (self.defaults.outercircle.radius - self.defaults.innercircle.radius) / 2 - (parseFloat(self.defaults.outercircle.stroke.width) / 2) / 2
    }
    this.defaults.font = {
      family:   'Helvetica'
    , size:     80 * self.radius / 400 //60 for radius = 400
    , anchor:   'middle'
    //, leading:  '1.5em'
    }
    
    this.defaults.valuebuttons = {
      font: JSON.parse(JSON.stringify(this.defaults.font))
    }
    this.defaults.valuebuttons.font.size = 40 * self.radius / 400 //40 for radius = 400
  }

  show() {
    var self = this
    self.components.anigr = self.button.group()

    this.createStructure()
    this.createKnob()
    this.createCurrentValue()
    
    self.components.middlecircle = 
      self.button.circle(2 * self.defaults.middlecircle.radius)
      .stroke(self.defaults.middlecircle.stroke)
      .fill(self.defaults.middlecircle.fill)
      .cx(self.position.x)
      .cy(self.position.y)
      .opacity(self.defaults.middlecircle.opacity)
      .click(function() {
        if(self.hidden.get())
          self.hidden.set(false)
        else
          self.hidden.set(true)
      })

    this.createValueButtons()
    this.createMenu()
    this.trackValue()
    this.trackHidden()
    
  }

  trackHidden() {
    var self = this
    Tracker.autorun(function() {
      var hidden = self.hidden.get()

      if(hidden) {
        self.components.anigr.animate(400, SVG.easing.circIn, 0).scale(self.defaults.middlecircle.radius / self.radius).opacity(0).after(function() {
          if(self.minimizeCallback)
            self.minimizeCallback(self)
        })
        
      }
      else {
        self.components.anigr.animate(600, SVG.easing.elastic, 0).scale(1).opacity(1).after(function() {
          if(self.maximizeCallback)
            self.maximizeCallback(self)
        })
        
      }
    })
  }

  createStructure() {
    var self = this
    self.components.outercircle = 
      self.button.circle(2 * self.defaults.outercircle.radius)
      .stroke(self.defaults.outercircle.stroke)
      .fill(self.defaults.outercircle.fill)
      .cx(self.position.x)
      .cy(self.position.y)
      .opacity(self.defaults.outercircle.opacity)
    self.components.innercircle = 
      self.button.circle(2 * self.defaults.innercircle.radius)
      .stroke(self.defaults.innercircle.stroke)
      .fill(self.defaults.innercircle.fill)
      .cx(self.position.x)
      .cy(self.position.y)
      .opacity(self.defaults.innercircle.opacity)

    self.components.anigr.add(self.components.outercircle)
    self.components.anigr.add(self.components.innercircle)
  }

  createCurrentValue() {
    var self = this
    self.components.currentValue = self.button.text('')
    self.components.currentValue.cx(self.position.x).cy(self.position.y-self.defaults.font.size)
      .font(self.defaults.font)
  }

  createKnob() {
    var self = this
    self.components.knob = 
      self.button.path(self.defaults.knob.path)
      .size(self.defaults.knob.size.width, self.defaults.knob.size.height)
      .stroke(self.defaults.knob.stroke)
      .fill(self.defaults.knob.fill)
      .cx(self.defaults.knob.cx)
      .cy(self.defaults.knob.cy)
      .opacity(self.defaults.knob.opacity)
      .draggy()
    self.components.anigr.add(self.components.knob)

    self.components.knob.on("beforedrag", function(event) {
    }).on("dragstart", function(event) {
    }).on("dragmove", function(event) {
      self.ondragmove(this, event)
    }).on("dragend", function(event) {
    })
  }

  createValueButtons() {
    var self = this
    var C = self.components

    var elements = self.createValueButtonsElements()
    self.createValueButtonsPositions(elements)

    var correction = self.defaults.valuebuttons.font.size / 2
    if(C.startValue)
      C.startValue.x(C.startvaluebutton.cx()).y(C.startvaluebutton.cy() - correction)
    if(C.stopValue)
    C.stopValue.x(C.stopvaluebutton.cx()).y(C.stopvaluebutton.cy() - correction)
  }

  createValueButtonsElements() {
    var self = this
    var C = self.components
    var deltarad = self.defaults.margincircle.radius
    
    C.startValue = self.button.text(self.min.toFixed(0)).font(self.defaults.valuebuttons.font)
    C.stopValue = self.button.text(self.max.toFixed(0)).font(self.defaults.valuebuttons.font)
    
    C.startvaluebutton = self.button.circle(2*deltarad)
      .fill(self.defaultColor).opacity(self.defaultOpacity)
      .click(function() {
        self.value.set(self.min)
      }).attr('type', 'startvalue')
    C.stopvaluebutton = self.button.circle(2*deltarad)
      .fill(self.defaultColor).opacity(self.defaultOpacity)
      .click(function() {
        self.value.set(self.max)
      }).attr('type', 'stopvalue')
    C.middlevaluebutton = self.button.circle(2*deltarad)
      .fill(self.defaultColor).opacity(self.defaultOpacity)
      .click(function() {
        self.value.set(self.mid)
      }).attr('type', 'middlevalue')

    C.anigr.add(C.startValue)
    C.anigr.add(C.startvaluebutton)
    C.anigr.add(C.stopValue)
    C.anigr.add(C.stopvaluebutton)
    C.anigr.add(C.middlevaluebutton)

    return [
      C.startvaluebutton,
      C.middlevaluebutton,
      C.stopvaluebutton
    ]
  }

  createValueButtonsPositions(elements) {
    var self = this
    var strokefactor = parseFloat(self.components.outercircle.attr('stroke-width')) / 2
    var deltarad = (self.defaults.outercircle.radius - self.defaults.innercircle.radius) / 2
    var centerdist = self.defaults.innercircle.radius + deltarad
    var deltastartx, deltastarty, angle = self.minangle, tempangle, positions = []
    var len = elements.length
    if(len == 1) {
        var tempangle = 3/2 * Math.PI
        positions.push(0)
        deltastartx = centerdist * Math.cos(tempangle)
        deltastarty = centerdist * Math.sin(tempangle)
        elements[0].cx(self.position.x + deltastartx).cy(self.position.y + deltastarty)
      }
    else {
      var deltaangle = (self.maxangle - self.minangle) / (elements.length - 1)

      if(len < 4 && self.valuebuttonstype != 'fixed') {
        deltaangle = (360 - self.minangle) / elements.length
        if(len % 2 == 0)
          angle = self.midangle - deltaangle/2
        else 
          angle = self.midangle - deltaangle
      }
      elements.forEach(function(e) {
        tempangle = angle
        if(tempangle >= self.midangle)
          tempangle = tempangle - self.midangle
        else
          tempangle = tempangle + (360 - self.midangle)

        positions.push(tempangle * Math.PI / 180)
        // the formula works for X axis (right) = 0 degrees, so we have to transform
        if(tempangle >= 90)
          tempangle -= 90
        else
          tempangle = 360 - 90 + tempangle
        tempangle = tempangle * Math.PI / 180
        
        deltastartx = centerdist * Math.cos(tempangle)
        deltastarty = centerdist * Math.sin(tempangle)
        e.cx(self.position.x + deltastartx).cy(self.position.y + deltastarty)
        angle += deltaangle
      })
    }

    return positions
  }

  createMenu() {
    var elements = this.createMenuElements()
    this.createMenuPositions(elements)
  }

  createMenuElements() {
    return []
  }

  createMenuPositions(elements) {
    if(elements.length == 0)
      return
    var self = this
    var strokefactor = parseFloat(self.components.outercircle.attr('stroke-width')) / 2
    var deltarad = (self.defaults.outercircle.radius - self.defaults.innercircle.radius) / 2
    var centerdist = self.defaults.innercircle.radius + deltarad
    var deltastartx, deltastarty, angle, tempangle
    var len = elements.length
    var midangle = self.maxangle + (360 - self.maxangle + self.minangle) / 2
    // so it does not overlap with start and stop valuebuttons
    var bbox = elements[0].bbox()
    var extraangle = 2* Math.asin((self.defaults.margincircle.radius/2) / centerdist) + 2 * Math.asin(bbox.w / 2 / centerdist) * 180 / Math.PI
      
    var deltaangle = (360 - self.maxangle + self.minangle - extraangle*2) / (len+1)

    if(len % 2 == 0)
      angle = midangle + deltaangle / 2 + (len - 2) / 2 * deltaangle
    else
      angle = midangle + (len-1) / 2 * deltaangle

    elements.forEach(function(e) {
      tempangle = angle
      if(tempangle >= self.mid)
        tempangle = tempangle - self.midangle
      else
        tempangle = tempangle + (360 - self.midangle)
      // the formula works for X axis (right) = 0 degrees, so we have to transform
      if(tempangle >= 90)
        tempangle -= 90
      else
        tempangle = 360 - 90 + tempangle

      tempangle = tempangle * Math.PI / 180
      deltastartx = centerdist * Math.cos(tempangle)
      deltastarty = centerdist * Math.sin(tempangle)
      e.cx(self.position.x + deltastartx).cy(self.position.y + deltastarty)
      angle -= deltaangle
    })

  }

  trackValue() {
    var self = this
    Tracker.autorun(function() {
      var value = self.value.get()
      //console.log(value)
      if(value || value == 0) {
        if(self.callback) {
          self.callback(value, self)
        }
        var val = value.toFixed(self.decimals)
        self.components.currentValue.text(val)
        if(val.length < 3) {
          self.components.currentValue
            .font({size: self.defaults.font.size*2})
            .cy(self.position.y)
        }
        else if(val.length < 5) {
          self.components.currentValue
            .font({size: self.defaults.font.size*1.5})
            .cy(self.position.y)
        }
        else
          self.components.currentValue
            .font({size: self.defaults.font.size})
            .cy(self.position.y)
        var angle = self.valueAngle(value)
        m = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0}
        m = rotateMatrix(m, angle, {x:self.position.x, y:self.position.y})
        self.components.knob.transform(m)
      }
    })
  }

  ondragmove(el, event) {
    var self = this
    var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});
      
    if(angle > self.defaults.knob.maxAngle && angle < Math.PI)
      angle = self.defaults.knob.maxAngle
    else if(angle > Math.PI && angle < (2*Math.PI - self.defaults.knob.maxAngle))
      angle = 2*Math.PI - self.defaults.knob.maxAngle

    m = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0}
    m = rotateMatrix(m, -angle, {x: self.position.x, y: self.position.y})
    el.transform(m)
    var val = self.angleValue(angle)
    self.value.set(val)
    el.cx(self.defaults.knob.cx).cy(self.defaults.knob.cy)
  }

  angleValue(angle) {
    var self = this
    var val = angle*180/Math.PI

    if(val >= 0 && val <= self.midangle)
      val = val + self.midangle
    else
      val = val - (360 - self.midangle)

    var ratio = (self.maxangle - self.minangle) / val
    return (self.min + (self.max - self.min) / ratio)
  }

  valueAngle(value) {
    var self = this
    if(value != self.min) {
      var ratio = (self.max - self.min) / (value - self.min)
      value = self.minangle + (self.maxangle - self.minangle) / ratio
    }
    else
      value = self.minangle

    if(value >= self.midangle)
      value = value - self.midangle
    else
      value = value + (360 - self.midangle)
    var angle = value * Math.PI / 180

    return -angle
  }

  destroy() {
    for(c in this.components) {
      if(this.components[c] instanceof SVG.Element)
        this.components[c].remove()
      else
        this.components[c].forEach(function(k) {
          if(k instanceof SVG.Element)
            k.remove()
        })
    }
  }
}


OController.ChoiceButton = class extends OController.Button {
  constructor(draw, obj) {
    super(draw, obj)
    this.type = 'choice'
    this.valuebuttonstype = 'loose'
  }

  createValueButtons(callback) {
    callback = callback || this.callback
    var self = this
    var C = self.components
    var value = self.value.get(), defaultValue
    // create elements
    var deltarad = self.defaults.margincircle.radius
    C.valuebuttons = []
    self.valuebuttons.forEach(function(i, ind) {
      C.valuebuttons[ind] = C.anigr.image(i.url).attr('data-value', i.value).size(2*deltarad, 2*deltarad)
        .attr('data-url', i.url)
        .click(function() {
          self.value.set(this.attr('data-value'))
          if(callback) {
            console.log('click on value button')
            callback(this.attr('data-value'), this)
          }
        })
      defaultValue = self.compareValue(value, i, defaultValue)
    })

    self.setDefaultValue(defaultValue)
    self.positions = self.createValueButtonsPositions(self.components.valuebuttons)
  }

  compareValue(value, i, defaultValue) {
    if(value == i.value)
      return i
    return defaultValue
  }

  setDefaultValue(i) {
    var self = this
    self.components.currentValue = self.button.image(i.url).size(2*self.defaults.middlecircle.radius, 2*self.defaults.middlecircle.radius)
      .cx(self.position.x).cy(self.position.y)
  }

  trackValue() {
    var self = this
    Tracker.autorun(function() {
      var value = self.value.get()
      if(value || value == 0) {
        if(self.callback)
          self.callback(value, self)
        self.components.valuebuttons.forEach(function(i, ind) {
          if(i.attr('data-value') == value || i.attr('data-value') == String(value)) {
            var angle = getAngle(self.position, {x: i.cx(), y: i.cy()})
            m = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0}
            m = rotateMatrix(m, -angle, {x: self.position.x, y: self.position.y})
            self.components.knob.transform(m)
            self.components.currentValue.load(i.attr('data-url')).back()
          }
        })
      }
    })
  }

  ondragmove(el, event) {
    var self = this
    var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});
      
    if(angle > self.defaults.knob.maxAngle && angle < Math.PI)
      angle = self.defaults.knob.maxAngle
    else if(angle > Math.PI && angle < (2*Math.PI - self.defaults.knob.maxAngle))
      angle = 2*Math.PI - self.defaults.knob.maxAngle

    var min = 0, mindist = 7
    self.positions.forEach(function(p, ind) {
      if(Math.abs(p - angle) < mindist) {
        min = ind
        mindist = Math.abs(p - angle)
      }
    })
    self.value.set(self.valuebuttons[min].value)
    m = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0}
    m = rotateMatrix(m, -self.positions[min], {x: self.position.x, y: self.position.y})
    el.transform(m)
    el.cx(self.defaults.knob.cx).cy(self.defaults.knob.cy)
  }

}

OController.MultipleChoiceButton = class extends OController.ChoiceButton {
  constructor(draw, obj) {
    super(draw, obj)
  }

  createCurrentValue() {
    var self = this
    this.components.currentValue = this.button.group()
    this.components.currentValueLinks = this.components.anigr.group()
  }

  createValueButtons() {
    super()
    var self = this
    self.components.valuebuttons.forEach(function(i, ind) {
      i.click(null)
      i.click(function() {
        var values = self.value.get()
        var ind = values.indexOf(this.attr('data-value'))
        if(ind == -1)
          values.push(this.attr('data-value'))
        else
          values.splice(ind, 1)
        self.value.set(values)
      })
    })
  }

  createKnob() {}

  trackValue() {
    var self = this
    Tracker.autorun(function() {
      var values = self.value.get()
      var icons = []
      if(values && values.length > 0) {
        self.valuebuttons.forEach(function(i, ind) {
          if(values.indexOf(i.value) != -1) {
            icons.push(i)
          }
        })
      }
      Tracker.nonreactive(function() {
        self.setDefaultValue(icons)
      })
    })
  }

  compareValue(values, i, defaultValues) {
    if(!defaultValues)
      defaultValues = []
    if(values.indexOf(i.value) != -1)
      defaultValues.push(i)
    return defaultValues
  }

  setDefaultValue(values) {
    var self = this
    self.components.currentValue.clear()
    self.arrangeDefaultValues(values)
    self.components.currentValueLinks.clear()
    this.createLinks(values)
  }

  arrangeDefaultValues(values) {
    var self = this
    var radius = self.defaults.middlecircle.radius, len = values.length
    var deltaangle = 2*Math.PI / len
    var angle = 0, pos

    if(len == 1)
      self.components.currentValue.image(values[0].url).size(2*radius, 2*radius)
        .attr('data-value', values[0].value).attr('data-url', values[0].url)
        .cx(self.position.x).cy(self.position.y).back()
    else {
      var dist
      if(len < 3) {
        r = radius / len
        dist = r
      }
      else {
        // circle inscribed in a sector:
        r = Math.sin(deltaangle / 2) * radius / (1 + Math.sin(deltaangle / 2))
        dist = radius - r
      }
      values.forEach(function(i) {
        pos = pointCoordAngle(self.position, angle, dist)
        self.components.currentValue.image(i.url).size(2*r, 2*r)
          .attr('data-value', i.value).attr('data-url', i.url)
          .cx(pos.x).cy(pos.y).back()
        angle += deltaangle
      })
    }
  }

  createLinks(values) {
    var self = this
    var values = values.map(function(v) {
      return v.value
    })
    var icons = []
    self.components.valuebuttons.forEach(function(i) {
      if(values.indexOf(i.attr('data-value')) != -1)
        icons.push(i)
    })

    var deltaangle = 3 / 2 * Math.PI / (self.components.valuebuttons.length - 1),
      r = self.defaults.middlecircle.radius + self.defaults.middlecircle.stroke.width/2,
      deltarad = (self.defaults.outercircle.radius - self.defaults.middlecircle.radius) / 2,
      middlePointDist = r + deltarad*2/3,
      middleAttrDist1 = middlePointDist - 30 * self.radius / 400, //30,
      middleAttrDist2 = middlePointDist + 30 * self.radius / 400,//30,
      centerAttrDist = middleAttrDist1,
      centerAttrDist2 = r + 10 * self.radius / 400,
      elemAttrDist2 = self.defaults.margincircle.radius + 10 * self.radius / 400,
      path, elem

    if(deltaangle > Math.PI/2)
      deltaangle = Math.PI/2

    icons.forEach(function(i, ind) {
      var centerPoint1 = pointCoord(self.position, {x: i.cx(), y: i.cy()}, -deltaangle/2, r)
      var centerPoint2 = pointCoord(self.position, {x: i.cx(), y: i.cy()}, +deltaangle/2, r)
      var middlePoint = pointCoord(self.position, {x: i.cx(), y: i.cy()}, 0, middlePointDist)
      var elemPoint1 = pointCoord({x: i.cx(), y: i.cy()}, self.position, Math.PI/4, self.defaults.margincircle.radius)
      var elemPoint2 = pointCoord({x: i.cx(), y: i.cy()}, self.position, -Math.PI/4, self.defaults.margincircle.radius)

      var middlePointAttr1 = pointCoord(self.position, {x: i.cx(), y: i.cy()}, 0, middleAttrDist1)
      var middlePointAttr2 = pointCoord(self.position, {x: i.cx(), y: i.cy()}, 0, middleAttrDist2)

      var centerPoint1Attr1 = pointCoord(self.position, {x: i.cx(), y: i.cy()}, -deltaangle/2, centerAttrDist)
      var centerPoint1Attr2 = pointCoord(self.position, {x: i.cx(), y: i.cy()}, -deltaangle/4, centerAttrDist2)

      var centerPoint2Attr1 = pointCoord(self.position, {x: i.cx(), y: i.cy()}, deltaangle/2, centerAttrDist)
      var centerPoint2Attr2 = pointCoord(self.position, {x: i.cx(), y: i.cy()}, deltaangle/4, centerAttrDist2)

      var elemPoint1Attr2 = pointCoord({x: i.cx(), y: i.cy()}, self.position, Math.PI/8, elemAttrDist2)
      var elemPoint2Attr2 = pointCoord({x: i.cx(), y: i.cy()}, self.position, -Math.PI/8, elemAttrDist2)

      
      path = [ 
        'M', centerPoint2.x, centerPoint2.y,
        'C', centerPoint2Attr2.x, centerPoint2Attr2.y, centerPoint1Attr2.x, centerPoint1Attr2.y, centerPoint1.x, centerPoint1.y,
        'C', centerPoint1Attr1.x, centerPoint1Attr1.y, middlePointAttr1.x, middlePointAttr1.y, middlePoint.x, middlePoint.y,
        'C', middlePointAttr2.x, middlePointAttr2.y, middlePointAttr2.x, middlePointAttr2.y, elemPoint1.x, elemPoint1.y,
        'C', elemPoint1Attr2.x, elemPoint1Attr2.y, elemPoint2Attr2.x, elemPoint2Attr2.y, elemPoint2.x, elemPoint2.y,
        'C', middlePointAttr2.x, middlePointAttr2.y, middlePointAttr2.x, middlePointAttr2.y, middlePoint.x, middlePoint.y,
        'C', middlePointAttr1.x, middlePointAttr1.y, centerPoint2Attr1.x, centerPoint2Attr1.y, centerPoint2.x, centerPoint2.y,
        'Z'
      ].join(' ')

      elem = self.components.currentValueLinks.path(path)
      elem.attr('data-value', i.attr('data-value'))
        .attr('data-url', i.attr('data-url')).fill(self.defaultColor).opacity(self.defaultOpacity)
        .stroke({width: 0})

    })
  }

  createMenuElements() {
    var self = this
    self.components.menu = self.components.anigr.group()
    var strokew = 20 * self.radius / 400
    var r = this.defaults.margincircle.radius - strokew
    var clear = self.components.menu.circle(2*r)
      .fill(self.defaultColor).opacity(self.defaultOpacity)
      .stroke({color: self.defaultColor, width: strokew}).attr('data-select', 'none')
      .click(function() {
        var sel = this.attr('data-select')
        if(sel == 'none') {
          self.value.set([])
          this.attr('data-select', 'all')
        }
        else {
          var values = self.valuebuttons.map(function(i) {
            return i.value
          })
          self.value.set(values)
          this.attr('data-select', 'none')
        }
      })
    return [clear]
  }

}

OController.UnboundButton = class extends OController.Button {
  constructor(draw, obj) {
    super(draw, obj)
    var self = this

    this.type = 'unbound'
    this.valuebuttonstype = 'fixed'
    this.base = obj.base
    if(obj.type == '+') {
      this.min = 0
      this.max  = obj.base
    }
    else {
      this.min = 0 - obj.base
      this.max  = obj.base
    }
    this.mid = this.min + (this.max-this.min) / 2
    this.decimals = 4

    value = transform({base1: 10, base2: obj.base, dec: obj.value})
    this.value.set(parseFloat(value.unit + '.' + value.dec))
    this.pow = new ReactiveVar(parseInt(value.pow))

    this.defaults.pow = {
      path: "m553.15192,770.61139l-33.39972,57.849c-4.26361,7.38519 -11.24054,7.38519 -15.50391,0l-33.40021,-57.849c-4.26361,-7.38501 -0.77505,-13.42566 7.75189,-13.42566l66.80066,0c8.5271,0 12.01489,6.04065 7.75128,13.42566z",
      fill: this.defaultColor,
      opacity: this.defaultOpacity,
      stroke: {
        color: this.defaultColor,
        width: this.radius/35
      },
      size: {
        width: 90.83 * this.radius / 400,
        height: 78.66 * this.radius / 400
      }
    }
    this.defaults.powcircles = {
      radius: this.defaults.margincircle.radius * 2 / 5
    }
    this.defaults.unitcircles = {
      radius: this.defaults.margincircle.radius * 2 / 5
    }
  }

  show() {
    super()
    var self = this
    self.components.powtext = self.button.text(self.pow.get().toString())
    self.components.powtext.x(self.position.x)
      .y(self.position.y + self.defaults.innercircle.radius - self.defaults.valuebuttons.font.size/2)
      .font(self.defaults.valuebuttons.font)
    self.components.pow =
      self.button.path(self.defaults.pow.path)
      .stroke(self.defaults.pow.stroke)
      .fill(self.defaults.pow.fill)
      .opacity(self.defaults.pow.opacity)
      .size(self.defaults.pow.size.width, self.defaults.pow.size.height)
      .cx(self.position.x)
      .cy(self.position.y + self.defaults.innercircle.radius)

    self.components.anigr.add(self.components.powtext)
    self.components.anigr.add(self.components.pow)
  }

  trackValue() {
    var self = this
    Tracker.autorun(function() {
      var value = self.value.get()
      var pow = self.pow.get()
      var angle = self.valueAngle(value)
      m = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0}
      m = rotateMatrix(m, angle, {x:self.position.x, y:self.position.y})
      self.components.knob.transform(m)
      //console.log('tracked value: ' + value)
      // base2 = base for final number, base1 = base for units
      value = transform({dec: value, base2: 10, base1: self.base})
      //console.log('transformed value: ' + JSON.stringify(value))
      value = transform({
        unit: value.unit,
        dec: value.dec,
        pow: parseInt(value.pow) + pow,
        base1: self.base,
        base2: self.base
      })
      //console.log('transformed2 value: ' + JSON.stringify(value))
      var val = value.dec
      if(typeof val == 'number')
        val = val.toFixed(self.decimals)
      else if(val.indexOf('.'))
        val = val.substring(0, val.indexOf('.') + self.decimals + 1)
      self.components.currentValue.text(val)

      if(self.components.powtext)
        self.components.powtext.text(pow.toString())

      /*var angle = self.valueAnglePow(value)
      m = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0}
      m = rotateMatrix(m, angle, {x:self.position.x, y:self.position.y})
      self.components.pow.transform(m)*/
    })
  }

  valueAnglePow(value) {
    var self = this
    if(value != self.min) {
      var ratio = (self.max - self.min) / (value - self.min)
      value = self.minangle + (self.maxangle - self.minangle) / ratio
    }
    else
      value = self.minangle

    if(value >= self.midangle)
      value = value - self.midangle
    else
      value = value + (360 - self.midangle)
    var angle = value * Math.PI / 180

    return -angle
  }

  createValueButtonsElements() {
    var self = this
    var elements = super()

    self.components.stopValue.text('10')

    var C = self.components
    var rad = self.defaults.unitcircles.radius
    var unitcircles = []
    var no = self.max-self.min
    self.components.unitcircles = self.components.anigr.group()
    unitcircles[0] = elements[0]
    for(var i = 1 ; i < no/2; i++) {
      unitcircles[i] = self.components.unitcircles.circle(2 * rad)
        .fill(self.defaultColor).attr('data-value', self.min + i)
        .opacity(self.defaultOpacity)
        .click(function() {
          self.value.set(parseFloat(this.attr('data-value')))
        })
    }
    if(no % 2 == 0)
      unitcircles.push(elements[1])
    else
      elements[1].remove()
    var len = unitcircles.length
    for(var i = Math.floor(no/2)+1, j = len ; i < no; i++, j++) {
      unitcircles[j] = self.components.unitcircles.circle(2 * rad)
        .fill(self.defaultColor).attr('data-value', self.min + j)
        .opacity(self.defaultOpacity)
        .click(function() {
          self.value.set(parseFloat(this.attr('data-value')))
        })
    }
    unitcircles.push(elements[2])
    return unitcircles
  }

  createMenuElements() {
    var self = this
    self.components.menu = self.components.anigr.group()
    var rad = self.defaults.powcircles.radius
    var powcircles = []
    for(var i = 0 ; i < 9; i++) {
      powcircles[i] = self.components.menu.circle(2 * rad)
        .fill(self.defaultColor).attr('data-value', i-4)
        .opacity(self.defaultOpacity)
        .click(function() {
          self.pow.set(parseFloat(this.attr('data-value')))
        })
    }
    return powcircles
  }
}

OController.ColorButton = class extends OController.Button {
  toHex(color) {
    var c = new SVG.Color(color)
    return c.toHex()
  }

  toRgb(color) {
    var c = new SVG.Color(color)
    return c.toRgb()
  }

  toColor(obj) {
    return 'rgba(' + [
      Math.floor(obj.red),
       Math.floor(obj.green),
        Math.floor(obj.blue),
        obj.alpha || 1
    ].join(',') + ')'
  }

  toArray(fill) { 
    fill = this.toRgb(fill)
    fill = fill.substring(4, fill.length-1).split(',')
    return {
      red: parseFloat(fill[0]),
      green: parseFloat(fill[1]),
      blue: parseFloat(fill[2]),
      alpha: 1
    }
  }
}

OController.ColorRGBA = class extends OController.ColorButton {
  constructor(draw, obj) {
    super(draw, obj)
    var self = this

    var fill = self.toRgb(obj.value.fill) || 'rgb(80,80,80)'
    var stroke = self.toRgb(obj.value.stroke) || 'rgb(155,155,155)'
    var so = parseFloat(obj.value['stroke-opacity'])
    var fo = parseFloat(obj.value['fill-opacity'])
    fill = fill.substring(4, fill.length-1).split(',')
    stroke = stroke.substring(4, stroke.length-1).split(',')

    this.red = new ReactiveVar(parseInt(stroke[0]))
    this.green = new ReactiveVar(parseInt(stroke[1]))
    this.blue = new ReactiveVar(parseInt(stroke[2]))
    this.opacity = new ReactiveVar((so || so == 0) ? so : 1)

    this.redf = new ReactiveVar(parseInt(fill[0]))
    this.greenf = new ReactiveVar(parseInt(fill[1]))
    this.bluef = new ReactiveVar(parseInt(fill[2]))
    this.opacityf = new ReactiveVar((fo || fo == 0) ? fo : 1)

    this.defaults.middlecircle.stroke.width = this.radius/10
    self.defaults.middlecircle2 = {
      radius: self.defaults.middlecircle.radius + self.defaults.middlecircle.stroke.width/2,
      stroke : { width : this.radius/70}
    }
    self.defaults.middlecircle2.radius += self.defaults.middlecircle2.stroke.width/2
    this.defaults.margincircle.stroke = {width: 2 * self.radius / 400}
    self.defaults.font.size = 40 * self.radius / 400
    self.decimals = 0
  }

  createValueButtonsElements() {
    var self = this
    var C = self.components
    var deltarad = self.defaults.margincircle.radius
    self.components.middlecircle.opacity(1)
    self.components.middlecircle2 = self.button.circle(2*self.defaults.middlecircle2.radius).fill('none').stroke({color: '#000', width: self.defaults.middlecircle2.stroke.width}).backward()
      .cx(self.position.x).cy(self.position.y)

    // text for middle circle
    self.components.currentValueOF = self.button.text('')
    self.components.currentValueCF = self.button.text('')
    self.components.currentValueOS = self.button.text('')
    self.components.currentValueCS = self.button.text('')

    var starttxt = self.position.y+self.defaults.font.size/2 - self.defaults.middlecircle.radius
    var f = self.defaults.font.size / 4
    self.components.currentValueOF.font(self.defaults.font)
      .cx(self.position.x).cy(starttxt)
    self.components.currentValueCF.font(self.defaults.font)
      .cx(self.position.x).cy(starttxt + self.defaults.font.size + f)
    self.components.currentValueCS.font(self.defaults.font)
      .cx(self.position.x).cy(starttxt + 2*self.defaults.font.size + f)
    self.components.currentValueOS.font(self.defaults.font)
      .cx(self.position.x).cy(starttxt + 3*self.defaults.font.size + 2*f)

    var oa = this.oa = 0.55
    this.arcangle = (2*Math.PI - 4*this.oa) / 4 //1.55
    var st = 1.05-oa/2
    //var angles = this.angles = [0, 0.75, 2.37, 3.9, 5.5, 2*Math.PI]
    var angles = this.angles = [0, st,
      st+this.arcangle + oa, 
      st + (this.arcangle + oa)*2,
      st + (this.arcangle + oa)*3, 
      2*Math.PI]
    var arcs = this.arcs = [
      angles[1] - oa/2, //middle2- 0
      angles[1] + oa/2, //stop   - 1
      angles[2] - oa/2, //stop   - 2
      angles[2] + oa/2, //start  - 3
      angles[3] - oa/2, //start  - 4
      angles[3] + oa/2, //middle1- 5
      angles[4] - oa/2, //middle1- 6
      angles[4] + oa/2  //middle2- 7
    ]
    // formula with another origin
    var f = Math.PI/2
    var dist = self.defaults.innercircle.radius + self.defaults.margincircle.radius
    var dist2 = self.defaults.innercircle.radius - self.defaults.margincircle.radius

    /*console.log(self.opacity.get())
    console.log(self.opacity.get()*this.arcangle)
    console.log(arcs[3]-f)
    console.log(arcs[3]-f + self.opacity.get()*this.arcangle)
    console.log(self.red.get())
    console.log(self.blue.get())
    console.log(self.valueAngle(self.red.get(), this.arcangle))
    console.log(self.valueAngle(self.blue.get(), this.arcangle))*/
    //for stroke
    var pstart = pointCoordAngle(self.position, 
      arcs[3]-f + self.opacity.get()*this.arcangle, dist)
    var pmid = pointCoordAngle(self.position, 
      arcs[5]-f + self.valueAngle(self.red.get(), this.arcangle), dist)
    var pmid2 = pointCoordAngle(self.position, 
      arcs[7] - f +  self.valueAngle(self.green.get(), this.arcangle), dist)
    var pstop = pointCoordAngle(self.position, 
      arcs[1]-f + self.valueAngle(self.blue.get(), this.arcangle), dist)

    // for fill
    /*var pstartf = pointCoordAngle(self.position, arcs[4]-f, dist2)
    var pmidf = pointCoordAngle(self.position, arcs[6]-f, dist2)
    var pmid2f = pointCoordAngle(self.position, angles[5] - f+ arcs[0], dist2)
    var pstopf = pointCoordAngle(self.position, arcs[2]-f, dist2)*/
    var pstartf = pointCoordAngle(self.position, 
      arcs[3]-f + self.opacityf.get()*this.arcangle, dist2)
    var pmidf = pointCoordAngle(self.position, 
      arcs[5]-f + self.valueAngle(self.redf.get(), this.arcangle), dist2)
    var pmid2f = pointCoordAngle(self.position, 
      arcs[7] - f +  self.valueAngle(self.greenf.get(), this.arcangle), dist2)
    var pstopf = pointCoordAngle(self.position, 
      arcs[1]-f + self.valueAngle(self.bluef.get(), this.arcangle), dist2)

    //stroke:
    C.startvaluebutton = self.button.circle(2*deltarad)
      .fill({color: self.defaultColor, opacity: self.opacity.get()}).stroke(self.defaults.margincircle.stroke).attr('tt', 'start')
      .cx(pstart.x).cy(pstart.y)
      .attr('type', 'startvalue').draggy()
    C.stopvaluebutton = self.button.circle(2*deltarad)
      .fill('rgb(0,0,' + self.blue.get() + ')').opacity(1).stroke(self.defaults.margincircle.stroke).attr('tt', 'stop')
      .cx(pstop.x).cy(pstop.y)
      .attr('type', 'stopvalue').draggy()
    C.middlevaluebutton = self.button.circle(2*deltarad)
      .fill('rgb(' + self.red.get() + ',0,0)').opacity(1).stroke(self.defaults.margincircle.stroke).attr('tt', 'mid')
      .cx(pmid.x).cy(pmid.y)
      .attr('type', 'middlevalue').draggy()
    C.middlevaluebutton2 = self.button.circle(2*deltarad)
      .fill('rgb(0,' + self.green.get() + ',0)').opacity(1).stroke(self.defaults.margincircle.stroke).attr('tt', 'mid2')
      .cx(pmid2.x).cy(pmid2.y)
      .attr('type', 'middlevalue').draggy()

    // for fill
    C.startvaluebuttonf = self.button.circle(2*deltarad)
      .fill({color: self.defaultColor, opacity: self.opacityf.get()}).stroke(self.defaults.margincircle.stroke)
      .cx(pstartf.x).cy(pstartf.y)
      .attr('type', 'startvalue').draggy()
    C.stopvaluebuttonf = self.button.circle(2*deltarad)
      .fill('rgb(0,0,' + self.bluef.get() + ')').opacity(1).stroke(self.defaults.margincircle.stroke)
      .cx(pstopf.x).cy(pstopf.y)
      .attr('type', 'stopvalue').draggy()
    C.middlevaluebuttonf = self.button.circle(2*deltarad)
      .fill('rgb(' + self.redf.get() + ',0,0)').opacity(1).stroke(self.defaults.margincircle.stroke)
      .cx(pmidf.x).cy(pmidf.y)
      .attr('type', 'middlevalue').draggy()
    C.middlevaluebutton2f = self.button.circle(2*deltarad)
      .fill('rgb(0,' + self.greenf.get() + ',0)').opacity(1).stroke(self.defaults.margincircle.stroke)
      .cx(pmid2f.x).cy(pmid2f.y)
      .attr('type', 'middlevalue').draggy()

    C.anigr.add(C.startvaluebutton)
    C.anigr.add(C.stopvaluebutton)
    C.anigr.add(C.middlevaluebutton)
    C.anigr.add(C.middlevaluebutton2)

    C.anigr.add(C.startvaluebuttonf)
    C.anigr.add(C.stopvaluebuttonf)
    C.anigr.add(C.middlevaluebuttonf)
    C.anigr.add(C.middlevaluebutton2f)

  
    C.middlevaluebutton.on('dragmove', function(event) {
      //console.log(JSON.stringify({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY}))

      var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});
      //console.log('angle: ' + angle)

      if(angle > arcs[6] || angle < arcs[5]) {
        if(angle > arcs[5]) {
          var p = pointCoordAngle(self.position, arcs[6]-f, dist)
          self.red.set(255)
          this.fill('rgb(255,0,0)')
        }
        else {
          var p = pointCoordAngle(self.position, arcs[5]-f, dist)
          self.red.set(0)
          this.fill('rgb(0,0,0)')
        }
        this.cx(p.x).cy(p.y)
        return
      }
      var p = pointCoordAngle(self.position, angle - f, dist)
      //console.log('p: ' + JSON.stringify(p))
      var delta = angle-arcs[5]

      var red = delta/self.arcangle * 255
      self.red.set(Math.floor(red))
      this.fill('rgb(' + Math.floor(red) + ',0,0)')
      this.cx(p.x).cy(p.y)
    })
    C.middlevaluebuttonf.on('dragmove', function(event) {
      //console.log(JSON.stringify({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY}))

      var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});
      //console.log('angle: ' + angle)

      if(angle > arcs[6] || angle < arcs[5]) {
        if(angle > arcs[5]) {
          var p = pointCoordAngle(self.position, arcs[6]-f, dist2)
          self.redf.set(255)
          this.fill('rgb(255,0,0)')
        }
        else {
          var p = pointCoordAngle(self.position, arcs[5]-f, dist2)
          self.redf.set(0)
          this.fill('rgb(0,0,0)')
        }
        this.cx(p.x).cy(p.y)
        return
      }
      var p = pointCoordAngle(self.position, angle - f, dist2)
      //console.log('p: ' + JSON.stringify(p))
      var delta = angle-arcs[5]

      var red = delta/self.arcangle * 255
      self.redf.set(Math.floor(red))
      this.fill('rgb(' + Math.floor(red) + ',0,0)')
      this.cx(p.x).cy(p.y)
    })

    C.middlevaluebutton2.on('dragmove', function(event) {
      //console.log(JSON.stringify({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY}))

      var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});
      //console.log('angle: ' + angle)
      

      if(angle > arcs[0] && angle < arcs[7]) {
        if(angle-arcs[0] < arcs[7] - angle) {
          var p = pointCoordAngle(self.position, 3/2*Math.PI + arcs[0], dist)
          self.green.set(255)
          this.fill('rgb(0,255,0)')
        }
        else {
          var p = pointCoordAngle(self.position, arcs[7] -f, dist)
          self.green.set(0)
          this.fill('rgb(0,0,0)')
        }
        this.cx(p.x).cy(p.y)
        return
      }
      
      if(angle < arcs[0]) {
        var delta = arcs[0] + angle
        var p = pointCoordAngle(self.position, 3/2*Math.PI + angle, dist)
      }
      else {
        var delta = angle - arcs[7]
        var p = pointCoordAngle(self.position, 3/2*Math.PI - 2*Math.PI + angle, dist)
      }

      var green = delta/self.arcangle * 255
      self.green.set(Math.floor(green))
      this.fill('rgb(0,' + Math.floor(green) + ',0)')
      this.cx(p.x).cy(p.y)
    })
    C.middlevaluebutton2f.on('dragmove', function(event) {
      //console.log(JSON.stringify({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY}))

      var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});
      //console.log('angle: ' + angle)
      

      if(angle > arcs[0] && angle < arcs[7]) {
        if(angle-arcs[0] < arcs[7] - angle){
          var p = pointCoordAngle(self.position, 3/2*Math.PI + arcs[0], dist2)
          self.greenf.set(255)
          this.fill('rgb(0,255,0)')
        }
        else {
          var p = pointCoordAngle(self.position, arcs[7] -f, dist2)
          self.greenf.set(0)
          this.fill('rgb(0,0,0)')
        }
        this.cx(p.x).cy(p.y)
        return
      }
      
      if(angle < arcs[0]) {
        var delta = arcs[0] + angle
        var p = pointCoordAngle(self.position, 3/2*Math.PI + angle, dist2)
      }
      else {
        var delta = angle - arcs[7]
        var p = pointCoordAngle(self.position, 3/2*Math.PI - 2*Math.PI + angle, dist2)
      }

      var green = delta/self.arcangle * 255
      self.greenf.set(Math.floor(green))
      this.fill('rgb(0,' + Math.floor(green) + ',0)')
      this.cx(p.x).cy(p.y)
    })

    C.stopvaluebutton.on('dragmove', function(event) {
      //console.log(JSON.stringify({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY}))

      var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});
      //console.log('angle: ' + angle)
      if(angle > arcs[2] || angle < arcs[1]) {
        if(angle > arcs[2]) {
          var p = pointCoordAngle(self.position, arcs[2]-f, dist)
          self.blue.set(255)
          this.fill('rgb(0,0,255)')
        }
        else {
          var p = pointCoordAngle(self.position, angles[5] - (f-arcs[1]), dist)
          self.blue.set(0)
          this.fill('rgb(0,0,0)')
        }
        this.cx(p.x).cy(p.y)
        return
      }
      var p = pointCoordAngle(self.position, angle - f, dist)

      var delta = angle-arcs[1]

      var blue = delta/self.arcangle * 255
      self.blue.set(Math.floor(blue))
      this.fill('rgb(0,0,' + Math.floor(blue) + ')')
      this.cx(p.x).cy(p.y)
    })
    C.stopvaluebuttonf.on('dragmove', function(event) {
      //console.log(JSON.stringify({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY}))

      var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});
      //console.log('angle: ' + angle)
      if(angle > arcs[2] || angle < arcs[1]) {
        if(angle > arcs[2]) {
          var p = pointCoordAngle(self.position, arcs[2]-f, dist2)
          self.bluef.set(255)
          this.fill('rgb(0,0,255)')
        }
        else {
          var p = pointCoordAngle(self.position, angles[5] - (f-arcs[1]), dist2)
          self.bluef.set(0)
          this.fill('rgb(0,0,0)')
        }
        this.cx(p.x).cy(p.y)
        return
      }
      var p = pointCoordAngle(self.position, angle - f, dist2)

      var delta = angle-arcs[1]

      var blue = delta/self.arcangle * 255
      self.bluef.set(Math.floor(blue))
      this.fill('rgb(0,0,' + Math.floor(blue) + ')')
      this.cx(p.x).cy(p.y)
    })

    C.startvaluebutton.on('dragmove', function(event) {
      //console.log(JSON.stringify({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY}))

      var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});

      if(angle > arcs[4] || angle < arcs[3]) {
        if(angle > arcs[4]) {
          var p = pointCoordAngle(self.position, arcs[4]-f, dist)
          self.opacity.set(1)
          this.attr('fill-opacity', 1)
        }
        else {
          var p = pointCoordAngle(self.position, arcs[3]-f, dist)
          self.opacity.set(0)
          this.attr('fill-opacity', 0)
        }
        this.cx(p.x).cy(p.y)
        return
      }
      var delta = angle-arcs[3]
      var p = pointCoordAngle(self.position, angle - f, dist)
      var opacity = delta/self.arcangle
      self.opacity.set(opacity)
      this.attr('fill-opacity', opacity)
      this.cx(p.x).cy(p.y)
    })
    C.startvaluebuttonf.on('dragmove', function(event) {
      //console.log(JSON.stringify({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY}))

      var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});
      //console.log('angle: ' + angle)

      if(angle > arcs[4] || angle < arcs[3]) {
        if(angle > arcs[4]) {
          var p = pointCoordAngle(self.position, arcs[4]-f, dist2)
          self.opacityf.set(1)
          this.attr('fill-opacity', 1)
        }
        else {
          var p = pointCoordAngle(self.position, arcs[3]-f, dist2)
          self.opacityf.set(0)
          this.attr('fill-opacity', 0)
        }
        this.cx(p.x).cy(p.y)
        return
      }
      var delta = angle-arcs[3]
      var p = pointCoordAngle(self.position, angle - f, dist2)
      var opacity = delta/self.arcangle
      self.opacityf.set(opacity)
      this.attr('fill-opacity', opacity)
      this.cx(p.x).cy(p.y)
    })

    return []
  }

  createValueButtonsPositions(arr) {
    return []
  }

  trackValue() {
    var self = this
    Tracker.autorun(function() {
      var r = self.red.get()
      var g = self.green.get()
      var b = self.blue.get()
      var a = self.opacity.get()
      //console.log('rgba(' + r + ',' + g + ',' + b + ',' + a + ')')
      self.components.middlecircle.stroke({color: 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'})
      
      self.components.currentValueOS.text((a * 100).toFixed(self.decimals)+'%')
      var col = self.toHex('rgb(' + r + ',' + g + ',' + b + ')')
      self.components.currentValueCS.text(col)
    })
    Tracker.autorun(function() {
      var r = self.redf.get()
      var g = self.greenf.get()
      var b = self.bluef.get()
      var a = self.opacityf.get()
      //console.log('rgba(' + r + ',' + g + ',' + b + ',' + a + ')')
      self.components.middlecircle.fill('rgba(' + r + ',' + g + ',' + b + ',' + a + ')')

      self.components.currentValueOF.text((a * 100).toFixed(self.decimals)+'%')
      var col = self.toHex('rgb(' + r + ',' + g + ',' + b + ')')
      self.components.currentValueCF.text(col)
    })
  }

  createCurrentValue() {
  }

  valueAngle(value, arcangle) {
    return arcangle * value/255
  }

  createKnob() {}
}

OController.BlendColor = class extends OController.ColorButton {
  constructor(draw, obj) {
    if(!obj.value)
      obj.value = 0.5
    obj.range = {min: 0, max: 1}
    super(draw, obj)
    var self = this

    this.color1 = obj.color1
    this.color2 = obj.color2

  }

  trackValue() {
    var self = this
    Tracker.autorun(function() {
      var value = self.value.get()
      if(value || value == 0) {
        //console.log(value)
        self.components.middlecircle.fill(self.toColor(self.blend(self.color1, self.color2, value)))
        var angle = self.valueAngle(value)
        m = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0}
        m = rotateMatrix(m, angle, {x:self.position.x, y:self.position.y})
        self.components.knob.transform(m)
      }
    })
  }

  show() {
    super()
    this.components.middlecircle.forward().opacity(1)
  }

  createValueButtonsElements() {
    var elements = super()
    var self = this

    self.components.startvaluebutton.opacity(1).fill(this.color1).stroke({color: '#000', width: 1})
    self.components.stopvaluebutton.opacity(1).fill(this.color2).stroke({color: '#000', width: 1})
    self.components.middlevaluebutton.opacity(1).fill(self.toColor(self.blend(self.color1, self.color2, 0.5))).stroke({color: '#000', width: 1})
    self.components.startValue.remove()
    self.components.stopValue.remove()
    return elements
  }

  blend(rgb, color, ratio) {
     /* does an ratio based blend of color onto this. ratio is the
     * amount of 'color' to use. (0 to 1)
     */
     //console.log('color: ' + color)
      //console.log('rgb: ' + rgb)
      rgb = this.toArray(this.toRgb(rgb));
      color = this.toArray(this.toRgb(color));
      ratio = Math.min(Math.max(ratio, 0), 1);    
      //console.log(color)
      //console.log(rgb)
      //console.log('ratio: ' + ratio)
      rgb.red = (rgb.red * (1 - ratio)) + (color.red * ratio);
      rgb.green = (rgb.green * (1 - ratio)) + (color.green * ratio);
      rgb.blue = (rgb.blue * (1 - ratio)) + (color.blue * ratio);
      rgb.alpha = (rgb.alpha * (1 - ratio)) + (color.alpha * ratio);
      //console.log(rgb)
      return rgb;

  }
}

OController.DefaultButton = class {
  constructor(draw, obj) {
    var self = this
    this.draw = draw
    this.id = Random.id()
    this.button = draw.group().attr('id', 'ocontroller_' + this.id)
    this.radius = obj.radius
    this.diameter = obj.radius*2
    this.value = new ReactiveVar(obj.value)
    this.components = {}
    this.position = obj.position
    this.callback = obj.callback
    this.minimizeCallback = obj.minimizeCallback
    this.maximizeCallback = obj.maximizeCallback
    this.hidden = new ReactiveVar(obj.hidden)

    this.defaultColor = '#4d4d4d'
    this.defaultOpacity = obj.opacity || 0.4
    
    this.defaults = {
      outercircle: {
        stroke: {
          color: this.defaultColor,
          width: this.radius/35
        },
        fill: 'rgba(0,0,0,0)',
        opacity: this.defaultOpacity,
        radius: this.radius
      },
      innercircle: {
        stroke: {
          color: this.defaultColor,
          width: this.radius / 200
        },
        fill: 'rgba(0,0,0,0)',
        opacity: this.defaultOpacity,
        radius: this.radius * 7 / 10
      },
      smallcircle: {
        fill: this.defaultColor,
        opacity: this.defaultOpacity,
        radius: this.radius / 80
      },
      middlecircle: {
        stroke: {
          color: this.defaultColor,
          width: this.radius/35
        },
        fill: this.defaultColor,
        opacity: this.defaultOpacity,
        radius: this.radius / 16 * 5
      }
    }
    this.defaults.margincircle = {
      radius: (self.defaults.outercircle.radius - self.defaults.innercircle.radius) / 2 - (parseFloat(self.defaults.outercircle.stroke.width) / 2) / 2
    }
    this.defaults.font = {
      family:   'Helvetica'
    , size:     80 * self.radius / 400 //60 for radius = 400
    , anchor:   'middle'
    //, leading:  '1.5em'
    }
  }

  show() {
    var self = this
    self.components.anigr = self.button.group()

    this.createStructure()
    
    self.components.middlecircle = 
      self.button.circle(2 * self.defaults.middlecircle.radius)
      .stroke(self.defaults.middlecircle.stroke)
      .fill(self.defaults.middlecircle.fill)
      .cx(self.position.x)
      .cy(self.position.y)
      .opacity(self.defaults.middlecircle.opacity)
      .click(function() {
        if(self.hidden.get())
          self.hidden.set(false)
        else
          self.hidden.set(true)
      })

    this.createMenu()
    this.trackValue()
    this.trackHidden()
  }

  trackHidden() {
    var self = this
    Tracker.autorun(function() {
      var hidden = self.hidden.get()

      if(hidden) {
        self.components.anigr.animate(400, SVG.easing.circIn, 0).scale(self.defaults.middlecircle.radius / self.radius).opacity(0).after(function() {
          if(self.minimizeCallback)
            self.minimizeCallback(self)
        })
        
      }
      else {
        self.components.anigr.animate(600, SVG.easing.elastic, 0).scale(1).opacity(1).after(function() {
          if(self.maximizeCallback)
            self.maximizeCallback(self)
        })
        
      }
    })
  }

  createStructure() {
    var self = this
    self.components.outercircle = 
      self.button.circle(2 * self.defaults.outercircle.radius)
      .stroke(self.defaults.outercircle.stroke)
      .fill(self.defaults.outercircle.fill)
      .cx(self.position.x)
      .cy(self.position.y)
      .opacity(self.defaults.outercircle.opacity)
    self.components.innercircle = 
      self.button.circle(2 * self.defaults.innercircle.radius)
      .stroke(self.defaults.innercircle.stroke)
      .fill(self.defaults.innercircle.fill)
      .cx(self.position.x)
      .cy(self.position.y)
      .opacity(self.defaults.innercircle.opacity)

    self.components.anigr.add(self.components.outercircle)
    self.components.anigr.add(self.components.innercircle)
  }

  createMenu() {
    var elements = this.createMenuElements()
    this.createMenuPositions(elements)
  }

  createMenuElements() {
    return []
  }

  createMenuPositions(elements) {
    if(elements.length == 0)
      return
    var self = this
    var strokefactor = parseFloat(self.components.outercircle.attr('stroke-width')) / 2
    var deltarad = (self.defaults.outercircle.radius - self.defaults.innercircle.radius) / 2
    var centerdist = self.defaults.innercircle.radius + deltarad
    var deltastartx, deltastarty, angle, tempangle
    var len = elements.length
    var midangle = self.maxangle + (360 - self.maxangle + self.minangle) / 2
    // so it does not overlap with start and stop valuebuttons
    var bbox = elements[0].bbox()
    var extraangle = 2* Math.asin((self.defaults.margincircle.radius/2) / centerdist) + 2 * Math.asin(bbox.w / 2 / centerdist) * 180 / Math.PI
      
    var deltaangle = (360 - self.maxangle + self.minangle - extraangle*2) / (len+1)

    if(len % 2 == 0)
      angle = midangle + deltaangle / 2 + (len - 2) / 2 * deltaangle
    else
      angle = midangle + (len-1) / 2 * deltaangle

    elements.forEach(function(e) {
      tempangle = angle
      if(tempangle >= self.mid)
        tempangle = tempangle - self.midangle
      else
        tempangle = tempangle + (360 - self.midangle)
      // the formula works for X axis (right) = 0 degrees, so we have to transform
      if(tempangle >= 90)
        tempangle -= 90
      else
        tempangle = 360 - 90 + tempangle

      tempangle = tempangle * Math.PI / 180
      deltastartx = centerdist * Math.cos(tempangle)
      deltastarty = centerdist * Math.sin(tempangle)
      e.cx(self.position.x + deltastartx).cy(self.position.y + deltastarty)
      angle -= deltaangle
    })

  }

  trackValue() {
    var self = this
    /*Tracker.autorun(function() {
      var value = self.value.get()
      //console.log(value)
      if(value || value == 0) {
        if(self.callback) {
          self.callback(value, self)
        }
        var val = value.toFixed(self.decimals)
      }
    })*/
  }

  ondragmove(el, event) {
    var self = this
    var angle = getAngle({x: self.position.x, y: self.position.y}, {x: event.detail.event.pageX, y: event.detail.event.pageY});
      
    if(angle > self.defaults.knob.maxAngle && angle < Math.PI)
      angle = self.defaults.knob.maxAngle
    else if(angle > Math.PI && angle < (2*Math.PI - self.defaults.knob.maxAngle))
      angle = 2*Math.PI - self.defaults.knob.maxAngle

    m = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0}
    m = rotateMatrix(m, -angle, {x: self.position.x, y: self.position.y})
    el.transform(m)
    var val = self.angleValue(angle)
    self.value.set(val)
    el.cx(self.defaults.knob.cx).cy(self.defaults.knob.cy)
  }

  angleValue(angle) {
    var self = this
    var val = angle*180/Math.PI

    if(val >= 0 && val <= self.midangle)
      val = val + self.midangle
    else
      val = val - (360 - self.midangle)

    var ratio = (self.maxangle - self.minangle) / val
    return (self.min + (self.max - self.min) / ratio)
  }

  valueAngle(value) {
    var self = this
    if(value != self.min) {
      var ratio = (self.max - self.min) / (value - self.min)
      value = self.minangle + (self.maxangle - self.minangle) / ratio
    }
    else
      value = self.minangle

    if(value >= self.midangle)
      value = value - self.midangle
    else
      value = value + (360 - self.midangle)
    var angle = value * Math.PI / 180

    return -angle
  }

  destroy() {
    for(c in this.components) {
      if(this.components[c] instanceof SVG.Element)
        this.components[c].remove()
      else
        this.components[c].forEach(function(k) {
          if(k instanceof SVG.Element)
            k.remove()
        })
    }
  }
}
