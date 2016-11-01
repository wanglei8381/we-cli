#we-cli
 微信小程序工具

###Install
npm install -g we-cli <br><br>

###Use
支持npm和es6语法,将px自动转化为rpx<br>
<pre>
微信小程序结构目录
{
    src: 微信小程序的源码,可以使用ES6/ES7语法(),
    dist: we-cli自动生成的目录(将微信开发者工具的项目目录设在这里)
    node_modules: npm安装包
    .babelrc: babel配置,可自己调整
    ...:其它
}
在项目目录下的控制台运行 we 即可自动编译
we -w 监听文件更改自动编译
</pre>