var gulp         = require('gulp'),
    fs = require('fs'),
    sass         = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS    = require('gulp-clean-css'),
    browserSync  = require('browser-sync').create(),
    concat       = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    cache       = require('gulp-cache'),
    uglify       = require('gulp-uglify'),
    fileinclude = require('gulp-file-include');
var jade = require('gulp-jade');
var watch = require('gulp-watch');
var gulp_watch_jade = require('gulp-watch-jade');
var data = require("gulp-data");


gulp.task('jade', function() {
    var YOUR_LOCALS = JSON.parse( fs.readFileSync('data.json', { encoding: 'utf8' }) );

    gulp.src('./jade/**/*.jade')
        .pipe(jade({
            locals: YOUR_LOCALS,
            pretty: true
        })).on('error', function (err) {
        console.log(err);
    })
    .pipe(gulp.dest('./app/'))
});


gulp.task('img', function() {
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('app/img'));
});

gulp.task('browser-sync', ['styles', 'scripts','jade'], function() {
    browserSync.init({
        server: {
            baseDir: "./app"
        },
        notify: false
    });
});

gulp.task('styles', function () {
    return gulp.src('scss/*.scss')
        .pipe(sass({
            includePaths: require('node-bourbon').includePaths
        }).on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 15 versions'], cascade: false}))
        //.pipe(cleanCSS())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
    return gulp.src([
        './app/libs/jquery/jquery-1.11.2.min.js',
        './app/libs/fancyBox/jquery.fancybox.js',
        './app/libs/plugins-scroll/plugins-scroll.js',
        './app/libs/magnific-popup/dist/jquery.magnific-popup.min.js',
        './app/libs/lightslider/dist/js/lightslider.min.js',
        './app/libs/tether/dist/js/tether.min.js',
        './app/libs/jquery.countdown/dist/jquery.countdown.min.js'
    ])
        .pipe(concat('libs.js'))
        //.pipe(uglify()) //Minify libs.js
        .pipe(gulp.dest('./app/js/'));
});

gulp.task('common', function() {
    return gulp.src('./app/js/common.js')
        .pipe(uglify())
        .pipe(gulp.dest('./app/js/'));
});
gulp.task('fileinclude', function() {
    gulp.src('./pages/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./app'))
});
gulp.task('watch', function () {
    gulp.watch('scss/*.scss', ['styles']);
    gulp.watch('pages/**/*.html', ['fileinclude']);
    gulp.watch('parts/**/*.html', ['fileinclude']);
    gulp.watch('jade/**/*.jade', ['jade']);
    gulp.watch('app/libs/**/*.js', ['scripts']);
    gulp.watch('app/js/*.js').on("change", browserSync.reload);
    gulp.watch('jade/**/*.jade').on("change",function(){
        setTimeout(function () {
            browserSync.reload();
        }, 1500);
    });
});

gulp.task('default', ['browser-sync', 'watch']);