const gulp = require('gulp');
const babel = require('gulp-babel');
const inject = require('gulp-inject-string');
const fs = require('fs');
const connect = require('gulp-connect');
const karma = require('karma');

gulp.task('build:transpile', () => {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015'],
      plugins: ['transform-object-rest-spread']
    }))
    .pipe(gulp.dest('lib'));
});

gulp.task('build:inject', ['build:transpile'], () => {
  const contents = fs.readFileSync('lib/runner.js', 'utf8');
  const escaped = contents.replace(/(['"])/g, '\\$1')
    .replace(/\/\/.*\n/g, '')
    .replace(/\n/g, '');

  return gulp.src('lib/erg.js')
    .pipe(inject.prepend('var RUNNER = \"' + escaped + '\";\n'))
    .pipe(gulp.dest('lib'));
});

gulp.task('build', ['build:transpile', 'build:inject']);

gulp.task('serve', () => {
  connect.server({
    root: './',
    livereload: true
  });
});

gulp.task('test', ['build'], (done) => {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('watch', () => {
  gulp.watch('src/**/*.js', ['build']);
});

gulp.task('dev', ['watch', 'serve']);

