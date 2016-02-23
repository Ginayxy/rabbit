var gulp = require('gulp'),
    connect = require('gulp-connect'),
    port = process.env.port || 5005;

// live reload
gulp.task('connect', function(){
    connect.server({
        port: port,
        livereload: true
    })
});

gulp.task('js', function(){
    gulp.src('./js/main.js')
    .pipe(connect.reload())
});

gulp.task('html', function(){
    gulp.src('./index.html')
    .pipe(connect.reload())
});

gulp.task('css', function(){
    gulp.src('./css/*.css')
    .pipe(connect.reload())
});

gulp.task('watch',function(){
   gulp.watch('./js/*.js',['js']);
   gulp.watch('./*.html',['html']);
   gulp.watch('./css/*.css',['css']);
});

gulp.task('default',['connect','watch']);

gulp.task('start',['connect','watch']);