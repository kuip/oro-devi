SVGMenu = {}
levels = {}
SVGMenu.createMenu = function(data, cage, draw, menulevel) {
  //console.log('cage: ' + JSON.stringify(cage))
  var menuid = Random.id(),
    menu = draw.group().attr('id', menuid),
    //initial size
    si = data.size, 
    magnitude = data.magnitude,
    position = data.position, 
    icons = data.icons,
    //main menu axis, on which it spans
    axis1 = ['L', 'R'].indexOf(position) != -1 ? 'y' : 'x',
    // the other axis, with the icon's height
    axis2 = axis1 == 'x' ? 'y' : 'x',
    // total menu distance (width / height of the screen), depending on position
    dist = ['L', 'R'].indexOf(position) != -1 ? Math.abs(cage.y2-cage.y1) : Math.abs(cage.x2-cage.x1),
    // this means that we have to subtract distances 
    // if menu is on the bottom, we have to subtract the menu size from the y axis
    sign = ['L', 'T'].indexOf(position) != -1 ? 1 : -1,
    // icon separator distance
    sep = 0,
    // middle point
    mid = cage[axis1 + '1'] + dist / 2,
    no1 = icons.length,
    // total menu distance (width / height)
    dmenu = no1 * si + sep * (no1-1),
    // menu start point on main axis
    start1 = mid - dmenu / 2,
    // menu stop point on main axis
    stop1 = mid + dmenu /2,
    // start point on secondary axis
    start2 = sign == 1 ? ((axis1 == 'x' ? cage.y1 : cage.x1)) : ((axis1 == 'x' ? cage.y2 : cage.x2)),
    formula = si * magnitude,
    elems = [], center, img,
    modified = 0,
    size = {}, pos = {},
    stop2 = start2 + sign*si,
    menulevel = menulevel || 0

  levels[menulevel] = { menu: menu }

  size[axis1] = dmenu
  size[axis2] = si
  pos[axis1 + '1'] = start1
  pos[axis2 + '1'] = start2
  pos[axis1 + '2'] = stop1
  pos[axis2 + '2'] = stop2
//console.log(JSON.stringify(pos))
  //console.log('start2: ' + start2)
  //console.log('mid: ' + mid)

  // create array with default positions on axis1
  var s1 = start1, defaultPos = []
  for(var a = 0; a < icons.length; a++) {
    defaultPos.push(s1)
    s1 += si
  }
  defaultPos.push(s1)

  elems = createIcons(menu, icons, si, data, cage, draw, formula, defaultPos, elems, axis1, axis2, start1, start2, pos, stop2, menulevel, sign)
  placeIcons(elems, defaultPos, axis1, axis2, start2, stop2, sign)

  $('#' + draw.attr('id')).on('mousemove', function(e) {
    if($(e.target).attr('id') == draw.attr('id') && modified == 1) {
      placeIcons(elems, defaultPos, axis1, axis2, start2, stop2, sign)
      modified = 0
      pos[axis2 + '2'] = stop2
    }
  })

  $('#' + menuid).on('mousemove', function(e) {
    //console.log('modified: ' + modified)
    if(modified == 1)
      pos[axis2 + '2'] = start2 + sign * formula 
    //console.log('mouse: ' + e.pageX + ' - ' + e.pageY)
    //console.log('pos: ' + JSON.stringify(pos))
    if(!(isBetween(e.pageX, pos.x1, pos.x2) && isBetween(e.pageY, pos.y1, pos.y2))) {
      if(modified == 1) {
        placeIcons(elems, defaultPos, axis1, axis2, start2, stop2, sign)
        modified = 0
        pos[axis2 + '2'] = stop2
      }
      return
    }

    var mouse = {
      x: e.pageX,
      y: e.pageY
    }
    //console.log('mouse: ' + JSON.stringify(mouse))
    var tempPos = JSON.parse(JSON.stringify(defaultPos))

    var start = Math.abs(pos[axis1 + '1'] - mouse[axis1])
    var index = Math.ceil(start / (si+sep))
   // console.log('index: ' + index)
    // ratio = mouse position inside the current menu element, relative to the "start" of the element
    var ratio = (start - (index-1) * (si+sep)) / si
    var sz, f
   // console.log('ratio: ' + ratio)
    //console.log('si: ' + si)
    //console.log('formula: ' + (formula))

    tempPos[index-1] -= ratio * formula - ratio * si
    tempPos[index] += (1-ratio) * formula - (1-ratio) * si

    for(var level=1; level < elems.length; level++) {
      if(index-1 - level >= 0) {
        f = si/2 / (Math.abs(mouse[axis1] - tempPos[index -1 - level] - si/2))
        //console.log('index: ' + (index -1 - level) + ' : ' + f)
        //console.log(mouse[axis1] - tempPos[index -1 - level])
        //console.log(Math.abs(mouse[axis1] - tempPos[index -1 - level] - si/2))
        sz = si + (formula - si) * f
        //console.log('ssize: ' + sz)
        tempPos[index-1 - level] = tempPos[index - level] - sz
      }
      if(index + level < tempPos.length) {
        f = si/2 / (Math.abs(mouse[axis1] - tempPos[index + level] + si/2))
        //console.log('index: ' + (index + level) + ' : ' + f)
        //console.log(mouse[axis1] - tempPos[index + level])
        //console.log(Math.abs(mouse[axis1] - tempPos[index + level] + si/2))
        sz = si + (formula - si) * f
       // console.log('ssize: ' + sz)
        tempPos[index + level] = tempPos[index-1 + level] + sz
      }
    }

    placeIcons(elems, tempPos, axis1, axis2, start2, stop2, sign)
    
    modified = 1
  })

  return menu
} 


isBetween = function(val, a,b) {
  if(a > b) {
    var temp = a
    a = b
    b = temp
  }
  return val >= a && val <= b
}

createIcons = function(menu, icons, si, data, cage, draw, formula, defaultPos, elems, axis1, axis2, start1, start2, pos, stop2, menulevel, sign) {
    var elems = []
    icons.forEach(function(i, ind) {
      img = menu.image(i.url).attr('index', ind)
      if(i.children) {
        img.click(function() {
          console.log('click icon')
          var idx = parseInt(this.attr('index'), 10)
          
          //if(!elems[idx].kid) {
          if(!levels[menulevel+1] || levels[menulevel+1].index != idx) {
            clearLevels(elems)
            var dd = data
            data.icons = i.children
            placeIcons(elems, defaultPos, axis1, axis2, start2, stop2, sign)
            pos[axis2 + '2'] = stop2
            var halfdmenu = i.children.length * formula / 2 - formula/2
            var kidcage = {}
            kidcage[axis1 + '1'] = defaultPos[idx] - halfdmenu
            kidcage[axis1 + '2'] = defaultPos[idx+1] + halfdmenu
            kidcage[axis2 + '1'] = Math.min(start2 + sign*formula, start2 + sign*(formula + si))
            kidcage[axis2 + '2'] = Math.max(start2 + sign*formula, start2 + sign*(formula + si))
            //console.log(kidcage)
            //elems[idx].kid = 
            SVGMenu.createMenu(data, kidcage, draw, menulevel+1)
            levels[menulevel+1].index = idx
          }
          else
            clearLevels(elems)
          //  elems[idx].kid.remove()
          //  delete elems[idx].kid
          //}
        })
      }
      else
        img.click(function() {
          clearLevels(elems)
          if(i.callback)
            i.callback()
          else
            saymyname(this.attr('href'), draw)
        })
      elems.push({icon: img})
    })
    return elems
  }

  placeIcons = function(elems, arr, axis1, axis2, start2, stop2, sign) {
    var place = {}, sz
    for(var a = 0; a < arr.length-1; a++) {
      sz = Math.abs(arr[a+1]-arr[a])
      place[axis1] = arr[a]
      place[axis2] = sign == 1 ? start2 : (start2-sz)
      elems[a].icon.size(sz, sz).x(place.x).y(place.y)
    }
  }

  clearLevels = function(elems) {
    var keys = Object.keys(levels)
    for(k in keys)
      if(k != 0) {
        levels[k].menu.remove()
        delete levels[k]
      }
  }

  saymyname = function(name, draw) {
    console.log(name)
    var s = 300
    var gr = draw.group()
    gr.opacity(0)
    var w = $( window ).width(), h = $( window ).height()
    var img = gr.image(name)
    img.size(s, s).cx(w/2).cy(h/2)
    gr.text('clicked').font({size: 60}).cx(w/2).cy(h/2+s/2 + 20)

    gr.animate(600, '>', 0).opacity(1).after(function() {
      this.animate(600, '<', 1000).opacity(0).after(function() {
        this.clear()
      })
    })

  }