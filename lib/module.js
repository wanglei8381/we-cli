var gutil = require('gulp-util')
var through = require('through2')
module.exports = through.obj(function (file, enc, cb) {
  if (file.isNull()) {
    return cb(null, file)
  }

  if (file.isStream()) {
    return cb(new gutil.PluginError('gulp-wxss', 'Streaming not supported'))
  }

  var contents = file.contents.toString()

  file.contents = new Buffer(contents)
  this.push(file)

  cb()
})
