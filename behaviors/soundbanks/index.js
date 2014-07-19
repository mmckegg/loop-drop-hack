var Through = require('through')

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
  }
}

var remotes = {}

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
  
}, 4000)


var client1 = {
  playback: {
    "notes":[
      [144,0,127,2.4011558311608496,2.832901862906965],
      [144,1,127,3.515781050076839,0.8127658084849827],
      [144,9,127,6.766507305083451,1.0680505180457658],
      [144,8,127,7.695372886811583,0.9983232583131212]
    ],
    "length":8
  },
  slots: [{"id":"0","sources":[{"node":"oscillator","amp":{"node":"adsr","value":0.6,"sustain":0.6936970634671219,"attack":0.03448246259644347,"release":0.06117639692700699,"decay":0.07202819654634152,"startValue":0},"note":{"node":"scale","root": 67,"scale":"major"},"frequency":440}],"processors":[{"node":"delay"},{"node":"overdrive"}]},{"id":"1","node":"inherit","from":"0","offset":1},{"id":"2"},{"id":"3"},{"id":"4"},{"id":"5"},{"id":"6"},{"id":"7"},{"id":"8","node":"inherit","from":"0","offset":2},{"id":"9","node":"inherit","from":"0","offset":3},{"id":"10"},{"id":"11"},{"id":"12"},{"id":"13"},{"id":"14"},{"id":"15"},{"id":"16"},{"id":"17"},{"id":"18","sources":[{"node":"oscillator","amp":{"node":"adsr","value":0.6,"attack":0.07665470367173381,"release":0.051866401632789653},"note":60,"frequency":440},{"node":"oscillator","amp":{"node":"adsr","value":0.6,"attack":0.07622354425253441,"release":0.05717529127455557},"note":64,"frequency":440}]},{"id":"19"},{"id":"20"},{"id":"21"},{"id":"22"},{"id":"23"},{"id":"24"},{"id":"25"},{"id":"26"},{"id":"27"},{"id":"28"},{"id":"29"},{"id":"30"},{"id":"31"},{"id":"32"},{"id":"33"},{"id":"34"},{"id":"35"},{"id":"36"},{"id":"37"},{"id":"38"},{"id":"39"},{"id":"40"},{"id":"41"},{"id":"42"},{"id":"43"},{"id":"44"},{"id":"45"},{"id":"46"},{"id":"47"},{"id":"48"},{"id":"49"},{"id":"50"},{"id":"51"},{"id":"52"},{"id":"53"},{"id":"54"},{"id":"55"},{"id":"56"},{"id":"57"},{"id":"58"},{"id":"59"},{"id":"60"},{"id":"61"},{"id":"62"},{"id":"63"},{"id":"A"},{"id":"B"},{"id":"C"},{"id":"D"},{"id":"E"},{"id":"F"},{"id":"G"},{"id":"H"}]
}
var client2 = {
  playback: {
    "notes":[
      [144,0,127,2.4011558311608496,2.832901862906965],
      [144,1,127,3.515781050076839,0.8127658084849827]
    ],
    "length":8
  },
  slots: [{"id":"0","sources":[{"node":"oscillator","amp":{"node":"adsr","value":0.6,"sustain":0.6936970634671219,"attack":0.03448246259644347,"release":0.06117639692700699,"decay":0.07202819654634152,"startValue":0},"note":{"node":"scale","root": 55,"scale":"major"},"frequency":440}],"processors":[{"node":"delay"},{"node":"overdrive"}]},{"id":"1","node":"inherit","from":"0","offset":1},{"id":"2"},{"id":"3"},{"id":"4"},{"id":"5"},{"id":"6"},{"id":"7"},{"id":"8","node":"inherit","from":"0","offset":2},{"id":"9","node":"inherit","from":"0","offset":3},{"id":"10"},{"id":"11"},{"id":"12"},{"id":"13"},{"id":"14"},{"id":"15"},{"id":"16"},{"id":"17"},{"id":"18","sources":[{"node":"oscillator","amp":{"node":"adsr","value":0.6,"attack":0.07665470367173381,"release":0.051866401632789653},"note":60,"frequency":440},{"node":"oscillator","amp":{"node":"adsr","value":0.6,"attack":0.07622354425253441,"release":0.05717529127455557},"note":64,"frequency":440}]},{"id":"19"},{"id":"20"},{"id":"21"},{"id":"22"},{"id":"23"},{"id":"24"},{"id":"25"},{"id":"26"},{"id":"27"},{"id":"28"},{"id":"29"},{"id":"30"},{"id":"31"},{"id":"32"},{"id":"33"},{"id":"34"},{"id":"35"},{"id":"36"},{"id":"37"},{"id":"38"},{"id":"39"},{"id":"40"},{"id":"41"},{"id":"42"},{"id":"43"},{"id":"44"},{"id":"45"},{"id":"46"},{"id":"47"},{"id":"48"},{"id":"49"},{"id":"50"},{"id":"51"},{"id":"52"},{"id":"53"},{"id":"54"},{"id":"55"},{"id":"56"},{"id":"57"},{"id":"58"},{"id":"59"},{"id":"60"},{"id":"61"},{"id":"62"},{"id":"63"},{"id":"A"},{"id":"B"},{"id":"C"},{"id":"D"},{"id":"E"},{"id":"F"},{"id":"G"},{"id":"H"}]
}



function createSoundbank(data){

  var instance = window.context.addRemoteInstance()

  data.slots.forEach(function(descriptor){
    instance.update(descriptor)
  })

  instance.loop.setPlayback(data.playback.notes, data.playback.length)
}


//setTimeout(function(){
//  createSoundbank(client1)
//}, 3000)
//
//setTimeout(function(){
//  createSoundbank(client2)
//}, 3000)
