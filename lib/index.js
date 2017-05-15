var gulp = require('gulp');
var $path = require('path');
var fs = require('fs-extra');
var chalk = require('chalk');
var babel = require('gulp-babel');
var wxss = require('./wxss');

var workspace = checkWorkspace(process.cwd())

var task = createTask(workspace)

console.log(chalk.blue('开始编译...'))

gulp.start(task)

watchTask(task)

// 检查工作空间
function checkWorkspace (workpath) {
  var srcPath = $path.join(workpath, 'src')
  var distPath = $path.join(workpath, 'dist')
  if (!fs.existsSync(srcPath)) {
    console.log(chalk.bold.red(`在${workpath}工作目录下，不存在src目录`))
    process.exit(-1)
  }

  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath)
  }

  return {
    src: srcPath,
    dist: distPath
  }
}

// 创建任务
function createTask (workspace) {
  gulp.task('we:js', function () {
    return gulp.src(`${workspace.src}/**/*.js`)
               .pipe(babel())
               .pipe(gulp.dest(workspace.dist))
  });

  gulp.task('we:wxss', function () {
    return gulp.src(`${workspace.src}/**/*.wxss`)
               .pipe(wxss)
               .pipe(gulp.dest(workspace.dist))
  });

  gulp.task('we:other', function () {
    return gulp.src(['${workspace.src}/**/*', `!${workspace.src}/**/*.js`, `!${workspace.src}/**/*.wxss`])
               .pipe(gulp.dest(workspace.dist))
  });

  gulp.task('default', ['we:js', 'we:wxss', 'we:other']);

  return ['default']
}

function watchTask (task) {
  const watcher = gulp.watch('**/*', { cwd: workspace.src })

  watcher.on('change', function (event) {
    var index = event.path.indexOf('src')
    var path = event.path.substring(index)
    console.log(`\n ${path} ${event.type} \n`);
    gulp.start(task)
  });
}