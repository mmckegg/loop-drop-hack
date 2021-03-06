var Through = require('through')

module.exports = Quantizer

function Quantizer(positionHandler){
  var lastOnPositions = {}

  var stream = Through(function(data){
    var key = data[0] + '/' + data[1]
    var position = data[3] != null ? data[3] : positionHandler()
    var lastPosition = lastOnPositions[key]

    // quantize if grid specified
    if (this.grid){
      position = Math.round(position / this.grid) * this.grid

      // make sure note length is at least 1 grid
      if (!data[2] && position <= lastPosition){ 
        position += this.grid
      }
    }

    if (data[2]){
      lastOnPositions[key] = position
    }

    // don't emit double up notes
    if (!data[2] || lastPosition !== position){
      var newData = data.slice()
      newData[3] = position
      this.queue(newData)
    }

  })
  return stream
}