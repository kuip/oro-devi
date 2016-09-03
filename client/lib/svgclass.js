var selCol = '#C91313'

Shape = class Shape {
    constructor(obj = {}) {
        var self = this
        // [[x, y], []]
        this.points = obj.points || []
        this.clearPoints()
        // opened/closed path
        this.closed = obj.closed
        this.parent = obj.parent
        //this.allpParent = this.parent.group()
        this.paParent = this.parent.group()
        if(obj.pParent)
            this.pParent = obj.pParent.group()
        else
            this.pParent = this.parent.group()
        if(this.points.length) {
            this.createPoints()
            this.svg = this.paParent.path(this.pointsToPath())
        }
        else
            this.svg = this.paParent.path('M 0 0')
        
        this.selPoints = []
        this.isdragged = false
    }
    
    clearPoints() {
        var self = this
        var pp = [], doubles = []
        this.points.forEach(function(v, ind) {
            v = v.join('')
            if(pp.indexOf(v) != -1)
                doubles.push(ind)
            else
                pp.push(v)
        })
        doubles.forEach(function(d) {
            self.points.splice(d, 1)
        })
    }

    addP(x, y) {
        this.points.push([x, y])
    }
    
    x(ind, val) {
        if(!val)
            return this.points[ind][0]
        else 
            this.points[ind][0] = val
    }
    
    y(ind, val) {
        if(!val)
            return this.points[ind][1]
        else 
            this.points[ind][1] = val
    }

    addPoint(x, y) {
        var ind = this.points.length
        this.addP(x, y)
        this.createPoint(x,y,ind)
        this.redraw()
    }
    
    createPoints() {
        var self = this
        this.points.forEach(function(p, ind) {
            self.createPoint(p[0], p[1], ind)
        })
    }

    createSvgPoint(x, y) {
        var c = this.pParent.circle(15)
        c.center(x,y)
            .opacity(0.3)
            .draggy()
        return c
    }
    
    createPoint(x, y, ind) {
        var c = this.createSvgPoint(x, y)
        this.pointEvents(c, ind)
        this.pointSelectEvent(c, ind)
    }

    pointEvents(c, ind) {
        var delta = {}
        var self = this
        c.on('dragstart', function(event) {
            delta.x = event.detail.event.pageX - c.cx()
            delta.y = event.detail.event.pageY - c.cy()
        })
        c.on('dragmove', function(event) {
            self.x(ind, (event.detail.event.pageX - delta.x))
            self.y(ind, (event.detail.event.pageY - delta.y))
            self.redraw()
            self.isdragged = true
        });
        c.on('dragend', function(event) {
            self.x(ind, (event.detail.event.pageX - delta.x))
            self.y(ind, (event.detail.event.pageY - delta.y))
            self.redraw()
            if(self.isdragged)
                window.setTimeout(function() {
                    self.isdragged = false
                }, 500)
        });
    }

    pointSelectEvent(c, ind) {
        var self = this
        var color = c.attr('fill')
        c.on('click', function(e) {
            if(self.isdragged) return

            if(self.selPoints.indexOf(ind) != -1) {
                self.selPoints.splice(self.selPoints.indexOf(ind), 1)
                this.fill(color)
            }
            else {
                self.selPoints.push(ind)
                color = this.attr('fill')
                this.fill(selCol)
            }
        })
    }

    pointsToPath(pp) {
        if(!pp) pp = this.points
        var path = simple(pp, this.closed)
        return path.join(' ')
    }
    
    pointsToOro() {
        return this.points
    }

    redraw() {
        this.svg.plot(this.pointsToPath())
    }
    
    showAll() {
        var path = this.pointsToPath()
        var pp = []
        path = path.split(' ')
        path.forEach(function(p, ind) {
            if(['L', 'C'].indexOf(p) != -1)
                pp.push([parseFloat(path[ind-2]), parseFloat(path[ind-1])])
        })
        var len = path.length
        if(path[len-1] == 'Z')
            pp.push([parseFloat(path[len-3]), parseFloat(path[len-2])])
        else
            pp.push([parseFloat(path[len-2]), parseFloat(path[len-1])])
        this.pParent.clear()
        this.points = pp
        this.createPoints()
    }

    distroy() {
        this.paParent.remove()
        //this.cParent.remove()
        this.pParent.remove()
    }

    clone() {
        return new this.constructor(this)
    }
}

Algo1Shape = class Algo1Shape extends Shape {
    constructor(obj) {
        super(obj)
        // attractor distance
        if(obj.attd || obj.attd == 0)
            this.attd = obj.attd
        else
            this.attd = 6
        this.curvetype = 'algo1'
    }
    
    pointsToPath() {
        var d
        if(this.attd || this.attd == 0)
            d = this.attd
        else
            d = 6
        var path = algo1(this.points, this.closed, d)
        return path.join(' ')
    }

    drawPoints(parent) {
    }
}

SpiroShape = class SpiroShape extends Shape {
    constructor(obj) {
        super(obj)
        // corner, open, open_end, g4, g2
        this.type = obj.type || 'g2'
        this.curvetype = 'spiro'
    }
    
    addP(x, y) {
        this.points.push({x: x, y: y, type: this.type})
    }
    
    x(ind, val) {
        if(!val)
            return this.points[ind].x
        else 
            this.points[ind].x = val
    }
    
    y(ind, val) {
        if(!val)
            return this.points[ind].y
        else 
            this.points[ind].y = val
    }

    oroToSpiro() {
        var self = this
        this.points = this.points.map(function(a) {
            return {
                x: a[0],
                y: a[1],
                type: self.type || 'g2'
            }
        })
    }

    pointsToOro() {
        if(this.points[0].x)
            return this.points.map(function(p) {
                return [p.x, p.y]
            })
        else 
            return super.pointsToOro()
    }

    pointsToPath() {
        if(!this.points) return 'M 0 0'
        if(!this.points[0].type)
            this.oroToSpiro()
        pp = spiroToBezier(this.points, this.closed)
        return dr(pp)
    }

    drawPoints(parent) {
        redrawPoints(this.points, parent)
    }
}

SimpleShape = class SimpleShape extends Shape {
    constructor(obj) {
        super(obj)
        this.curvetype = 'simple'
    }
}

OrthoShape = class OrthoShape extends Shape {
    constructor(obj) {
        super(obj)
        this.curvetype = 'ortho'
    }
    addP(x, y, dist) {
        super.addP(x, y)
        var pp = this.points, len = pp.length
        if (len > 1){
            if(dist && len > 2)
                dist = distance(
                    {x: pp[len-3][0], y: pp[len-3][1]}, 
                    {x: pp[len-2][0], y: pp[len-2][1]})
            else dist = null
            if (Math.abs(pp[len-1][0]-pp[len-2][0]) < Math.abs(pp[len-1][1]-pp[len-2][1])) {
                pp[len-1][0] = pp[len-2][0]
                if(dist) {
                    sign = (pp[len-1][1] > pp[len-2][1]) ? 1 : -1
                    pp[len-1][1] = pp[len-2][1] + (sign * dist)
                }
            } else {
                pp[len-1][1] = pp[len-2][1]
                if(dist) {
                    sign = (pp[len-1][0] > pp[len-2][0]) ? 1 : -1
                    pp[len-1][0] = pp[len-2][0] + (sign * dist)
                }
            }
        }
    }
    
    addPoint(x, y, e) {
        var ind = this.points.length, p
        if(!e.altKey)
            this.addP(x, y, e.shiftKey)
        else {
            p = this.orthoP(x, y, ind)
            this.points.push(p)
        }
        p = this.points[this.points.length-1]
        this.createPoint(p[0],p[1],ind)
        this.redraw()
    }

    orthoP(x, y, ind) {
        var pp = this.points,
            len = this.points.length,
            p1, p2, g,
            i = (ind || ind == 0) ? ind : len

        if(i == 0 || i == len)
            p1 = pp[len-1]
        else
            p1 = pp[i-1]
        if(i == len || i == len-1)
            p2 = pp[0]
        else
            p2 = pp[i+1]
        if(distance({x: p1[0], y: p2[1]}, {x: x, y: y}) < distance({x: p2[0], y: p1[1]}, {x: x, y: y}))
            g = [p1[0], p2[1]]
        else
            g = [p2[0], p1[1]]
        return g
    }

    pointEvents(c, ind) {
        var delta = {}, p, ev, nc
        var self = this
        c.on('dragstart', function(event) {
            ev = event.detail.event
            //delta.x = event.detail.event.pageX - c.cx()
            //delta.y = event.detail.event.pageY - c.cy()
            nc = self.createSvgPoint(ev.pageX, ev.pageY)
                .fill('#C91313').opacity(0.3)
        })
        c.on('dragmove', function(event) {
            ev = event.detail.event
            p = self.orthoP(ev.pageX, ev.pageY, ind)
            self.x(ind, p[0])
            self.y(ind, p[1])
            nc.cx(p[0]).cy(p[1])
            //self.x(ind, (event.detail.event.pageX - delta.x))
            //self.y(ind, (event.detail.event.pageY - delta.y))
            self.redraw()
        });
        c.on('dragend', function(event) {
            ev = event.detail.event
            p = self.orthoP(ev.pageX, ev.pageY, ind)
            self.x(ind, p[0])
            self.y(ind, p[1])
            nc.remove()
            this.cx(p[0]).cy(p[1])
            //self.x(ind, (event.detail.event.pageX - delta.x))
            //self.y(ind, (event.detail.event.pageY - delta.y))
           self.redraw()
        });
    }
}

GearShape = class GearShape extends Shape {
    constructor(obj) {
        super(obj)
        if(obj.attd || obj.attd == 0)
            this.attd = obj.attd
        else
            this.attd = 6
        this.curvetype = 'gear'
    }
    pointsToPath() {
        var g
        if(this.attd || this.attd == 0)
            g = Math.round(this.attd)
        else
            g = 6
        var path = createGear(this.points, this.closed, g)
        return path.join(' ')
    }
}

EllipseShape = class EllipseShape extends Shape {
    constructor(obj) {
        super(obj)
        this.curvetype = 'ellipse'
    }

    pointsToPath() {
        return getEllipse(this.points)
    }
    
    redraw() {
        this.svg.plot(getEllipse(this.points))
    }
    
    pointsToOro() {
        return this.points
    }
}

LinkShape = class LinkShape extends Shape {
    constructor(obj) {
        super(obj)
        this.curvetype = 'link'
    }

    pointsToPath() {
        var pp = this.points,
            len = pp.length,
            path = ['M', pp[0][0], pp[0][1]]
        for(var i=1; i<len; i++) {
            path = path.concat(this.calcP(pp[i], pp[i-1]))
        }
        if(this.closed) {
            path = path.concat(this.calcP(pp[0], pp[len-1]))
            path.push('Z')
        }
        return path.join(' ')
    }

    calcP(p1, p2) {
        var dx, dy, mid, v, c1, c2, c3, c4
        dx = p1[0] - p2[0]
        dy = p1[1] - p2[1]
        v = Math.abs(dx) < Math.abs(dy)

        // middle of line between points
        mid =  [p2[0]+ dx/2, p2[1] + dy/2]

        if(v) {
            c1 = p2[1] + dy / 2
            c2 = mid[0] - dx / 4
            c3 = mid[0] + dx / 4
            c4 = p1[1] - dy / 2
            return [
                'C', p2[0], c1, c2, mid[1], mid[0], mid[1],
                'C', c3, mid[1], p1[0], c4, p1[0], p1[1]
            ]
        }
        else {
            c1 = p2[0] + dx / 2
            c2 = mid[1] - dy / 4
            c3 = mid[1] + dy / 4
            c4 = p1[0] - dx / 2
            return [
                'C', c1, p2[1], mid[0], c2, mid[0], mid[1],
                'C', mid[0], c3, c4, p1[1], p1[0], p1[1]
            ]
        }
    }
}

RoundedShape = class RoundedShape extends Shape {
    constructor(obj) {
        super(obj)
        this.curvetype = 'rounded'
    }
    pointsToPath() {
        if(this.points.length < 2)
            return 'M 0 0'
        this.attd = (this.attd || this.attd == 0) ? this.attd : 30
        var pp = this.points,
            fS = 1,
            rx = this.attd, ry = this.attd,
            path = ['M', pp[0][0], pp[0][1]],
            c, dx, dy, a, bis, p1, p2, pp1, pp2, at1, at2,
            a1, a2, cw = 0, ccw = 0,
            ini = this.closed ? 0 : 1,
            end = this.closed ? pp.length : pp.length-1
        if(pp.length < 3) {
            path = path.concat(['L', pp[1][0], pp[1][1]])
            if(this.closed)
                path.push('Z')
            return path.join(' ')
        }

        for(var i=ini; i<end; i++) {
            if(i==0)
                pp1 = pp[pp.length-1]
            else
                pp1 = pp[i-1]
            if(i == pp.length-1)
                pp2 = pp[0]
            else
                pp2 = pp[i+1]

            a1 = getAngle(pp[i], pp1)
            a2 = getAngle(pp[i], pp2)
            a = angleDiff(a1, a2)
            dx = rx / Math.sin(a/2)
            dy = ry / Math.sin(a/2)
            if(a == angleDiffCW(a1, a2)) {
                bis = turnCW(a1, a/2)
                fS = 1
                cw++
            }
            else {
                bis = turnCCW(a1, a/2)
                fS = 0
                ccw++
            }
            c = pointByAngleDistance(pp[i], bis, dx)
            p1 = pointByAngleDistance(pp[i], a1, Math.cos(a/2)*dx)
            p2 = pointByAngleDistance(pp[i], a2, Math.cos(a/2)*dy)
            at1 = pointByAngleDistance(pp[i], a1, distance(pp[i], p1)/2)
            at2 = pointByAngleDistance(pp[i], a2, distance(pp[i], p2)/2)
            /*var delta = 4 * (Math.sqrt(2) - 1) / 3;
            at1 = pointByAngleDistance(p1, getAngle(c, p2), distance(c, p2)*delta)
            at2 = pointByAngleDistance(p2, getAngle(c, p1), distance(c, p1)*delta)*/


            if(i==0 && this.closed)
                path = ['M', p1[0], p1[1]]

            path = path.concat([
                'L', p1[0], p1[1],
                'C', at1[0], at1[1], at2[0], at2[1], p2[0], p2[1]
                //'A', rx, ry, 0, 0, fS, p2[0], p2[1]
            ])
        }
        /*if(cw < ccw) {
            for(i=6; i<path.length;i++)
                if(path[i] == 'A')
                    path[i+5] = 1 - path[i+5]
        }*/
        if(this.closed)
            path.push('Z')
        else
            path = path.concat(['L', pp[pp.length-1][0], pp[pp.length-1][1]])
        return path.join(' ')
    }
}  

dr = function dr(objs) {
    if(!objs.length) return;
    var path = [
        'M', objs[0].start.x, objs[0].start.y
    ]
    for(obj of objs) {
        if(obj.c1)
            path = path.concat(['C', obj.c1.x, obj.c1.y, obj.c2.x, obj.c2.y, obj.end.x, obj.end.y])
        else
            path = path.concat(['L', obj.start.x, obj.start.y,obj.end.x, obj.end.y])
    }
    return path.join(' ')
}

redrawPoints = function redrawPoints(objs, pointsgr) {
    if(!objs.length) return
    pointsgr.clear()
    for(obj of objs) {
        pointsgr.circle(10)
            .center(obj.start.x, obj.start.y)
        if(obj.c1) {
            pointsgr.circle(6)
                .center(obj.c1.x, obj.c1.y).fill('#C55458') 
            pointsgr.line(obj.start.x, obj.start.y, obj.c1.x, obj.c1.y).stroke({ width: 1, color: '#C55458'})
        }
        if(obj.c2) {
            pointsgr.circle(6)
                .center(obj.c2.x, obj.c2.y).fill('#C55458')
            pointsgr.line(obj.end.x, obj.end.y, obj.c2.x, obj.c2.y).stroke({ width: 1, color: '#C55458'})
        }
    }
    pointsgr.circle(10)
        .center(objs[objs.length-1].end.x, objs[objs.length-1].end.y)
    pointsgr.opacity(0)
}


algo1 = function algo1(objs, isClosed, dist) {
    if(objs.length < 2)
        return []
    var a, pp = [{x: objs[0][0], y: objs[0][1]}], path
    for(var i=0; i<objs.length-2; i++) {
        a1 = getAngle(objs[i+2], objs[i])
        a2 = getAngle(objs[i], objs[i+2])
        c1 = pointByAngleDistance(objs[i+1], a1, dist)
        c2 = pointByAngleDistance(objs[i+1], a2, dist)
        pp = pp.concat({x: objs[i+1][0], y: objs[i+1][1], c1: c1, c2: c2})
    }
    pp.push({x: objs[objs.length-1][0], y: objs[objs.length-1][1]})
    if(isClosed) {
        // First point
        a1 = getAngle(objs[1], objs[objs.length-1])
        a2 = getAngle(objs[objs.length-1], objs[1])
        pp[0].c1 = pointByAngleDistance(objs[0], a1, dist)
        pp[0].c2 = pointByAngleDistance(objs[0], a2, dist)
        
        // Last point
        a1 = getAngle(objs[0], objs[objs.length-2])
        a2 = getAngle(objs[objs.length-2], objs[0])
        pp[pp.length-1].c1 = pointByAngleDistance(objs[objs.length-1], a1, dist)
        pp[pp.length-1].c2 = pointByAngleDistance(objs[objs.length-1], a2, dist)
    }
    else { 
        // First point
        a1 = getAngle(objs[0], objs[1])
        pp[0].c2 = pointByAngleDistance(objs[0], a1, dist)
        
        // Last point
        a2 = getAngle(objs[objs.length-1], objs[objs.length-2])
        pp[pp.length-1].c1 = pointByAngleDistance(objs[objs.length-1], a2, dist)
    }

    path = [ 'M', pp[0].x, pp[0].y]
    for(i=0; i<pp.length-1; i++) {
        path = path.concat([
            'C', 
            pp[i].c2[0], pp[i].c2[1], 
            pp[i+1].c1[0], pp[i+1].c1[1],
            pp[i+1].x, pp[i+1].y
        ])
    }
    if(isClosed)
        path = path.concat([
            'C', 
            pp[pp.length-1].c2[0], pp[pp.length-1].c2[1], 
            pp[0].c1[0], pp[0].c1[1],
            pp[0].x, pp[0].y,
            'Z'
        ])
    return path
}

simple = function simple(pts, cl){
    var p =[]
    for (ndx in pts){
        p.push(["L",pts[ndx][0],pts[ndx][1]])
    }
    p[0][0]="M"
    if (cl){
        p.push(["Z"])
    }
    return p
}

getEllipseParams = function(pp) {
    var res, len = pp.length
    if(len == 3 || len == 4)
        res = circleParams(
        { x: pp[0][0], y: pp[0][1] },
        { x: pp[1][0], y: pp[1][1] },
        { x: pp[2][0], y: pp[2][1] }
    )
    else if(len >= 5)
        res = ellipseParams([
        { x: pp[0][0], y: pp[0][1] },
        { x: pp[1][0], y: pp[1][1] },
        { x: pp[2][0], y: pp[2][1] },
        { x: pp[3][0], y: pp[3][1] },
        { x: pp[4][0], y: pp[4][1] }
    ])
    return res
}

var ellC, ellEl

getEllipse = function(pp) {
    var res = getEllipseParams(pp)
    if(!res) return 'M 0 0'
    var c = res.center, rh = res.rh, rv = res.rv
    pp = ellipseToCPath({rh:rh, rv: rv, cx: c.x, cy: c.y})

    if(ellEl) {ellC.remove(); ellEl.remove()}
    //ellC = SVG.get('testlayer').circle(5).cx(c.x).cy(c.y).fill('#007AFF')
    //ellEl = SVG.get('testlayer').ellipse(rh*2, rv*2).cx(c.x).cy(c.y).fill('#007AFF').opacity(0.1).transform({ rotation: res.rot*180/Math.PI || 0 })

    if(!res.rot)
        return pp.join(' ')
    var newpp = []
    for(var p=0; p<pp.length; p++) {
        if(pp[p] == 'M' || pp[p] == 'L') {
            newpp.push(pp[p])
            var po = rotatePoint(c, {x: pp[p+1], y: pp[p+2]}, res.rot)
            newpp = newpp.concat([po.x, po.y])
        }
        else if(pp[p] == 'C') {
            newpp.push(pp[p])
            var c1 = rotatePoint(c, {x: pp[p+1], y: pp[p+2]}, res.rot)
            var c2 = rotatePoint(c, {x: pp[p+3], y: pp[p+4]}, res.rot)
            var po = rotatePoint(c, {x: pp[p+5], y: pp[p+6]}, res.rot)
            newpp = newpp.concat([c1.x, c1.y, c2.x, c2.y, po.x, po.y])
        }
        else if(pp[p] == 'Z')
            newpp.push(pp[p])
    }
    return newpp.join(' ')
}

createGear = function(pp, closed, no) {
    if(pp.length < 2) return ['M', 0, 0]
    var c = {x: pp[0][0], y: pp[0][1]},
        s = {x: pp[1][0], y: pp[1][1]},
        path = ['M', pp[1][0], pp[1][1]],
        p, delta, an
    if(closed)
        delta = 360/no
    else {
        delta = distance(c, s)/no
        an = getAngle(s, c)
    }

    // add the user created tooth points
    for(i=2; i<pp.length; i++)
        path = path.concat(['L', pp[i][0], pp[i][1]])

    // build the other symmetric points (around the center / on a line)
    for(j=2; j<=no; j++) {
        for(i=1; i<pp.length; i++) {
            if(closed)
                p = rotatePoint(c, {x: pp[i][0], y: pp[i][1]}, delta*(j-1)/180*Math.PI)
            else
                p = pointByAngleDistance({x: pp[i][0], y: pp[i][1]}, an, delta*(j-1))
            path = path.concat(['L', p.x, p.y])
        }
    }

    if(closed)
        path.push('Z')
    else
        path = path.concat(['L', pp[0][0], pp[0][1]])
    return path
}

atp = function(a) {
    return {x: a[0], y: a[1]}
}

combinePaths = function(p1, p2) {
    var pp = [p1[0]],
        len2 = p2.length,
        d2 = distance(atp(p2[0]), atp(p2[len2-1])),
        a2 = getAngle(atp(p2[0]), atp(p2[len2-1])),
        r, d, p, a, a1

    for(var i=1; i<p1.length; i++) {
        d = distance(atp(p1[i-1]), atp(p1[i]))
        r = d / d2
        a1 = getAngle(atp(p1[i-1]), atp(p1[i]))
        for(var j=1; j<len2-1;j++) {
            a = angleDiffCW(a2, getAngle(atp(p2[0]), atp(p2[j])))
            a = turnCW(a1, a)
            p = pointByAngleDistance(atp(p1[i-1]), a, r * distance(atp(p2[0]), atp(p2[j])))
            pp.push([p.x, p.y])
        }
        pp.push(p1[i])
    }
    return pp
}

combineCPaths = function(p1, p2, sh1) {
    var pp = [p1[0]],
        len2 = p2.length,
        d2 = distance(atp(p2[0]), atp(p2[len2-1])),
        a2 = getAngle(atp(p2[0]), atp(p2[len2-1])),
        d1 = sh1.svg.length(),
        r, d, p, a, a1, path,
        lens = [], po, circle,
        epsilon = 1/Math.pow(10, 2),
        pos = [p1[0]]

    for(var i=1; i<p2.length-1; i++) {
        ap = getAngle(atp(p2[0]), atp(p2[i]))
        a = angleDiff(a2, ap)
        dist1 = Math.cos(a) * distance(atp(p2[0]), atp(p2[i]))
        dist2 = Math.sin(a) * distance(atp(p2[0]), atp(p2[i]))
        lens.push([dist1, dist2, a == angleDiffCW(a2, ap)])
    }

    for(var i=1; i<p1.length; i++) {
        path = pathLen(pos, sh1)
        d = pathLen([p1[i-1], p1[i]], sh1)
        r = d / d2
        delta = Math.min(10, d / 500)
        lens.forEach(function(l) {
            po = sh1.svg.pointAt(path + l[0]*r)
            test.circle(5).cx(po.x).cy(po.y).fill('#0B7FFF')
            a = getAngle(po, sh1.svg.pointAt(path + l[0]*r + epsilon))
            if(l[2])
                a = turnCW(a, Math.PI/2)
            else
                a = turnCCW(a, Math.PI/2)
            p = pointByAngleDistance(po, a, r * l[1])
            pp.push([p.x, p.y])
        })
        pp.push(p1[i])
        pos.push(p1[i])
    }
    console.log(JSON.stringify(pp))
    return pp
}

function getPath(p, sh) {
    var c = sh.clone()
    c.closed = false
    c.points = p
    c.redraw()
    return c
}

function pathLen(p, sh) {
    var path = getPath(p, sh)
    var len = path.svg.length()
    path.distroy()
    return len
}

function pathLen2(p, sh) {
    var path = sh.parent.path(p)
    var len = path.length()
    path.remove()
    return len
}

function pathLen3(sh, ind) {
    var points = sh.array().value.slice(0, ind+1)
    var path = sh.parent().path(points)
    var len = path.length()
    path.remove()
    return len
}

combinePaths2 = function(p1, p2, sh1, sh2) {
    var d1 = sh1.svg.length(),
        d2 = distance(atp(p2[0]), atp(p2[p2.length-1])),
        r = d1 / d2,
        a2 = getAngle(atp(p2[0]), atp(p2[p2.length-1])),
        lens = [], l, p, dist1, dist2, a, dir, ap, po1, po2
        pp = [p1[0]], ppl = [p1[0]],
        epsilon = 1/Math.pow(10, 2)

    for(var i=1; i<p2.length-1; i++) {
        ap = getAngle(atp(p2[0]), atp(p2[i]))
        a = angleDiff(a2, ap)
        dist1 = Math.cos(a) * distance(atp(p2[0]), atp(p2[i]))
        dist2 = Math.sin(a) * distance(atp(p2[0]), atp(p2[i]))
        lens.push([r*dist1, r*dist2, a == angleDiffCW(a2, ap)])
    }
    
    for(var i=1; i<p1.length; i++) {
        ppl.push(p1[i])
        l = pathLen(ppl, sh1)
        while(lens[0] && lens[0][0] < l) {
            if(['spiro', 'algo1'].indexOf(sh1.curvetype) == -1) {
                if(lens[0][2])
                    a = turnCW(getAngle(atp(p1[i-1]), atp(p1[i])), Math.PI/2)
                else
                    a = turnCCW(getAngle(atp(p1[i-1]), atp(p1[i])), Math.PI/2)
            }
            else {
                a = getAngle(sh1.svg.pointAt(lens[0][0]), sh1.svg.pointAt(lens[0][0] + epsilon))
                if(lens[0][2])
                    a = turnCW(a, Math.PI/2)
                else
                    a = turnCCW(a, Math.PI/2)
            }
            p = pointByAngleDistance(sh1.svg.pointAt(lens[0][0]), a, lens[0][1])
            var ppp = sh1.svg.pointAt(lens[0][0])
            sh1.parent.circle(5).cx(ppp.x).cy(ppp.y).fill('#0B7FFF')
            sh1.parent.line(ppp.x, ppp.y, p.x, p.y).stroke({ width: 1 , color: '#0B7FFF'})
            var ps1 = sh1.svg.pointAt(lens[0][0])
            var ps2 = sh1.svg.pointAt(lens[0][0] + epsilon)
            sh1.parent.line(ps1.x, ps1.y, ps2.x, ps2.y).stroke({ width: 1 , color:'#C91313'})
            lens.splice(0, 1)
            pp.push([p.x, p.y])
        }
    }
    while(lens[0]) {
        a1 = getAngle(atp(p1[p1.length-2]), atp(p1[p1.length-1]))
        if(lens[0][2])
            a = turnCW(a1, Math.PI/2)
        else
            a = turnCCW(a1, Math.PI/2)
        d = pointByAngleDistance(atp(p1[p1.length-1]), a1, lens[0][0] - d1)
        p = pointByAngleDistance(d, a, lens[0][1])

        lens.splice(0, 1)
        pp.push([p.x, p.y])
    }
    pp.push(p1[p1.length-1])
    return pp
}

getTangent = function(sh, l, sign, reverse) {
    var eps = 1/Math.pow(10, 2)
    if(!reverse)
        return getAngle(
            sh.pointAt(l + (sign ? 0 : -eps)), 
            sh.pointAt(l + (sign ? eps : 0))
        )
    else
        return getAngle(
            sh.pointAt(l + (sign ? eps : 0)),
            sh.pointAt(l + (sign ? 0 : -eps)) 
        )
}

getTangent2 = function(sh, l) {
    var eps = 1/Math.pow(10, 2)
    if(l >= sh.length())
        return getAngle(sh.pointAt(sh.length() - eps), sh.pointAt(sh.length()))
    return getAngle(sh.pointAt(Math.max(l, 0)), sh.pointAt(Math.max(l, 0) + eps))
}

getp = function(p) {
    return [p[p.length-2], p[p.length-1]]
}
getx = function(p) {
    return p[p.length-2]
}
gety = function(p) {
    return p[p.length-1]
}

toComplex = function(points) {
    for(var i=1; i<points.length-1; i++)
        if(points[i][0] == 'L')
            points[i] = ['C', getx(points[i-1]), gety(points[i-1]), getx(points[i]), gety(points[i]), getx(points[i]), gety(points[i])]
    return points
}

combineCPaths2 = function(sh1, sh2) {
    var test = SVG.get('testlayer')
    test.clear()
    var p1 = sh1.svg.array().value,
        //p2 = sh2.svg.array().value,
        p2 = toComplex(sh2.svg.array().value),
        len1 = p1.length,
        len2 = p2.length,
        d1 = sh1.svg.length(),
        end1 = len1 - 1,
        end2 = len2 - 1

    if(['Z', 'z'].indexOf(p1[end1][0]) != -1)
        end1--
    if(['Z', 'z'].indexOf(p2[end2][0]) != -1)
        end2--
    if(p1[end1][p1[end1].length-2] == p1[0][1] && p1[end1][p1[end1].length-1] == p1[0][2])
        end1--

    var selected = sh2.selPoints
    var n1 = selected[0] || 0,
        n2 = selected[1] || (end2),
        ax1 = getp(p2[n1]),
        ax2 = getp(p2[n2]),
        d2 = distance(ax1, ax2),
        r = d1 / d2,
        a2 = getAngle(ax1, ax2),
        lens = [], lens2 = [],
        pp = [p1[0]], ppl = [p1[0]],
        allp = JSON.parse(JSON.stringify(p2)),
        pom, pon, a, dist1, dist2, d, l, p, dir, ap, po1, po2

    getProj = function(pi) {
        var pom = getp(pi),
            ap = getAngle(ax1, pom),
            a = angleDiffCW(a2, ap),
            // horiz projection
            dist1 = Math.cos(a) * distance(ax1, pom),
            // vertical 
            dist2 = Math.sin(a) * distance(ax1, pom)
        return [r*dist1, r*dist2]
    }
    
    getRelativeParam2 = function(pi, pii) {
        var pom = getp(pi),
            ap = getAngle(ax1, pom),
            a = angleDiffCW(a2, ap),
            // horiz projection
            dist1 = Math.cos(a) * distance(ax1, pom),
            // vertical 
            dist2 = Math.sin(a) * distance(ax1, pom),
            obj = [r*dist1, r*dist2, a == angleDiffCW(a2, ap)]
        if(pi[0] == 'C') {
            pon = getp(pii)
            // attractor distance from point + angle from exis
            obj = obj.concat([
                distance([pi[1], pi[2]], pon) * r,
                angleDiffCW(a2, getAngle(pon, [pi[1], pi[2]])),
                distance([pi[3], pi[4]], pom) * r,
                angleDiffCW(a2, getAngle(pom, [pi[3], pi[4]]))
            ])
        }
        return obj
    }

    console.log('p1: ' + JSON.stringify(p1))
    console.log('p2: ' + JSON.stringify(p2))
    console.log('end1: ' + end1)
    console.log('end2: ' + end2)
    console.log('selected1: ' + n1)
    console.log('selected2: ' + n2)
    var ini, end, obj, pos, at1, at2, projm, projn, reverse
    for(var j=1; j<=end2; j++) {
        console.log('j: ' + j)
        pom = p2[j]
        pon = p2[j-1]
        projn = getProj(pon)
        projm = getProj(pom)
        if(projm[0] < projn[0]) {
            ini = end1-1
            end = 1
            reverse = 1
        }
        else {
            ini = 1
            end = end1-1
            reverse = 0
        }
        console.log('ini: ' + ini)
        console.log('end: ' + end)
        for(var i=ini; end==1 ? i>=end : i<=end; end==1 ? i-- : i++) {
            console.log('i: ' + i)
            d = pathLen3(sh1.svg, i) / r
            po = pointByAngleDistance(ax1, a2, d)
            pos = pointByAngleDistance(po, turnCW(getAngle(po, ax1), Math.PI/2), d)

            test.circle(5).cx(po[0]).cy(po[1]).fill('#0B7FFF')
            test.line(po[0], po[1], pos[0], pos[1]).stroke({ width: 1 , color: '#922891'})
            //console.log('intersect ' + JSON.stringify(pon) + ' - with - ' + JSON.stringify(pom))
            
            var ints = computeIntersections(
                [getx(pon), pom[1] || getx(pon), pom[3] || getx(pom), getx(pom)], 
                [gety(pon), pom[2] || gety(pon), pom[4] || gety(pom), gety(pom)], 
                [po[0], pos[0]], [po[1], pos[1]])[0]
            
            if(ints) {
                console.log('int')
                obj = getRelativeParam2(['L', ints[0], ints[1]])
                test.circle(5).cx(ints[0]).cy(ints[1]).fill('#0B7FFF')
                a = getAngle(ax1, ints)
                if(p1[i][0] == 'C')
                    obj = obj.concat([
                        distance(getp(p1[i]), [p1[i][3], p1[i][4]]),
                        getAngle(getp(p1[i]), [p1[i][3], p1[i][4]])])
                else
                    obj = obj.concat([0,0])

                if(p1[i+1] && p1[i+1][0] == 'C')
                    obj = obj.concat([
                        distance(getp(p1[i]), [p1[i+1][1], p1[i+1][2]]),
                        getAngle(getp(p1[i]), [p1[i+1][1], p1[i+1][2]])])
                else
                    obj = obj.concat([0,0])

                if(reverse) {
                    console.log('reverse attr')
                    obj = obj.concat(obj.splice(3, 2))
                }

                obj.push(true)
                lens.push(obj)
            } 
        }
        lens.push(getRelativeParam2(pom, pon))
    }

    console.log(JSON.stringify(lens))
    var index
    lens.some(function(l, ind) {
        if(l[0] == 0 && l[1] == 0)
            index = ind
    })
    console.log('index: ' + index)
    if(index)
        lens = lens.concat(lens.splice(0, index+1))
    else
        lens = lens.concat(lens.splice(0, n1)) //might be useless

    
    console.log(JSON.stringify(lens))

    var lasttg = getTangent2(sh1.svg, 0)
    var tg

    getN = function(arr, ind) {
        var obj
        arr.slice(ind+1).some(function(a, i) {
            if(!a[7]) {
                obj = a
                return true
            }
            return false
        })
        return obj
    }

    function addPoint(pp1, pp2, ls, l2, pps, invertTg) {
        
        var pom = getp(pp1),
            pon = getp(pp2),
            l = ls[0],
            po, a
        //console.log('addPoint: ' + JSON.stringify(pp1) + ' - ' + JSON.stringify(l))
        if(l[3] || l[3] == 0)
            po = ['C']
        else
            po = ['L']
        if(po[0] != 'C') {
            if(l[2])
                a = turnCW(getAngle(pom, pon), Math.PI/2)
            else
                a = turnCCW(getAngle(pom, pon), Math.PI/2)
        }
        else {
            // tangent
            tg = getTangent2(sh1.svg, l[0])
            if(l[2])
                a = turnCW(tg, Math.PI/2)
            else
                a = turnCCW(tg, Math.PI/2)
        }
        if(l[0] < 0) {
            d = pointByAngleDistance([p1[0][1], p1[0][2]], tg, l[0])
            test.circle(5).cx(d[0]).cy(d[1]).fill('#0B7FFF')
            test.line(d[0], d[1], p1[0][1], p1[0][2]).stroke({ width: 1 , color: '#272822'})
        }
        else if(l[0] > sh1.svg.length()) {
            d = pointByAngleDistance(getp(p1[end1]), tg, l[0]-sh1.svg.length())
            test.circle(5).cx(d[0]).cy(d[1]).fill('#0B7FFF')
            test.line(d[0], d[1], getx(p1[end1]), gety(p1[end1])).stroke({ width: 1 , color: '#272822'})
        }
        else {
            d = sh1.svg.pointAt(l[0])
            test.circle(5).cx(d.x).cy(d.y).fill('#0B7FFF')
        }
        p = pointByAngleDistance(d, a, l[1])

        if(p.x) p = [p.x, p.y]
        if(d.x) d = [d.x, d.y]

        test.circle(5).cx(p[0]).cy(p[1]).fill('#0B7FFF')
        test.line(d[0], d[1], p[0], p[1]).stroke({ width: 1 , color: '#0B7FFF'})

        //console.log('p: ' + JSON.stringify(p))
        if(l[3] || l[3] == 0) {
            var last = getp(pp[pp.length-1])
            // special p1 point, has the point's attractors, rather than the curve's
            //console.log('l2: ' + JSON.stringify(l2))
            if(l[7]) {
                //console.log('special p1')
                if(!l2[7]) {
                    // search for the next p2 point, to find attractors
                    var next = getN(ls, 0)
                    //console.log('next: ' + next)
                    if(next)
                        po = po.concat(pointByAngleDistance(last, turnCW(lasttg, next[4]),l[3]))
                    else if(ls[1])
                        po = po.concat(pointByAngleDistance(last, ls[1][6], ls[1][5]))
                    
                }
                else {
                    //console.log('from last p1')
                    // take attractors from the last p1 point
                    po = po.concat(pointByAngleDistance(last, l2[6], l2[5]))
                }
                po = po.concat(pointByAngleDistance(p, l[4], l[3]))
            }
            else {
                if(l2[7])
                    po = po.concat(pointByAngleDistance(last, l2[6], l2[5]))
                else
                    po = po.concat(pointByAngleDistance(last, turnCW(lasttg, l[4]),l[3]))
                po = po.concat(pointByAngleDistance(p, turnCW(tg, l[6]),l[5]))
            }

            test.line(last[0], last[1], po[1], po[2]).stroke({ width: 1 , color: '#20B2AA'})
            test.line(p[0], p[1], po[3], po[4]).stroke({ width: 1 , color: '#20B2AA'})
        }
        lasttg = tg
        po = po.concat(p)
        //var ppp = sh1.svg.pointAt(l[0])
        //test.circle(5).cx(ppp.x).cy(ppp.y).fill('#0B7FFF')
        //test.line(ppp.x, ppp.y, p[0], p[1]).stroke({ width: 1 , color: '#0B7FFF'})
        return po
    }

    ppl = [p1[0]]
    var i = 1, slens = lens[lens.length-1]

    //console.log(sh1.svg.length())
    console.log('path: ' + JSON.stringify(pp))
    console.log('p1: ' + JSON.stringify(p1))
    /*console.log(p1[i])
    console.log(p1[i-1])
    while(lens[0] && lens[0][0] < 0) {
        //console.log('0')

            pp.push(addPoint(p1[i], p1[i-1], lens, slens, pp, i == p1.length-1 ? 1 : 0))
            slens = lens.splice(0, 1)[0]
            i++
        }
    console.log('path: ' + JSON.stringify(pp))
    console.log('lens: ' + JSON.stringify(lens))*/

    for(var i=1; i<p1.length; i++) {
        while(lens[0] && lens[0][0] < 0) {
            pp.push(addPoint(p1[i], p1[i-1], lens, slens, pp, i == p1.length-1 ? 1 : 0))
            slens = lens.splice(0, 1)[0]
        }
        ppl.push(p1[i])
        l = pathLen2(ppl, sh1)
        while(lens[0] && lens[0][0] <= l) {
            //console.log('<>')
            pp.push(addPoint(p1[i], p1[i-1], lens, slens, pp, i == p1.length-1 ? 1 : 0))
            slens = lens.splice(0, 1)[0]
        }
        while(lens[0] && lens[0][0] >= sh1.svg.length()) {
            pp.push(addPoint(p1[i], p1[i-1], lens, slens, pp, i == p1.length-1 ? 1 : 0))
            slens = lens.splice(0, 1)[0]
        }
    }
    /*console.log('path: ' + JSON.stringify(pp))
    console.log('lens: ' + JSON.stringify(lens))

    while(lens[0] && lens[0][0] >= sh1.svg.length()) {
        //console.log('>len')
            pp.push(addPoint(p1[p1.length-1], p1[p1.length-2], lens, slens, pp, i == p1.length-1 ? 1 : 0))
            slens = lens.splice(0, 1)[0]
        }*/
    console.log('path: ' + JSON.stringify(pp))
    console.log('lens: ' + JSON.stringify(lens))

    for(var i=Math.max(1, p1.length-2); i>0; i--) {
        //console.log('i: ' + i)
        ppl.splice(i, 1)
        //console.log('ppl: ' + JSON.stringify(ppl))
        l = pathLen2(ppl, sh1)
        //console.log('length: ' + l)
        while(lens[0] && lens[0][0] > l) {
            //console.log('reverse')
            pp.push(addPoint(p1[i], p1[i-1], lens, slens, pp, i == p1.length-1 ? 1 : 0))
            slens = lens.splice(0, 1)[0]
        }
        while(lens[0] && lens[0][0] >= 0) {
            //console.log('reverse2')
            pp.push(addPoint(p1[i], p1[i-1], lens, slens, pp, i == p1.length-1 ? 1 : 0))
            slens = lens.splice(0, 1)[0]
        }
        while(lens[0]) {
            //console.log('reverse2')
            pp.push(addPoint(p1[i], p1[i-1], lens, slens, pp, i == p1.length-1 ? 1 : 0))
            slens = lens.splice(0, 1)[0]
        }
    }
    console.log('path: ' + JSON.stringify(pp))
    console.log('lens: ' + JSON.stringify(lens))
    //console.log('p1: ' + JSON.stringify(p1))
    console.log('i: ' + i)
    /*while(lens[0]) {
        //console.log('0 - end')
            pp.push(addPoint(p1[i], p1[p1.length-1], lens, slens, pp, i == p1.length-1 ? 1 : 0))
            slens = lens.splice(0, 1)[0]
            i++
        }

    console.log('lens: ' + JSON.stringify(lens))
    console.log('path: ' + JSON.stringify(pp))
    //console.log('p1: ' + JSON.stringify(p1))*/

    if(getx(pp[1]) == getx(pp[0]) && gety(pp[1]) == gety(pp[0])) {
        console.log('splice last point')
        var lastP = pp.splice(1,1)
        pp.push(lastP[0])
        var pen = pp[pp.length-2]
        d = distance(getp(pen), [pen[3], pen[4]])
        a = turnCW(getAngle(getp(pen), [pen[3], pen[4]]), Math.PI)
        p = pointByAngleDistance(getp(pen), a, d)
        pp[pp.length-1][1] = p[0]
        pp[pp.length-1][2] = p[1]

        if(p1[end1][0] == 'C') {
            pp[pp.length-1][3] = p1[end1][3]
            pp[pp.length-1][4] = p1[end1][4]
        }
    }

    if(p2[p2.length-1][0] == 'Z')
        pp.push(['Z'])
    console.log('path: ' + JSON.stringify(pp))
    return pp.join(' ')
}

combineCTeeth = function(sh1, sh2) {
    var len1 = sh1.svg.length(),
        tno = Math.round(sh2.attd),
        r = len1 / tno,
        gear = sh2.points,
        center = gear[0],
        first = gear[1],
        pp1 = sh1.svg.array().value,
        end1 = pp1.length - 1,
        pp = [pp1[0]], relg = [], len, i, tg, p, lastadd, gtg
        test = SVG.get('testlayer')

    if(sh2.closed)
        gtg = turnCCW(getAngle(first, center), (Math.PI/2))
    else
        gtg = getAngle(first, center)

    gear.splice(0,1)
    if(['Z', 'z'].indexOf(pp1[end1][0]) != -1)
        end1--

    console.log('p1: ' + JSON.stringify(pp1))
    console.log('tno: ' + tno)
    console.log('r: ' + r)
    console.log('gtg: ' + gtg)
    console.log('getAngle(first, center): ' + getAngle(first, center))
    var tgp = pointByAngleDistance(first, gtg, 100)
    test.line(first[0], first[1],center[0], center[1]).stroke({color: '#C55458', width: 1})
    test.line(first[0], first[1], tgp[0], tgp[1]).stroke({color: '#C55458', width: 1})
    buildTooth = function(tan, p, lens) {
        var res = [], po
        console.log('tg: ' + tg)
        lens.forEach(function(l) {
            po = ['L']
            console.log('an: ' + turnCW(tan, l[1]))
            po = po.concat(pointByAngleDistance(p, turnCW(tan, l[1]), l[0]))
            res.push(po)
        })
        console.log('tooth: ' + JSON.stringify(res))
        return res
    }

    for(i=1; i<gear.length; i++) {
        relg.push([
            distance(first, gear[i]),
            angleDiffCW(gtg, getAngle(first, gear[i]))
        ])
    }

    console.log('relg: ' + JSON.stringify(relg))

    for(i=0, j=1; i<tno, j<=end1; i++, j++) {
        len = i*r
        plen = pathLen3(sh1.svg, j)
        console.log('i: ' + i)
        console.log('j: ' + j)
        console.log('len: ' + len)
        console.log('plen: ' + plen)
        if(len < plen) {
            tg = getTangent2(sh1.svg, len)
            p = sh1.svg.pointAt(len)
            pp = pp.concat([['L', p.x, p.y]]).concat(buildTooth(tg, [p.x, p.y], relg))

            j--
        }
        else {
            i--
            //pp.push(['L', getx(pp1[j]), gety(pp1[j])])
        }
        console.log('path: ' + JSON.stringify(pp))
    }

    if(pp1[pp1.length-1][0] == 'Z')
        pp.push(['Z'])

    return pp.join(' ')
}

lengthAt = function(path, p) {
    var len = path.length()
    var plen, po, i = 0
    while(i < len) {
        po = path.pointAt(i)
        if(po.x == p[0] && po.y == p[1])
            return i
        i++
    }
    return
}

newCurvePoint = function(p1, a1, a2, p2, m, g){
    console.log('p1: ' + JSON.stringify(p1))
    console.log('a1: ' + JSON.stringify(a1))
    console.log('a2: ' + JSON.stringify(a2))
    console.log('p2: ' + JSON.stringify(p2))
    console.log('m: ' + JSON.stringify(m))

    var a = Math.cos(angleDiff(getAngle(p1,p2), getAngle(p1,m))) * distance(p1,m),
        b = Math.cos(angleDiff(getAngle(p2,p1), getAngle(p2,m))) * distance(p2,m),
        r1 = a/(a+b),
        r2 = b / (a+b)

    console.log('r1: ' + r1)
    console.log('r2: ' + r2)

    /*var path1 = g.path(['M', p1[0], p1[1], 'C', a1[0], a1[1], a2[0], a2[1], p2[0], p2[1]].join(' '))
    var t = lengthAt(path1, m)
    console.log('getLength t: ' + t)

    if(t) {
        var d = path1.length(),
            r1 = t/d,
            r2 = (d-t)/d
        console.log('r1: ' + r1)
        console.log('r2: ' + r2)
    }*/


    SVG.get('testlayer').circle(7).cx(m[0]).cy(m[1]).fill('#007AFF')
    SVG.get('testlayer').line(p1[0],p1[1], a1[0],a1[1]).stroke({color:'#C55458', width:2}).opacity(0.5)
    SVG.get('testlayer').line(p2[0],p2[1], a2[0],a2[1]).stroke({color:'#C55458', width:2}).opacity(0.5)

    var m1 = pointByAngleDistance(
        a1,
        getAngle(a1,a2),
        distance(a1,a2) * r1
    )
    console.log('a1-a2: ' + distance(a1,a2))
    console.log('m1 dist: ' + (distance(a1,a2) * r1))
    console.log('m1: ' + JSON.stringify(m1))

    SVG.get('testlayer').circle(7).cx(m1[0]).cy(m1[1]).fill('#20B2AA').opacity(0.5)
    var a11 = pointByAngleDistance(
        p1,
        getAngle(p1,a1),
        distance(p1,a1) * r1
    )
    console.log('p1-a1: ' + distance(p1,a1))
    console.log('a11 dist: ' + (distance(p1,a1) * r1))
    console.log('a11: ' + JSON.stringify(a11))

    SVG.get('testlayer').circle(7).cx(a11[0]).cy(a11[1]).fill('#C55458').opacity(0.5)
    var a21 = pointByAngleDistance(
        p2,
        getAngle(p2,a2),
        distance(p2,a2) * r2
    )

    console.log('p2-a2: ' + distance(p2,a2))
    console.log('a21 dist: ' + (distance(p2,a2) * r2))
    console.log('a21: ' + JSON.stringify(a21))

    SVG.get('testlayer').circle(7).cx(a21[0]).cy(a21[1]).fill('#C55458').opacity(0.5)
    var a12 = pointByAngleDistance(
        a11,
        getAngle(a11, m1),
        distance(a11, m1) * r1
    )
    console.log('a11-m1: ' + distance(a11, m1))
    console.log('a12 dist: ' + (distance(a11, m1) * r1))
    console.log('a12: ' + JSON.stringify(a12))

    SVG.get('testlayer').circle(7).cx(a12[0]).cy(a12[1]).fill('#C91313').opacity(0.9)
    var a22 = pointByAngleDistance(
        a21,
        getAngle(a21, m1),
        distance(a21, m1) * r2
    )

    console.log('a21-m1: ' + distance(a21, m1))
    console.log('a22 dist: ' + (distance(a21, m1) * r2))
    console.log('a22: ' + JSON.stringify(a22))

    SVG.get('testlayer').circle(7).cx(a22[0]).cy(a22[1]).fill('#C91313').opacity(0.9)

    SVG.get('testlayer').line(a11[0],a11[1], m1[0],m1[1]).stroke({color:'#20B2AA', width:2}).opacity(0.5)
    SVG.get('testlayer').line(a21[0],a21[1], m1[0],m1[1]).stroke({color:'#20B2AA', width:2}).opacity(0.5)

    SVG.get('testlayer').line(a12[0],a12[1], m[0],m[1]).stroke({color:'#C91313', width:2}).opacity(0.5)
    SVG.get('testlayer').line(a22[0],a22[1], m[0],m[1]).stroke({color:'#C91313', width:2}).opacity(0.5)

    if(p1[0] == a1[0])

    return [
        ['C', a11[0], a11[1], a12[0], a12[1], m[0], m[1]],
        ['C', a22[0], a22[1], a21[0], a21[1], p2[0], p2[1]]
    ]
}

buildNewCurve = function(p0, a1, a2, p2, ratio){

    var x1 = a1[0],
        x2 = a2[0],
        y1 = a1[1],
        y2 = a2[1],
        x = p2[0],
        y = p2[1]
    if(ratio instanceof Array) {
        ratio = pathLen2([
            'M', p0[0], p0[1], 
            'C', a1[0], a1[1], a2[0], a2[1], p2[0], p2[1]
            ].join(" "), 
        sh1) / pathLen2([
            'M', p0[0], p0[1], 
            'C', a1[0], a1[1], a2[0], a2[1], ratio[0], ratio[1]
            ].join(" "), 
        sh1)
    }

    var p0_x = (p0[0] + x1) * ratio
    var p1_x = (x1 + x2) * ratio
    var p2_x = (x2 + x) * ratio
    var p01_x = (p0_x + p1_x) * ratio
    var p12_x = (p1_x + p2_x) * ratio
    new_x = (p01_x + p12_x) * ratio
    var p0_y = (p0[1] + y1) * ratio
    var p1_y = (y1 + y2) * ratio
    var p2_y = (y2 + y) * ratio
    var p01_y = (p0_y + p1_y) * ratio
    var p12_y = (p1_y + p2_y) * ratio
    new_y = (p01_y + p12_y) * ratio
    
    return [['C', p0_x, p0_y, p01_x, p01_y, new_x, new_y], 
        ['C', p12_x, p12_y, p2_x, p2_y, x, y]
    ]
}

cloneObj = function cloneObj(p) {
    var obj = {}
    var k = Object.keys(p)
    for(key of k)
        obj[key] = p[key]
    return obj
}