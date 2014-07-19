var Through = require('through')
var h = require('create-element')

var remotes = {}

module.exports = {
  muteRemoteButton: function(element){
    var value = true
    element.onclick = function(){
      if (window.context.outputFromRemote.gain.value){
        window.context.outputFromRemote.gain.value = 0
        element.classList.add('-active')
      } else {
        window.context.outputFromRemote.gain.value = 1
        element.classList.remove('-active')
      }
    }
  },
  renderRemotes: function(el){
    
    function refreshRemotes(){
      var result = [];
      Object.keys(remotes).forEach(function(clientId){
        result.push(h('li', String(clientId)))
      })
      el.innerHTML = result.join('')
    }

    window.events.on('newRemote', refreshRemotes)
  },
}

var decode = Through(function(data){
  this.queue(JSON.parse(data))
})

setTimeout(function(){

  var stream = Through(function(object){

    if (!remotes[object.clientId]){
      remotes[object.clientId] = window.context.addRemoteInstance()
      window.events.emit('newRemote', object.clientId)
    }

    var instance = remotes[object.clientId]

    if (object.updateSlot){
      instance.update(object.updateSlot)
    }

    if (object.updateLoop){
      instance.loop.setPlayback(object.updateLoop.notes, object.updateLoop.length)
    }
  })

  window.context.serverStream.pipe(decode).pipe(stream)
  
}, 400)

function createSoundbank(data){

  var instance = window.context.addRemoteInstance()

  data.slots.forEach(function(descriptor){
    instance.update(descriptor)
  })

  instance.loop.setPlayback(data.playback.notes, data.playback.length)
}
