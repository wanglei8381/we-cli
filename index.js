//node_modules中的包rollup读取生成一个文件
//项目中的业务代码使用babel进行转码
//业务代码放在src
//在dist目录下生成对应的目录
//监听业务代码,如果有更改自动更新


var fs = require('fs');
var $path = require('path');
var util = require('./util');
var chokidar = require('chokidar');
var babel = require("babel-core");

var baseDir = $path.join(__dirname, 'src');
var targetDir = $path.join(__dirname, 'dist');
if (!util.isDir(baseDir)) {
    return console.log('[we]当前目录不合法');
}

//dist目录不存在就创建
if (!util.exists(targetDir)) {
    fs.mkdirSync(targetDir);
}

var babelOptions = {
    "presets": [
        [
            "es2015"
        ]
    ]
};
//.babelrc目录不存在就创建
if (!util.exists(__dirname + '/.babelrc')) {
    fs.writeFileSync(__dirname + '/.babelrc', `{
        "presets": [
            [
                "es2015"
            ]
        ]
    }`);
} else {
    var babelrc = fs.readFileSync(__dirname + '/.babelrc');
    if (babelrc.length) {
        babelOptions = JSON.parse(babelrc);
    }
}

function execute(baseDir, targetDir) {
    if (util.isFile(baseDir)) {
        fs.readFile(baseDir, function (err, data) {
            if (!err) {
                var result = data;
                if ($path.extname(baseDir) === '.js') {
                    result = babel.transform(data, babelOptions).code;
                }

                fs.writeFile(targetDir, result, function (err) {
                    if (err) {
                        console.log('[execute]保存文件失败', err.stack);
                    }
                });
            } else {
                console.log('[execute]读取文件失败', err.stack);
            }
        })
    } else {
        if (!util.exists(targetDir)) {
            fs.mkdirSync(targetDir);
        }
    }

}

//1.读取文件夹下所有的文件
// execute(baseDir, targetDir);
//2.监听文件变化,动态修改文件
var watcher = chokidar.watch(baseDir, {ignored: /[\/\\]\./}).on('all', (event, path) => {
    console.log(event, path);
    execute(path, path.replace('src', 'dist'));
});

watcher.on('ready', function () {
    console.log('[we-cli] complete');
    var arguments = process.argv.splice(2);
    if (arguments.indexOf('-w') === -1) {
        watcher.close();
    }
});
