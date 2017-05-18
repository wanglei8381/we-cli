var gulp = require('gulp');
var $path = require('path');
var fs = require('fs-extra');
var chalk = require('chalk');
var babel = require('gulp-babel');
var wxss = require('./wxss');
var del = require('del');
const package = require('../package.json');
const program = require('commander');

//定义参数,以及参数内容的描述
program
  .version(package.version)
  .option('-c, --clean', '清空dist目录')
  .option('-w, --watch', '监听文件变化')
  .parse(process.argv);

var workspace = checkWorkspace(process.cwd())

if (program.clean) {
  gulp.start(cleanTask(workspace))
} else {
  var task = createTask(workspace)
  if (program.watch) {
    watchTask(task)
  }

  gulp.start(task)
}

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
               .on('error', printError)
               .pipe(gulp.dest(workspace.dist))
               .on('end', function () {
                 console.log(chalk.green('js 编译结束'), '\n')
               })
  });

  gulp.task('we:wxss', function () {
    return gulp.src(`${workspace.src}/**/*.wxss`)
               .pipe(wxss)
               .on('error', printError)
               .pipe(gulp.dest(workspace.dist))
               .on('end', function () {
                 console.log(chalk.green('wxss 编译结束'), '\n')
               })
  });

  gulp.task('we:other', function () {
    return gulp.src([`${workspace.src}/**/*`, `!${workspace.src}/**/*.js`, `!${workspace.src}/**/*.wxss`])
               .on('error', printError)
               .pipe(gulp.dest(workspace.dist))
               .on('end', function () {
                 console.log(chalk.green('file 编译结束'), '\n')
               })
  });

  var task = gulp.task('default', ['we:js', 'we:wxss', 'we:other']);

  task.on('start', function () {
    console.log(chalk.blue('开始编译'), '\n')
  })

  task.on('stop', function () {
    console.log(chalk.blue('编译结束'), '\n')
  })

  return ['default']
}

function cleanTask (workspace) {
  gulp.task('clean', function () {
    del([workspace.dist]).then(() => {
      console.log('\n', chalk.green('clean success'), '\n')
    })
  })

  return ['clean']
}

// 创建监听任务
function watchTask (task) {
  const watcher = gulp.watch('**/*', {
    interval: 1000,
    debounceDelay: 1000,
    cwd: workspace.src
  }, task)

  watcher.on('change', function (event) {
    var index = event.path.indexOf('src')
    var path = event.path.substring(index)
    console.log(chalk.blue(`\n ${path} ${event.type} \n`));
  });
}

function printError (error) {
  console.log()
  let str = error.toString()
  if (str === 'Error: write after end') {
    console.log(chalk.green('编译中...'))
  } else {
    console.log(str)
  }
  console.log()
}