const gulp = require("gulp");
const del = require("del")
const $ = require('gulp-load-plugins')()
const connect = require("gulp-connect");
const fileinclude = require('gulp-file-include');
const proxy = require('http-proxy-middleware');
const rootPath = "./dist/"; // 静态输出文件地址

gulp.task("del", () => {
  return del('./dist')
})

gulp.task("html", () => {
  return gulp.src(["./src/html/**/*.html", '!./**/model.html'])
    .pipe(fileinclude({
      prefix: '@@',//变量前缀 @@include
      basepath: './src/public',//引用文件路径
      indent: true//保留文件的缩进
    }))
    .pipe($.htmlmin({
      removeComments: true,//清除HTML注释
      collapseWhitespace: true,//压缩HTML
      minifyJS: true,//压缩页面JS
      minifyCSS: true,//压缩页面CSS
      collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
      removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
      removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: true//删除<style>和<link>的type="text/css"
    }))
    .pipe(gulp.dest(rootPath))
    .pipe(connect.reload());
});

gulp.task('babel', () => {
  return gulp.src(['./src/js/**/*.js', './src/html/**/*.js'])
    .pipe($.babel({
      presets: ['@babel/preset-env',]
    }))
    .pipe($.uglify())
    .pipe(gulp.dest(rootPath + "js"))
    .pipe(connect.reload());
})

gulp.task("image", () => {
  return gulp.src("./src/assets/**/*.{jpg,png,gif,ico,svg,mp4}")
    // .pipe($.imagemin())
    .pipe(gulp.dest(rootPath + "assets"))
    .pipe(connect.reload());
})

gulp.task("scss", () => {
  /**
   * gulp-sass编译scss文件
   */
  return gulp.src("./src/css/**/*.scss")
    .pipe($.sass({ outputStyle: 'compressed' }).on('error', $.sass.logError))
    .pipe($.base64({
      maxImageSize: 8 * 1024
    }))
    .pipe($.autoprefixer({
        overrideBrowserslist: [
          "Android 4.1",
          "iOS 7.1",
          "Chrome > 31",
          "ff > 31",
          "ie >= 8"
        ],      // 浏览器版本
        cascade: true,                    // 美化属性，默认true
        add: true,                       // 是否添加前缀，默认true
        remove: true ,                       // 删除过时前缀，默认true
        flexbox: true                     // 为flexbox属性添加前缀，默认true
    }))
    .pipe(gulp.dest(rootPath + "css")) // css文件输出地址
    .pipe(connect.reload());
});

gulp.task("watch", () => {
  /**
   * 监听文件改动，监听到就执行响应任务
   */
  gulp.watch("./src/css/**/*.scss", gulp.series("scss"));
  gulp.watch("./src/**/*.js", gulp.series("babel"));
  gulp.watch("./src/**/*.html", gulp.series("html"));
  gulp.watch("./src/img/**/*.{jpg,png,gif,ico}", gulp.series("image"));
});

gulp.task("serve", () => {
  /**
   * 使用gulp-connect创建一个服务器运行静态文件
   */
  $.connect.server({
    root: rootPath,
    livereload: true, // 自动更新
    port: 3000,
    host: '0.0.0.0'
    // middleware: function (connect, opt) {
    //   return [
    //     proxy('/customer', {
    //       target: 'http://xx.xx.xx.xxx:10086',
    //       changeOrigin: true
    //     })
    //   ]
    // }
  });
})

/**
* 执行任务列表
* gulp.series -> 运行任务序列
* gulp.parallel -> 并行运行任务
*/
gulp.task("default", gulp.series("del", "image", gulp.parallel("serve", "watch", "babel", "scss", "html")));