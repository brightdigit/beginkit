if (!global.Intl) {
  global.Intl = require('intl');
}

var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var beautify = require('gulp-beautify');
var jshint = require('gulp-jshint');
var async = require('async');
var merge = require('merge-stream');
var jscs = require('gulp-jscs');
var bump = require('gulp-bump'),
    rename = require('gulp-rename'),
    glob = require('glob'),
    Handlebars = require('handlebars'),
    scss = require('gulp-sass'),
    browserify = require('browserify'),
    awspublish = require("gulp-awspublish"),
    htmlmin = require('gulp-htmlmin'),
    revall = require('gulp-rev-all'),
    htmlmin = require('gulp-htmlmin'),
    uglify = require('gulp-uglify'),
    uglifycss = require('gulp-uglifycss'),
    umd = require('gulp-umd'),
    awspublishRouter = require("gulp-awspublish-router");
var substituter = require('gulp-substituter');
var gulpFilter = require('gulp-filter');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('babelify');
var ghPages = require('gulp-gh-pages');

HandlebarsIntl = require('handlebars-intl');

var revquire = require('./gulp/revquire');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var critical = require('critical');

var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var insert = require('gulp-insert');

var metalsmith_build = require('./gulp/metalsmith');

var async = require('async'),
    rimraf = require('rimraf');

var package = require("./package.json");

var awscredentials = revquire({
  "accessKeyId": "AWS_CREDENTIALS_KEY",
  "secretAccessKey": "AWS_CREDENTIALS_SECRET",
  "params": {
    "Bucket": "AWS_CREDENTIALS_BUCKET"
  }
}, __dirname + '/.credentials/aws.json');

var publishType = package.beginkit.publishing.type;

if (publishType == "github") {
  publishTasks = ['github-publish'];
} else if (publishType == "aws") {
  publishTasks = ['aws-publish'];
} else {
  publishTasks = [];
}
// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete. 
// You should run it at least once to create the icons. Then, 
// you should run it whenever RealFaviconGenerator updates its 
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', ['clean', 'metalsmith', 'check-for-favicon-update'], function(done) {
  realFavicon.generateFavicon({
    masterPicture: "./graphics/logo.svg",
    dest: "./.tmp/metalsmith",
    iconsPath: '/',
    design: {
      ios: {
        pictureAspect: 'backgroundAndMargin',
        backgroundColor: '#ffffff',
        margin: '18%'
      },
      desktopBrowser: {},
      windows: {
        pictureAspect: 'noChange',
        backgroundColor: '#da532c',
        onConflict: 'override'
      },
      androidChrome: {
        pictureAspect: 'noChange',
        themeColor: '#ffffff',
        manifest: {
          name: 'BeginKit',
          display: 'browser',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        }
      },
      safariPinnedTab: {
        pictureAspect: 'silhouette',
        themeColor: '#5bbad5'
      }
    },
    settings: {
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false
    },
    markupFile: FAVICON_DATA_FILE
  }, function() {
    done();
  });
});

// Inject the favicon markups in your HTML pages. You should run 
// this task whenever you modify a page. You can keep this task 
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', ['clean', 'metalsmith', 'generate-favicon'], function() {
  return gulp.src([ './.tmp/metalsmith/**/*.html' ])
    .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
    .pipe(gulp.dest('./.tmp/metalsmith'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your 
// continuous integration system.
gulp.task('check-for-favicon-update', ['clean', 'metalsmith'], function(done) {
  var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
  realFavicon.checkForUpdates(currentVersion, function(err) {
    if (err) {
      throw err;
    }
    done();
  });
});

gulp.task('clean', function (cb) {
  async.each(['.tmp', 'build'], rimraf, cb);
});

gulp.task('publish', publishTasks);

gulp.task('github-publish', ['production'], function () {
  return gulp.src('./build/production/**/*')
    .pipe(ghPages({
      "cacheDir" : "./.tmp/publish"
    }));
});

gulp.task('aws-publish', ['production'], function () {
  var publisher = awspublish.create(awscredentials);
  return gulp.src("**/*", {
    cwd: "./build/production/"
  }).pipe(awspublishRouter({
    cache: {
      // cache for 5 minutes by default
      cacheTime: 300,
      gzip: true
    },

    routes: {
      "^(assets|js|css|fonts)/(.+)\.(js|css|svg|ttf)$": {
        // use gzip for assets that benefit from it
        // cache static assets for 2 years
        gzip: true,
        cacheTime: 630720000,
        headers: {
          //"Vary": "Accept-Encoding"
        }
      },
      "^assets/.+$": {
        // cache static assets for 2 years
        cacheTime: 630720000
      },

      // pass-through for anything that wasn't matched by routes above, to be uploaded with default options
      "^.+$": {
        key: "$&",
        gzip: true
      }
    }
  })).pipe(publisher.publish(undefined, {
    force: false
  })).pipe(publisher.sync()).pipe(awspublish.reporter());
});

gulp.task('handlebars', function () {
  HandlebarsIntl.registerWith(Handlebars);
  Handlebars.registerHelper('limit', function (collection, limit, start) {
    return collection.slice(start, limit + 1);
  });
  Handlebars.registerHelper('safe', function (contents) {
    return new Handlebars.SafeString(contents);
  });
  Handlebars.registerHelper('year', function (contents) {
    return contents.getFullYear();
  });
  Handlebars.registerHelper('year', function (contents) {
    return contents.getFullYear();
  });
  Handlebars.registerHelper('isoDate', function (contents) {
    return contents.toISOString();
  });
  Handlebars.registerHelper('strip', function (contents) {
    return contents.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ");
  });
});

gulp.task('browserify', ['clean'], function () {
  var bundler = browserify('./static/js/main.js', { debug: true }).transform(babel, { presets: ['es2015'] });

  return bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./.tmp/metalsmith/js/'));

});

gulp.task('scss', ['clean'], function () {
  var dest = gulp.dest('.tmp/metalsmith/css');
  var main = gulp.src('static/scss/*.scss').pipe(scss());

  var site = gulp.src('static/scss/*.scss').pipe(scss()).pipe(rename({
    basename: "site"
  }));

  return merge(main, site).pipe(dest);
});

gulp.task('assets', ['clean'], function () {
  return gulp.src('static/assets/**/*').pipe(gulp.dest('.tmp/metalsmith/assets'));
});

gulp.task('graphics', ['clean'], function () {
  return gulp.src('graphics/**/*').pipe(gulp.dest('.tmp/metalsmith/assets/images'));
});

gulp.task('favicons', ['clean', 'generate-favicon', 'inject-favicon-markups', 'check-for-favicon-update'], function () {
  return gulp.src('static/favicons/**/*').pipe(gulp.dest('.tmp/metalsmith'));
});

gulp.task('fonts', ['clean'], function () {
  return gulp.src('./node_modules/font-awesome/fonts/*.*').pipe(gulp.dest('.tmp/metalsmith/assets/fonts/font-awesome'));
});

gulp.task('static', ['metalsmith', 'browserify', 'assets', 'graphics', 'fonts', 'critical', 'favicons']);

gulp.task('metalsmith', ['handlebars', 'clean'], metalsmith_build({
  stage: "development"
}));

gulp.task('jscs', function () {
  return gulp.src(['./*.js', 'gulp/**/*.js', 'static/js/**/*.js', 'app/**/*.js'], {
    base: '.'
  }).pipe(jscs({
    fix: true
  })).pipe(gulp.dest('.'));
});

gulp.task('lint', ['beautify'], function () {
  return gulp.src(['./*.js', 'gulp/**/*.js', 'static/js/**/*.js', 'app/**/*.js']).pipe(jshint()).pipe(jshint.reporter('default'));
});

gulp.task('bump', [], function () {
  return gulp.src(['./package.json']).pipe(bump({
    type: 'patch'
  })).pipe(gulp.dest('./'));
});

gulp.task('beautify', ['jscs'], function () {
  return gulp.src(['./*.js', 'gulp/**/*.js', 'static/js/**/*.js', 'app/**/*.js'], {
    base: '.'
  }).pipe(beautify({
    indentSize: 2
  })).pipe(gulp.dest('.'));
});

gulp.task('development', ['static'], function () {
  var filter = gulpFilter('**/*.html', {
    restore: true
  });

  return gulp.src('.tmp/metalsmith/**/*').pipe(filter).pipe(substituter({
    configuration: JSON.stringify({
      "server": "http://localhost:5000",
      "debug": true
    })
  })).pipe(filter.restore).pipe(gulp.dest('./build/development'));
});

gulp.task('production', ['minify', 'production-assets', 'production-cname', 'production-favicons'], function () {
  var revAll = new revall({
    dontRenameFile: ['.html', '.svg', '.jpeg', '.jpg', '.png', '.ico', '.xml'],
    debug: false
  });
  return gulp.src('.tmp/build/production/**/*').pipe(substituter({
    configuration: JSON.stringify({
      "server": "http://mysterious-oasis-7692.herokuapp.com"
    })
  })).pipe(revAll.revision()).pipe(gulp.dest('./build/production'));
});

gulp.task('production-favicons', ['static'], function () {
  return gulp.src(['.tmp/metalsmith/*.png','.tmp/metalsmith/browserconfig.xml','.tmp/metalsmith/manifest.json','.tmp/metalsmith/*.svg']).pipe(gulp.dest('./build/production/'));
});

gulp.task('production-assets', ['static'], function () {
  return gulp.src('.tmp/metalsmith/assets/**/*').pipe(gulp.dest('./build/production/assets'));
});

gulp.task('production-cname', ['static'], function () {
  return gulp.src('.tmp/metalsmith/CNAME').pipe(gulp.dest('./build/production'));
});

gulp.task('minify', ['htmlmin', 'uglify-js', 'uglify-css']);

gulp.task('htmlmin', ['static'], function () {
  return gulp.src('.tmp/metalsmith/**/*.html').pipe(htmlmin({
    collapseWhitespace: true,
    minifyCSS: true
  })).pipe(gulp.dest('.tmp/build/production'));
});

gulp.task('uglify-js', ['static'], function () {
  return gulp.src('.tmp/metalsmith/**/*.js').pipe(uglify({
    mangle: false,
    compress: false
  })).pipe(gulp.dest('.tmp/build/production'));

});

gulp.task('critical', ['scss', 'metalsmith', 'favicons'], function (cb) {
  critical.generateInline({
    base: '.tmp/metalsmith',
    src: 'index.html',
    styleTarget: '.tmp/metalsmith/css/site.css',
    htmlTarget: '.tmp/metalsmith/index.html',
    width: 320,
    height: 480,
    minify: false
  }, cb);
});

gulp.task('uglify-css', ['static'], function () {
  return gulp.src('.tmp/metalsmith/**/*.css').pipe(uglifycss()).pipe(gulp.dest('.tmp/build/production'));
});

gulp.task('test', function () {
  // place code for your default task here
});

gulp.task('build', ['submodules', 'production', 'test']);

gulp.task('default', ['submodules', 'bump', 'production', 'development', 'test']);

gulp.task('submodules', function () {
  return gulp.src('modules/**/*').pipe(gulp.dest('node_modules'));
});
