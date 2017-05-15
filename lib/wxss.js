var gutil = require('gulp-util')
var through = require('through2')
module.exports = through.obj(function (file, enc, cb) {
  if (file.isNull()) {
    return cb(null, file)
  }

  if (file.isStream()) {
    return cb(new gutil.PluginError('gulp-wxss', 'Streaming not supported'))
  }

  file.contents = new Buffer(file.contents.toString().replace(/([0-9])px/gm, '$1rpx'))
  this.push(file)

  cb()
})
