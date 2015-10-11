var gulp = require('gulp');
var uncss = require('gulp-uncss'),
    concatCss = require('gulp-concat-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css');

gulp.task('css', function() {
  gulp.src(['bower_components/bootstrap/dist/css/bootstrap.css',
            'bower_components/awesomplete/awesomplete.css'])
    .pipe(uncss({
      html: ['domcopy.html'],
      ignore: ['div.awesomplete > ul[hidden]', 'div.awesomplete > ul:empty', '.alert-danger', '.alert-info']
    }))
    .pipe(concatCss("bundle.css"))
    .pipe(minifycss())
    .pipe(gulp.dest('./css'));
});

gulp.task('scripts', function() {
  gulp.src(['bower_components/jquery/dist/jquery.min.js',
            'bower_components/awesomplete/awesomplete.js'])
    .pipe(uglify())
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./js'))
});

gulp.task('default', ['css', 'scripts']);
