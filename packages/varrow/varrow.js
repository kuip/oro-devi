var arrowpath = "M473.5081481933594 403.6498718261719L543.261474609375 591.7460327148438L467.0019836425781 620.031494140625L397.2481689453125 431.92144775390625L288.46337890625 507.9150695800781L289.48748779296875 27.689218521118164L605.5325317382812 390.3436584472656ZM370.7626953125 788.2200927734375C370.7626953125 678.7659912109375 459.42071533203125 590.10791015625 568.875 590.10791015625C678.3292846679688 590.10791015625 766.9876098632812 678.7659912109375 766.9876098632812 788.2200927734375C766.9876098632812 897.674560546875 678.3292846679688 986.33251953125 568.875 986.33251953125C459.42071533203125 986.33251953125 370.7626953125 897.674560546875 370.7626953125 788.2200927734375Z"

var arrow = '<path xmlns="http://www.w3.org/2000/svg" d="M473.5081481933594 403.6498718261719L543.261474609375 591.7460327148438L467.0019836425781 620.031494140625L397.2481689453125 431.92144775390625L288.46337890625 507.9150695800781L289.48748779296875 27.689218521118164L605.5325317382812 390.3436584472656ZM370.7626953125 788.2200927734375C370.7626953125 678.7659912109375 459.42071533203125 590.10791015625 568.875 590.10791015625C678.3292846679688 590.10791015625 766.9876098632812 678.7659912109375 766.9876098632812 788.2200927734375C766.9876098632812 897.674560546875 678.3292846679688 986.33251953125 568.875 986.33251953125C459.42071533203125 986.33251953125 370.7626953125 897.674560546875 370.7626953125 788.2200927734375Z" name="undefined" id="Z6XCLYMvsmimfMDTP" type="complex_path" stroke="#e3e3e3" stroke-width="16" stroke-opacity="0.6560738083034341" fill="#3c3c3c" fill-opacity="0.8260117452516215" stroke-linejoin="round" stroke-linecap="round" opacity="1"/>'

VArrow = class VArrow {
  constructor(svgdom, size = 50) {
    var self = this
    this.draw = SVG(svgdom)
    this.drawid = this.draw.attr('id')
    this.size = 50
    this.id = "varrow"
    this.arrow = this.draw.path(arrowpath).size(this.size).attr("id", "varrow")
    this.bbox = this.arrow.bbox()
  }

  start() {
    var self = this
    this.arrow.front()

    document.getElementById(this.drawid).addEventListener('mousemove', function(e) {
      var id = e.target.getAttribute('id')
      if(id == self.drawid || id == self.id) {
        self.arrow.move(e.pageX-self.bbox.width*2/3, e.pageY-self.bbox.height*5/6)
        e.preventDefault()
        e.stopPropagation()
      }
    })
    document.getElementById(this.id).addEventListener('click', function(e) {
      var coord = self.getCoord()
      console.log('click: ' + JSON.stringify(coord))
      simulate2(document.elementFromPoint(coord.pointerX, coord.pointerY), 'click', coord)
    })
    document.getElementById(this.id).addEventListener('mousemove', function(e) {
      console.log('arrow mousemove')
      var coord = self.getCoord()
      simulate2(document.elementFromPoint(coord.pointerX, coord.pointerY), 'mousemove', coord)
    })
    document.getElementById(this.id).addEventListener('mousedown', function(e) {
      console.log('arrow mousedown')
      var coord = self.getCoord()
      simulate2(document.elementFromPoint(coord.pointerX, coord.pointerY), 'mousedown', coord)
    })
    document.getElementById(this.id).addEventListener('mouseup', function(e) {
      console.log('arrow mouseup')
      var coord = self.getCoord()
      simulate2(document.elementFromPoint(coord.pointerX, coord.pointerY), 'mouseup', coord)
    })
    document.getElementById(this.id).addEventListener('touchstart', function(e) {
      console.log('arrow touchstart')
      var coord = self.getCoord()
      simulate2(document.elementFromPoint(coord.pointerX, coord.pointerY), 'touchstart', coord)
    })
    document.getElementById(this.id).addEventListener('touchmove', function(e) {
      console.log('arrow touchmove')
      var coord = self.getCoord()
      simulate2(document.elementFromPoint(coord.pointerX, coord.pointerY), 'touchmove', coord)
    })
    document.getElementById(this.id).addEventListener('touchend', function(e) {
      console.log('arrow touchend')
      var coord = self.getCoord()
      simulate2(document.elementFromPoint(coord.pointerX, coord.pointerY), 'touchend', coord)
    })
  }

  stop() {

  }

  getCoord() {
    return {
      pointerX: this.arrow.x()-3,
      pointerY: this.arrow.y()-3
    }
  }
}
