var watchify = require('watchify')
var catw = require('catw')
var mcss = require('micro-css')
var Concat = require('concat-stream')
var watchViews = require('rincewind-watch')
var gaze = require('gaze')
var getResourceKey = require('unique-resource')

var fs = require('fs')
process.cwd(__dirname)
if (!fs.existsSync('build')){
  fs.mkdirSync('build')
}



var viewPath = __dirname + '/views'

watchViews({
  window: viewPath + '/window.html',
  nodeEditor: viewPath + '/nodes/editor.html'
}, function(views, changedFiles){
  fs.writeFileSync(viewPath + '/index.js', getViewsModule(views, viewPath))
  changedFiles.forEach(function(f){
    if (/.js$/.exec(f) && require.cache[f]){
      ;delete require.cache[f]
    }
  })
  fs.writeFile('build/index.html', views.window())
})

function getViewsModule(views, relativeTo){
  var results = Object.keys(views).map(function(key){
    return key + ': View(' + views[key].stringify(relativeTo) + ')' 
  })
  return '// generated by ../build.js\n' + 
    'var View = require("rincewind")\n' + 
    'module.exports = {\n  ' + results.join(',\n  ') + '\n}'
}

catw('package.json', function(stream){
  stream.pipe(Concat(function(data){
    var pkg = JSON.parse(data)
    fs.writeFile('build/manifest.json', JSON.stringify({
      name: 'Loop Drop',
      version: pkg.version,
      description: pkg.description,
      author: pkg.author,
      manifest_version: 2,
      permissions: pkg.permissions,
      app: {
        background: {
          scripts: ['background.js']
        }
      }//,
      //icons: {
      //  16: "icon-16.png", 
      //  128: "icon-128.png"
      //}
    }, null, 2))

    fs.writeFile(
      'build/background.js', 
      "chrome.app.runtime.onLaunched.addListener(function() { \n" +
      "  chrome.app.window.create('index.html', " + JSON.stringify(pkg.window || null) + ")\n" +
      "})"
    )

  }))
})

gaze('**/*.mcss', function(err, watcher){

  var styles = {}
  var cache = {}

  function update(filepath){
    var key = getResourceKey(filepath, {cache: false})
    var content = fs.readFileSync(filepath)
    content = mcss(key + ' { ' + content + ' }')

    if (content){
      styles[filepath] = content
    } else {
      delete styles[filepath]
    }

  }

  function dumpFile(){
    var content = ''
    Object.keys(styles).forEach(function(k){
      content += styles[k]
    })
    fs.writeFile('build/resource.css', content)
  }

  this.watched(function(err, watched) {
    for (var dir in watched){
      for (var i=0;i<watched[dir].length;i++){
        var file = watched[dir][i]
        if (file.slice(-5) === '.mcss'){
          update(file)
        }
      }
    }
    dumpFile()
  })

  this.on('changed', function(filepath){
    update(filepath)
    dumpFile()
  })
})

catw('styles/*.mcss', function(stream){
  stream.pipe(Concat(function(data){
    fs.writeFile('build/bundle.css', mcss(String(data)))
  }))
})

catw('styles/*.css', function(stream){
  stream.pipe(fs.createWriteStream('build/extra.css'))
})

var w = watchify('./index.js')
//w.require('through')
w.on('update', bundle)
bundle()
function bundle(){
  w.bundle({debug: true}).pipe(fs.createWriteStream('build/bundle.js'))
}

function getHtml(options){
  var result = ''
  result += "<!doctype html>\n"
  if (options.title){
    result += "<title>" + options.title + "</title>\n"
  }

  if (options.styles){
    options.styles.forEach(function(style){
      result += '<link rel="stylesheet" href="' + style + '"></script>'
    })
  }

  result += '<body>\n'

  if (options.scripts){
    options.scripts.forEach(function(script){
      result += '<script src="' + script + '"></script>'
    })
  }

  result += '</body>\n'

  return result
}