var rollup = require('rollup');
var commonjs = require('rollup-plugin-commonjs');
var fs = require('fs');
var $path = require('path');
var util = require('./util');

var cache;


function packaging(entry, dist) {
    rollup.rollup({
        entry: entry,
        format: 'cjs',
        cache: cache,
        plugins: [
            commonjs({
                sourceMap: false,  // Default: true
            })
        ]
    }).then(function (bundle) {
        var result = bundle.generate({
            format: 'cjs'
        });

        //绑定一个全局变量中,主要是解决像lodash这样库
        var code = `'use strict';
    
     var global = {
        Array: Array,
        Date: Date,
        Error: Error,
        Function: Function,
        Math: Math,
        Object: Object,
        RegExp: RegExp,
        String: String,
        TypeError: TypeError
     }
     ` + result.code.replace('\'use strict\';', '');

        cache = bundle;
        fs.writeFileSync(dist, code);

    });
}

//检查包名
var requireNodeModulesReg = /require\(['"]([A-z].*)['"]\)/gm;
var dirname = getNodeModulesPath(process.cwd());
function checkModule(result, path) {

    var modules = [];
    if (dirname) {
        result = result.replace(requireNodeModulesReg, function (arg0, arg1, arg2, arg3) {
            var distPath = $path.join(dirname, arg1);
            if (util.isDir(distPath)) {//在项目node_modules目录下找到这个包
                //是否存在package.json
                var packPath = $path.join(distPath, 'package.json');
                if (util.isFile(packPath)) {
                    var pack = require(packPath);
                    if (pack.main) {//是否设置了入口,没有就是index.js
                        distPath = $path.join(distPath, pack.main);
                    } else {
                        distPath += '/index.js';
                    }
                } else {
                    distPath += '/index.js';
                }
                modules.push(distPath);

                if (path[0] != '.') {
                    path = './' + path;
                }
                return 'require("' + path + '/' + arg1 + '/index.js"\)';
            }
            console.warn('[we][modules]模块没找到或引入了系统模块', arg0);
        });
    } else {
        // console.warn('[we][modules]没找到node_modules目录');
    }
    return {
        result: result,
        modules: modules
    };
}

//node_modules的路径
function getNodeModulesPath(path) {
    while (!util.isDir(path + '/node_modules')) {
        if (path === '/') {
            return null;
        }
        path = $path.dirname(path);
    }
    return path + '/node_modules';
}

exports.packaging = packaging;
exports.checkModule = checkModule;