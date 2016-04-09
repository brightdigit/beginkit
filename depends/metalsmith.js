var
markdown = require('metalsmith-markdown'),
    excerpts = require('metalsmith-excerpts'),
    collections = require('metalsmith-collections'),
    permalinks = require('metalsmith-permalinks'),
    paginate = require('metalsmith-paginate'),
    tags = require('metalsmith-tags'),
    publish = require('metalsmith-publish'),
    define = require('metalsmith-define'),
    layouts = require('metalsmith-layouts'),
    collections = require('metalsmith-collections'),
    metalsmith = require('metalsmith'),
    path = require('path');
var marked = require('marked');
var renderer = new marked.Renderer();

var heading = renderer.heading;

renderer.heading = function (text, level, raw) {
  return heading.call(renderer, text, level + 2, raw);
};

var crypto = require('crypto');
var md5sum = crypto.createHash('md5');
module.exports = (function () {
  function build(configuration, cb) {

    var publishSettings = {};
    var stage = (configuration && configuration.stage) || "development";
    var basePath = (configuration && configuration.base) || (__dirname + "/..");

    if (stage === "development") {
      publishSettings = {
        draft: true,
        future: true
      };
    }

    var destination = path.relative(__dirname, path.resolve(".tmp/metalsmith", stage));
    var m = metalsmith(basePath + "/static").metadata({
      site: {
        title: "TagMento",
        url: "http://www.tagmento.com"
      }
    }).use(publish(publishSettings)).use(define({
      pkg: require(basePath + '/package.json'),
      buildDate: new Date(),
      stage: stage.substring(0, 3)
    })).use(collections({
      posts: {
        pattern: 'posts/*.md',
        sortBy: 'date',
        reverse: true
      },
      pages: {
        pattern: '*.md'
      }
    })).use(tags({
      handle: 'tags',
      // yaml key for tag list in you pages
      path: 'blog/tags.html',
      // path for result pages
      layout: "../layouts/tags.hbt",
      // template to use for tag listing
      sortBy: 'date',
      // provide posts sorted by 'date' (optional)
      reverse: true // sort direction (optional)
    })).use(paginate({
      perPage: 10,
      path: "blog/page"
    })).use(markdown({
      renderer : renderer
    })).use(excerpts()).use(permalinks({
      pattern: 'blog/:date/:title',
      date: 'YY/MM/DD'
    })).use(function (files, metalsmith) {
      var metadata = metalsmith.metadata();
      for (var key in files) {
        if (!files[key].collection) {
          continue;
        }
        for (var collectionIndex = 0; collectionIndex < files[key].collection.length; collectionIndex++) {
          var collectionName = files[key].collection[collectionIndex];
          var index;
          for (index = 0; index < metadata.collections[collectionName].length; index++) {
            if (metadata.collections[collectionName][index].title == files[key].title) {
              metadata.collections[collectionName][index] = files[key];
            }
          }
        }
      }
    }).use(layouts({
      engine: "handlebars",
      partials: 'partials'
    })).destination(destination);

    //path.resolve("../.tmp/metalsmith", stage));


    // and .use() as many Metalsmith plugins as you like 
    //.use(permalinks('posts/:title'))
    m.build(function (error) {
      cb(error);
    });
  }

  function build_callback(configuration) {
    return build.bind(null, configuration);
  }

  return build_callback;
})();