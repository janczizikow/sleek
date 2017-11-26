// Gulp and node
const gulp = require('gulp');
const cp = require('child_process');

// Basic workflow plugins
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const jekyll = 'jekyll';
const messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

// Performance workflow plugins
const prefix = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const critical = require('critical');

const src = {
  css: '_sass/main.scss',
  js: '_js/**/*.js',
}
const dist = {
  css: '_site/assets/css',
  js: '_site/assets/js',
}

// Build the Jekyll Site
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

gulp.task('deploy', ['jekyll-build'], function () {
    return gulp.src('./_site/**/*')
        .pipe(deploy());
});

// Rebuild Jekyll & do page reload
gulp.task('rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

// Rebuild Jekyll & do page reload
gulp.task('browser-sync', ['sass', 'js', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

// Complie SCSS to CSS & Prefix
gulp.task('sass', function() {
  return gulp.src(src.css)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: ['scss'],
      // functions: sassFunctions(),
      onError: browserSync.notify
    }))
    .pipe(prefix())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(dist.css))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest('assets/css'));
});

// Uglify JS
gulp.task('js', function() {
  return gulp.src(src.js)
    .pipe(concat('bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dist.js))
    .pipe(browserSync.reload({stream: true}))
    .pipe(gulp.dest('assets/js'))
    .on('error', function(err){
      console.error('Error in uglify taks', err.toString());
    });
});

gulp.task('critical', function (cb) {
  critical.generate({
    base: '_site/',
    src: 'index.html',
    css: ['assets/css/main.css'],
    dimensions: [{
      width: 320,
      height: 480
    },{
      width: 768,
      height: 1024
    },{
      width: 1280,
      height: 960
    }],
    dest: '../_includes/critical.css',
    minify: true,
    extract: false,
    ignore: ['@font-face']
  });
});

gulp.task('watch', function() {
  gulp.watch('_sass/**/*.scss', ['sass']);
  gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_posts/*',  'pages_/*', '_include/*html'], ['rebuild']);
  gulp.watch('_js/**/*.js', ['js']);
});

gulp.task('default', ['browser-sync', 'watch']);
