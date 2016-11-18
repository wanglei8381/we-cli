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
var modules = require("./modules");
var wxss = require("./wxss");
var dirname = process.cwd();
var baseDir = $path.join(dirname, 'src');
var targetDir = $path.join(dirname, 'dist');
if (!util.isDir(baseDir)) {
    return console.log('[we]当前目录不合法', baseDir);
}

//dist目录不存在就创建
if (!util.exists(targetDir)) {
    fs.mkdirSync(targetDir);
}

var babelOptions = {
    "presets": [
        "es2015"
    ]
};
//.babelrc目录不存在就创建
if (!util.exists(dirname + '/.babelrc')) {
    fs.writeFileSync(dirname + '/.babelrc', `{
        "presets": [
            "es2015"
        ]
    }`);
} else {
    var babelrc = fs.readFileSync(dirname + '/.babelrc');
    if (babelrc.length) {
        babelOptions = JSON.parse(babelrc);
    }
}

//第三方包
var moduleStack = [];
function execute(baseDir, targetDir) {
    if (util.isFile(baseDir)) {
        fs.readFile(baseDir, function (err, data) {
            if (!err) {
                var result = data;
                var extname = $path.extname(baseDir);
                if (extname === '.js') {//对js处理
                    try {
                        result = babel.transform(data, babelOptions).code;
                    } catch (e) {
                        result = data.toString();
                        console.log('[we]代码解析出错', e.stack);
                    }
                    var res = modules.checkModule(result, $path.relative($path.dirname(targetDir), dirname + '/dist/modules'));
                    if (res.modules.length) {
                        result = res.result;
                        //更新第三方包
                        updateModules(res.modules);
                    }
                } else if (extname === '.wxss') {//css处理
                    result = wxss(result);
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

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync($path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

function updateModules(list) {

    list.forEach(function (item) {
        if (moduleStack.indexOf(item) === -1) {
            moduleStack.push(item);

            var dist = item.replace('node_', 'dist/').replace(/^(.+?modules\/.+?\/).*/, '$1index.js');
            // var dist = $path.dirname(item.replace('node_', 'dist/')) + '/index.js';

            mkdirsSync($path.dirname(dist));
            modules.packaging(item, dist);
        }
    })
}


//1.读取文件夹下所有的文件
// execute(baseDir, targetDir);
//2.监听文件变化,动态修改文件
var watcher = chokidar.watch(baseDir, {ignored: /[\/\\]\./}).on('all', (event, path) => {
    console.log(event, path);
    if (event === 'unlink') {
        fs.unlink(path.replace('src', 'dist'));
    } else if (event === 'unlinkDir') {
        fs.rmdirSync(path.replace('src', 'dist'));
    } else {
        execute(path, path.replace('src', 'dist'));
    }
});

watcher.on('ready', function () {
    console.log('[we-cli] complete');
    var arguments = process.argv.splice(2);
    if (arguments.indexOf('-w') === -1) {
        watcher.close();
    }
});
