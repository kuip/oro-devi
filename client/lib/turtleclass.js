SVG.TGraph = SVG.invent({
  create: "path",
  
  // Specify from which existing class this shape inherits
  inherit: SVG.Path,
  
  // Add custom methods to invented shape
  extend: {
    // Create method to proportionally scale the rounded corners
    render: function(force){
      if (this.pathArray.length < 1) return;
      
      this.plot(this.pathArray);
      //this.review(force);
    }, 
    init: function(width, height){
        this.width = width; 
        this.height = height;
        this.pendown = false;
        this.X = 0;
        this.Y = 0;
        this.A = 0.5;
        this.S = 1;
        this.sign = 1;
        this.decimals = 3;
        this.memArray =[];
        this.pathArray =[];
        this.turtleArray =[];
        console.log(this)
        return this; 
    },
    round: function(nr,dec){
        if (dec === undefined) dec=this.decimals;
        return Math.round(nr*Math.pow(10,dec))/Math.pow(10,dec);  
    },
    review: function(force){ 
        if (!force) {
            svg.attr({'viewBox': "0 0 1448 1024"});
            return;
        }
        var box = this.bbox();
        //console.log(box);
        var r1 = this.width/this.height;
        var r2 = box.width/box.height;
        var scale = 1;
        if (r1 < r2) {
            scale = this.width/box.width;
        } else {
            scale = this.height/box.height;
        }
        if (scale == Infinity) return;
        var x2 = -box.x*scale, y2 = -box.y*scale;
        //layer.transform({ matrix: scale+",0,0,"+scale+","+x2+","+y2 });
        //semantic.transform({matrix: scale+",0,0,"+scale+","+x2+","+y2});
        svg.attr('viewBox', box.x+' '+box.y+' '+box.width+' '+box.height);
    },
    f: function(distance){
      console.log(this)
        if (!this.pendown) {
            this.pendown = true;
            this.pathArray.push(["M", this.round(this.X), this.round(this.Y)]);
            this.memState();
        }
        //console.log(this.X,this.Y,this.A); 
        this.X = this.X + Math.sin(this.A*Math.PI*2)*distance;
        this.Y = this.Y + Math.cos(this.A*Math.PI*2)*distance;
        this.pathArray.push(["L", this.round(this.X), this.round(this.Y)]);
        this.memState();
    },
    g: function(distance){
        if (this.pendown) {
            this.pendown = false;
        }
        this.X = this.X + Math.sin(this.A*Math.PI*2)*distance;
        this.Y = this.Y + Math.cos(this.A*Math.PI*2)*distance;
        this.memState();
    },
    b: function(distance){
        if (!this.pendown) {
            this.pendown = true;
            this.pathArray.push(["M", this.round(this.X), this.round(this.Y)]);
            this.memState();
        }
        this.X = this.X - Math.sin(this.A*Math.PI*2)*distance;
        this.Y = this.Y - Math.cos(this.A*Math.PI*2)*distance;
        this.pathArray.push(["L", this.round(this.X), this.round(this.Y)]);
        this.memState();
    },
    z: function(){
        this.pathArray.push(["Z"]);
        this.memState();
    },
    rt: function(angle, r){
        if (r !== undefined) {
            var _180 = 0;
            if (angle > 0.5) _180 =1;
            var newangle = this.A - 1/4 * this.sign
            var cx = this.X + Math.sin(newangle*Math.PI*2)*r;
            var cy = this.Y + Math.cos(newangle*Math.PI*2)*r;
            newangle = newangle + (0.5-angle)*this.sign;
            
            this.pathArray.push(['A', r, r, 0,
            _180, 1, 
            this.round(cx + Math.sin(newangle*Math.PI*2)*r),
            this.round(cy + Math.cos(newangle*Math.PI*2)*r) 
            ]) ;
            this.Y = cy + Math.cos(newangle*Math.PI*2)*r
            this.X = cx + Math.sin(newangle*Math.PI*2)*r;
        }
        this.A = (this.A - angle*this.sign)%1;
        this.memState();
    },
    lt: function(angle, r){
        if (r !== undefined) {
            var _180 = 0;
            if (angle > 0.5) _180 =1;
            var newangle = this.A - 1/4 * this.sign
            var cx = this.X - Math.sin(newangle*Math.PI*2)*r;
            var cy = this.Y + Math.cos(newangle*Math.PI*2)*r;
            newangle = newangle - (0.5-angle)*this.sign;
            
            this.pathArray.push(['A', r, r, 0,
            _180, 0, 
            this.round(cx - Math.sin(newangle*Math.PI*2)*r),
            this.round(cy - Math.cos(newangle*Math.PI*2)*r) 
            ]) ;
            this.Y = cy - Math.cos(newangle*Math.PI*2)*r 
            this.X = cx - Math.sin(newangle*Math.PI*2)*r;
        }
        this.A = (this.A + angle*this.sign)%1;
        this.memState();
    },
    T: function(angle){
        this.A = angle%1;
        this.memState();
    },
    m: function(x, y){
        this.X = this.X + x;
        this.Y = this.Y + y;
        this.pathArray.push(["M", this.round(this.X), this.round(this.Y)]);
        this.memState();
    },
    l: function(x, y){
        this.X = this.X + x;
        this.Y = this.Y + y;
        this.pathArray.push(["L", this.round(this.X), this.round(this.Y)]);
        this.memState();
    },
    M: function(x, y){
        this.X = x;
        this.Y = y;
        this.pathArray.push(["M", this.round(this.X), this.round(this.Y)]);
        this.memState();
    },
    L: function(x, y){
        this.X = x;
        this.Y = y;
        this.pathArray.push(["L", this.round(this.X), this.round(this.Y)]);
        this.memState();
    },
    memState: function(){
        var x =this.X, y=this.Y, a=this.A;
        this.memArray.push([x, y, a]);
    },
    t: function(str, edge, angle){
        var lifo = [], comm={},attr=0, sign=1, comma=1,inc=0, inc0=0, deg = 360;
        var self = this;
        comm.attrs=[0,0,0];
        var dolast = function(this1){
            comm.attrs[attr] = comm.attrs[attr]*sign;
            switch (comm.comm){
                case "F":
                    this1.f(comm.attrs[0]);
                    this1.turtleArray.push(["F",comm.attrs[0]]);
                    break;
                case "G":
                    this1.g(comm.attrs[0]);
                    this1.turtleArray.push(["G",comm.attrs[0]]);
                    break;
                case "RT":
                    this1.rt(comm.attrs[0]/deg);
                    this1.turtleArray.push(["RT",comm.attrs[0]]);
                    break;
                case "LT":
                    this1.lt(comm.attrs[0]/deg);
                    this1.turtleArray.push(["LT",comm.attrs[0]]);
                    break;
                case "RA":
                    this1.rt(comm.attrs[0]/deg,comm.attrs[1]);
                    this1.turtleArray.push(["RA",comm.attrs[0],,comm.attrs[1]]);
                    break;
                case "LA":
                    this1.lt(comm.attrs[0]/deg,comm.attrs[1]);
                    this1.turtleArray.push(["LA",comm.attrs[0],,comm.attrs[1]]);
                    break;
                case "M":
                    this1.M(comm.attrs[0],comm.attrs[1]);
                    this1.turtleArray.push(["M",comm.attrs[0],comm.attrs[1]]);
                    break; 
                case "Z":
                    this1.z();
                    this1.turtleArray.push(["Z"]);
                    break;
            }
            
            comm={};
            attr=0;
            sign=1;
            comma=1;
            inc = 0;
            inc0=0;
            self = this;
            comm.attrs =[0,0,0];
        }
        
        if (typeof str == "object"){
            for( ndx in str) {
                comm.comm = str[ndx][0];
                comm.attrs = [str[ndx][1], str[ndx][2] ]
                dolast(self); 
                
            }
        }
        
        for (var ndx in str){
            switch (str[ndx]){
                case "F":
                  dolast(this);
                  comm.comm = "F";
                  break;
                case "G":
                  dolast(this);
                  comm.comm = "G";
                  break;
                case "A":
                  dolast(this);
                  comm.comm = "A";
                  break;
                case "M":
                  dolast(this);
                  comm.comm = "M";
                  break;
                case "S":
                  //edge = edge/2;
                  f(edge);
                  break;
                case "<":
                  if (comm.comm == "A"){
                      comm.comm = "RA";
                  } else {
                      dolast(this);
                      comm.comm = "RT";
                  }
                  break;
                case ">":
                  if (comm.comm == "A"){
                      comm.comm = "LA";
                  } else {
                      dolast(this);
                      comm.comm = "LT";
                  }
                  break;
                case "Z":
                  dolast(this);
                  comm.comm = "Z";
                  break;
                case "[":
                  dolast(this);
                  lifo.push([this.X, this.Y, this.A]);
                  break;
                case "]":
                  dolast(this);
                  var temp = lifo.pop();
                  this.X = temp[0];
                  this.Y = temp[1];
                  this.A = temp[2];
                  break;
                case ",":
                    comm.attrs[attr] = comm.attrs[attr]*sign;
                    sign=1;
                    attr=attr+1;
                    break;
                case ".":
                    comma = 0;
                    inc = -1;
                    break;
                case "-":
                    sign =-1;
                    break;
                default:
                  if (/^[0-9]+$/.test(str[ndx]) ) {
                      comm.attrs[attr] = comm.attrs[attr]*Math.pow(10,comma) + parseInt(str[ndx])*Math.pow(10,inc0); 
                      inc0 = inc0 + inc;
                  }
            } 
            
        } 
        dolast(this); 
    }
  },
  // Add method to parent elements 
  construct: {
    // Create a rounded element
    tgraph: function(width, height) {
      
      return this.put(new SVG.TGraph).init(width, height); 

  }
}});

SVG.LSys = SVG.invent({
  // Define the type of element that should be created
  create: 'path',

  // Specify from which existing class this shape inherits
  inherit: SVG.TGraph,

  // Add custom methods to invented shape
  extend: {
    // Create method to proportionally scale the rounded corners
    iter: function(start, productions, iter, edge, angle, cb, attrs){
        
        if (typeof start == "object"){
            //console.log(typeof start)
            productions=start.rules;
            iter=start.iter;
            edge = start.side;
            angle= start.angle;
            start= start.start;
        }
      if (iter === 0) {
        var lifo=[], temp = [];
        //console.log(start);
        for (var ndx in start){
          switch (start[ndx]){
              case "F":
                  this.f(edge);
                  break;
              case "G":
                  this.f(edge);
                  break;
              case "U":
                  this.fu(edge);
                  break;
              case "S":
                  //edge = edge/2;
                  this.f(edge);
                  break;
              case "<":
                  this.rt(angle);
                  break;
              case ">":
                  this.lt(angle);
                  break;
              case "[":
                  lifo.push([this.X, this.Y, this.A]);
                  //console.log(lifo);
                  break;
              case "]":
                  
                  var temp2 = lifo.pop();
                  //console.log(temp);
                  this.X = temp2[0];
                  this.Y = temp2[1];
                  this.A = temp2[2];
                  //this.M(this.X, this.Y);
                  break;
          }
        }
        
        return;
      }
      var st = "";
      for (var ndx2 in start){
        if (start[ndx2] in productions) {
            st= st+productions[start[ndx2]];
        } else {
            st=st+start[ndx2];
        }
      }
      this.iter(st, productions, iter-1, edge, angle, cb, attrs);
    }
  },

  // Add method to parent elements
  construct: {
    // Create a rounded element
    lsys: function(width, height) {
      return this.put(new SVG.LSys).init(width, height)
    }

  }
});

var Oroboro = {}; 
Oroboro.Human= {
        standing: [[0,0],[0,150],[0,63],[0,-30],[0,-85],[-63,7],[-85,93],[-80,176],[-78,203],[65,8],[95,93],[82,174],[82,200],[-30,150],[-25,309],[-15,461],[-33,479],[30,150],[27,309],[22,459],[44,476],[0,0],[-74,229],[-104,205],[81,226],[105,199]],
        show: [[0,0],[0,150],[0,63],[0,-30],[0,-85],[-63,7],[-136,21],[-223,-15],[-242,-26],[65,8],[95,93],[82,174],[82,200],[-30,150],[-25,309],[-15,461],[-33,479],[30,150],[27,309],[22,459],[44,476],[0,0],[-261,-37],[-226,-45],[81,226],[105,199]],
        joint: [
            ["Base", 40],
            ["SpineBase", 24],
            ["SpineMid", 16],
            ["Neck", 16],
            ["Head", 20],
            ["ShoulderLeft", 16],
            ["ElbowLeft", 16],
            ["WristLeft", 16],
            ["HandLeft", 16],
            ["ShoulderRight", 16],
            ["ElbowRight", 16],
            ["WristRight", 16],
            ["HandRight", 16],
            ["HipLeft", 16],
            ["KneeLeft", 16],
            ["AnkleLeft", 16],
            ["FootLeft", 16],
            ["HipRight", 16],
            ["KneeRight", 16],
            ["AnkleRight", 16],
            ["FootRight", 16],
            ["SpineShoulder", 20],
            ["HandTipLeft", 10],
            ["ThumbLeft", 16],
            ["HandTipRight", 10],
            ["ThumbRight", 16]
        ],
        bone: [
            [0,1,50],
            [1,20,70],
            [20,2,10],
            [2,3,.4],
            [0,12,40],
            [0,16,40],
            [12,13,30],
            [13,14,25],
            [14,15,25],
            [16,17,30],
            [17,18,25],
            [18,19,25],
            [20,4,45],
            [4,5,25],
            [5,6,20],
            [6,7,20],
            [7,21,10],
            [6,22,5],
            [20,8,45],
            [8,9,25],
            [9,10,20],
            [10,11,20],
            [11,23,10],
            [10,24,5] 
        ]
    }


SVG.Puppet = SVG.invent({
  // Define the type of element that should be created
  create: 'g',

  // Specify from which existing class this shape inherits
  inherit: SVG.Container ,

  // Add custom methods to invented shape
  extend: {
    // Create method to proportionally scale the rounded corners
    ini: function(x,y,position,head) { 
        //this.item = svg.group();
        //console.log(Oroboro.Human[position])
        var self = this 
        this.scale=1;
        this.x =x;
        this.y=y;
        this.jointsItem=this.group()
        this.joints=[];
        this.bones=[]; 
        this.bonesItem=this.group()
        
        if (Oroboro.Human[position] !== undefined){
            self.joints.push(this.circle(Oroboro.Human.joint[0][1]*this.scale).cx((Oroboro.Human[position][0][0]+x)*this.scale).cy((Oroboro.Human[position][0][1]+y)*this.scale).attr({ 
                stroke: "#fff",
                "stroke-width": 2
            }).draggable());
            this.joints[0].on("dragmove", function(delta, event){
                self.get()
                //self.set(delta.x,delta.y)
            })
        } else {
            //self.joints[0].cx(x).cy(y);
        }
         
        
        for (var ndx=1;ndx <Oroboro.Human.joint.length;ndx++){
            //console.log(h.Class[position][ndx][1]) 
            if (Oroboro.Human[position] !== undefined){
                
                this.joints[ndx] = this.circle(Oroboro.Human.joint[ndx][1]*this.scale).cx(Oroboro.Human[position][ndx][0]*this.scale+x).cy(Oroboro.Human[position][ndx][1]*this.scale+y).attr({
                stroke: "#fff",
                "stroke-width": 2*this.scale
                }).draggable(
                    /*
                    function (x, y) {
                    var res = {};
                    var snapRange = 2;
                    res.x = x - (x % snapRange);
                    res.y = y + (y % snapRange);
                    return res;
                } */ 
                ); 
                
            if (ndx == 3 || ndx ==4){
                self.joints[ndx].on("dragend", function(e){
                console.log(e)
                self.modHead(self) // self this
                    
            })
            }    
                
                
            
            } else {
                self.joints[ndx].cx(self.joints[ndx].cx()+x).cy(this.joints[ndx].cy()+y)
                console.log(self.joints[ndx].cy()+y)
            }

        } 
        
        if (Oroboro.Human[position] !== undefined){
        this.setBones()
        this.head = head;
        this.headItem = this.image(this.head, 100, 100) //.cx(this.joints[4].cx()).cy(this.joints[4].cy()+10)
        
        this.modHead()
        this.headItem.on("mouseover",function(e){
            //alert(this);
            this.back()
        })
        this.headItem.on("mouseout",function(e){
            //alert(this);
            this.front()
        })
        }
        return this;
    },
    modHead: function(self1){ 
        console.log(this);
        //var self = this
        //this = self1;
        //var x = self1.joints[4].cx()-self1.joints[3].cx();
        //var y = self1.joints[4].cy()-self1.joints[3].cy(); 
        var x = this.joints[4].cx()-this.joints[3].cx();
        var y = this.joints[4].cy()-this.joints[3].cy();
        var w = Math.sqrt(y*y + x*x);
        //console.log(w);
        var ang = y/x;
        var s = 1;
        if (y<0) s=-1;
        console.log(ang);
        //self1.headItem.attr({width:2*w,height:2*w}).cx(self1.joints[4].cx()).cy(self1.joints[4].cy()+10); 
        //self1.headItem.transform({rotation:(-Math.atan((1/ang+0.00))*180/Math.PI)})  // (ang)*180/Math.PI+270  // -90*s
        this.headItem.attr({width:2*w,height:2*w}).cx(this.joints[4].cx()).cy(this.joints[4].cy()+10); 
        this.headItem.transform({rotation:(-Math.atan((1/ang+0.00))*180/Math.PI)})  // (ang)*180/Math.PI+270  // -90*s
        //self1.say();
        
    },
    setBones: function(){
        for (var ndx in Oroboro.Human.bone){
            //console.log(this.joints[h.Class.bone[ndx][1]].connectable()) 
             
            this.joints[Oroboro.Human.bone[ndx][0]+1].connectable({container: this.bonesItem,
                width: Oroboro.Human.bone[ndx][2]*this.scale},
            this.joints[Oroboro.Human.bone[ndx][1]+1]
            );
            
             
        }
    },
    mirror: function(){
        var x= this.joints[0].cx();
        var y= this.joints[0].cy(), temp;
        for (var ndx=1;ndx <Oroboro.Human.joint.length;ndx++){
            
            this.joints[ndx].cx(-this.joints[ndx].cx()+2*x).cy(this.joints[ndx].cy())
        }
        this.bonesItem.clear()
        this.setBones();
        return this;
    },
    say: function(text){
        if (text !== undefined) {
            this.say=text;
        } else {
            text = this.say;
        }
        //this.item.add( new SVG.TGraph)
        var gr = this.jointsItem.group();
        var dialog = gr.tgraph(0,0);
        dialog.t("M"+(this.joints[4].cx()+50)+","+(this.joints[4].cy())+"<30F120>120F50A<90,20F130A<90,20F300A<90,20F130A<90,20F150Z");
        dialog.opacity=0.5; 
        dialog.render(false);
        dialog.attr({opacity:0.5,fill:"#ddd"})
        gr.text(text).font({size:38}).cx(this.x+200).cy(this.y-270)
        return this;
    },
    think: function(text){
        if (text !== undefined) {
            this.think=text;
        } else {
            text = this.think;
        }
        var gr = this.jointsItem.group();
        var dialog = gr.tgraph(0,0);
        dialog.t("M"+(this.x+45)+","+(this.y-107)+">90A<180,7F15A<180,7F20ZM"+(this.x+70)+","+(this.y-120)+"A<180,15F50A<180,15F50ZM"+(this.x+50)+","+(this.y-150)+"A<180,75F250A<180,75Z");
        dialog.opacity=0.5
        dialog.render(false);
        dialog.attr({opacity:0.5,fill:"#ddd"})
        gr.text(text).font({size:38}).cx(this.x+180).cy(this.y-220)
    }
  },

  // Add method to parent elements
  construct: {
    // Create a rounded element
    
    puppet: function(x,y,stance,head) {
        //this.put(new SVG.Puppet)
        console.log("om") 
        // new SVG.Puppet
        //this.ini(x,y,stance)
      return this.put(new SVG.Puppet).ini(x,y,stance,head);
    } 

  }
})