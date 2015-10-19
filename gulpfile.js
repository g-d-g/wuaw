var gulp = require('gulp');
var uncss = require('gulp-uncss'),
    concatCss = require('gulp-concat-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css');

gulp.task('css', function() {
  gulp.src(['node_modules/bootstrap/dist/css/bootstrap.css',
            'node_modules/awesomplete/awesomplete.css'])
    .pipe(uncss({
      html: ['domcopy.html'],
      ignore: ['div.awesomplete > ul[hidden]', 'div.awesomplete > ul:empty', '.alert-danger', '.alert-info']
    }))
    .pipe(concatCss("bundle.css"))
    .pipe(minifycss())
    .pipe(gulp.dest('./css'));
});

gulp.task('scripts', function() {
  gulp.src(['node_modules/jquery/dist/jquery.min.js',
            'node_modules/awesomplete/awesomplete.js'])
    .pipe(uglify())
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./js'))
});

gulp.task('default', ['css', 'scripts']);
