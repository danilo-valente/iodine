var gulp = require('gulp');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var lazypipe = require('lazypipe');

var lint = lazypipe()
    .pipe(jshint)
    .pipe(jshint.reporter, stylish);

gulp.task('test', function () {
    return gulp.src('test/spec/**/*.js', { read: false })
        .pipe(mocha({ reporter: 'nyan' }));
});

gulp.task('lint:src', function () {
    return gulp.src(['index.js', 'lib/**/*.js'])
        .pipe(lint());
});

gulp.task('lint:test', function () {
    return gulp.src('test/spec/**/*.js')
        .pipe(lint());
});

gulp.task('lint', ['lint:src', 'lint:test']);