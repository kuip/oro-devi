OController = {}
OController.utils = {}

// Transforms units, decimals, powers to number and viceversa
// {{base1, base2, dec, unit, pow}}
transform = OController.utils.transform = function(obj) {
  //console.log('transform: ' + JSON.stringify(obj))
  if((obj.dec instanceof String && obj.dec.indexOf('.') != -1) ||  (obj.dec instanceof Number && obj.dec != Math.floor(obj.dec)) || (!obj.unit && obj.unit != 0))
    return toUnits(obj)

  return toNumber(obj)
}

toNumber = function(obj) {
  //console.log('toNumber')
  if(!obj.base1 && obj.unit instanceof Number && obj.dec instanceof Number && obj.pow instanceof Number)
    obj.base1 = 10
  if(!obj.base1)
    return
  if(!obj.base2)
    obj.base2 = 10

  var no
  var powbase10 = Math.pow(10, 
    parseInt(String(obj.pow), obj.base1)
  )
  // for 0 we loose the minus, so we have to add it manually
  var unitsbase10 = (String(obj.unit) == '-0' ? '-' : '') +
    (
      parseInt( String(obj.unit), obj.base1 ) + 
      '.' 
    ) + 
    getZeros(String(obj.dec)) +
    parseInt( String(obj.dec), obj.base1 )

  //console.log('powbase10: ' + powbase10)
  //console.log('unitsbase10: ' + unitsbase10)
  no = powbase10 * unitsbase10
  //console.log('no10: ' + no)
  //console.log('base2: ' + obj.base2)
  if(obj.base2 != 10)
    no = no.toString(obj.base2)
  //console.log('no base2: ' + no)
  obj.dec = no
  return obj
}

toUnits = function(obj) {
  //console.log('toUnits')
  if(obj.dec instanceof Number && !obj.base2)
    obj.base2 = 10
  if(!obj.base2)
    return
  if(!obj.base1)
    obj.base1 = 10

  var no = String(obj.dec)
  var sign
  if(no[0] == '-') {
    sign = '-'
    no = no.substring(1)
  }
  var decind = no.indexOf('.')
  //console.log('no: ' + no)
  // base 10:
  // make sure we don't have decimals
  if(decind != -1) {
    no = no.substring(0, decind) + no.substring(decind+1)
    // this is the power of base2 needed to have an integer
    decind = no.length - decind
    //console.log('decind: ' + decind)
    no = parseInt(no, obj.base2)
    //console.log('no: ' +no)
    // devide by the power of base2 needed to have an integer
    no = no / Math.pow(obj.base2, decind)
  }
  else
    no = parseInt(no, obj.base2)

  //console.log('base 10: ' + no)
  // base1:
  no = no.toString(obj.base1)
  //console.log('base1 no: ' + no)

  obj.unit = no[0]
  var decind = no.indexOf('.')
  if(decind == -1) {
    obj.pow = no.length - 1
    obj.dec = no.substring(1) || '0'
  }
  else {
    obj.pow = no.substring(0, decind).length - 1
    obj.dec = no.substring(1, decind) + no.substring(decind+1)
  }
  if(sign == '-')
    obj.unit = '-' + obj.unit
  return obj
}


getZeros = function(decimals) {
  var zeros = ''

  while(decimals[0] == '0') {
    zeros += '0'
    decimals = decimals.substring(1)
  }
  return zeros
}

// decimals / units+decimals


// buton desenat programatic
// sagetile si butonul le iau direct
// OController.utils.transform({unit: 2, dec: '015', pow: 2, base1: 10})

getAngle = function(center, p1) {
    var p0 = {x: center.x, y: center.y - Math.sqrt(Math.abs(p1.x - center.x) * Math.abs(p1.x - center.x) + Math.abs(p1.y - center.y) * Math.abs(p1.y - center.y))};
    return (2 * Math.atan2(p1.y - p0.y, p1.x - p0.x));// * 180 / Math.PI;
}

rotateMatrix = function (a, rad, pivot) {
    //a can either be an array or an object of the type {a:1, b:0, c:0, d:1, e:0, f:0}
    if(a instanceof Array){
        var aa = a[0],
            ab = a[1],
            ac = a[2],
            ad = a[3],
            atx = a[4],
            aty = a[5];
    }
    else{
        var aa = a.a,
            ab = a.b,
            ac = a.c,
            ad = a.d,
            atx = a.e,
            aty = a.f;
    }
    var st = Math.sin(rad),
        ct = Math.cos(rad),
        out = [];

    //if we have a pivot point for the rotation, such as the center of the item, we do a translation of (-pivot.x, -pivot.y)
    if(pivot){
        atx = - aa * pivot.x - ac * pivot.y + atx
        aty = - ab * pivot.x - ad * pivot.y + aty
    }
    
    //matrix rotation algorithm
    out[0] = aa*ct + ab*st;
    out[1] = -aa*st + ab*ct;
    out[2] = ac*ct + ad*st;
    out[3] = -ac*st + ct*ad;
    out[4] = ct*atx + st*aty;
    out[5] = ct*aty - st*atx;

    //translation to original location: (+pivot.x, +pivot.y)
    if(pivot){
        out[4] = aa * pivot.x + ac * pivot.y + out[4]
        out[5] = ab * pivot.x + ad * pivot.y + out[5]
    }

    //same type of output as input
    if(a instanceof Array)
        return out;
    else
        return {a: out[0], b: out[1], c: out[2], d: out[3], e: out[4], f: out[5]}
};

transformPoint = function(point, matrices){
  if(!(matrices instanceof Array))
    matrices = [matrices]

  for(m in matrices)
      point = transformMat2d(point, matrices[m]);
  return point;
}

transformMat2d = function(point, m) {
    if(!(m instanceof Array))
        m = [m.a, m.b, m.c, m.d, m.e, m.f];
    var x = point.x,
        y = point.y,
        out = {};
    out.x = m[0] * x + m[2] * y + m[4];
    out.y = m[1] * x + m[3] * y + m[5];
    return out;
};

pointCoordAngle = function(center, tempangle, centerdist) {
  var deltastartx = centerdist * Math.cos(tempangle)
  var deltastarty = centerdist * Math.sin(tempangle)
  return {
    x: center.x + deltastartx,
    y: center.y + deltastarty
  }
}

pointCoord = function(center, point, deltaangle, centerdist) {

  // Y axis up = 0 degrees
  var tempangle = getAngle(center, point)
  tempangle += deltaangle

  // the formula works for X axis (right) = 0 degrees, so we have to transform
  if(tempangle >= Math.PI/2)
    tempangle -= Math.PI/2
  else
    tempangle = 2*Math.PI - Math.PI/2 + tempangle
  
  var deltastartx = centerdist * Math.cos(tempangle)
  var deltastarty = centerdist * Math.sin(tempangle)
  return {
    x: center.x + deltastartx,
    y: center.y + deltastarty
  }
}