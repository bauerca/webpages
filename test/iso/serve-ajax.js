var webpages = require('../..');
var forEach = require('lodash/collection/forEach');
var dynapack = require('dynapack');
var dest = require('vinyl-fs').dest;
var mapValues = require('lodash/object/mapValues');
var serveStatic = require('serve-static');
var path = require('path');

function serveAjax(opts, done) {
  var pages = webpages({
    basedir: opts.basedir,
    routes: 'routes',
    layout: 'layout'
  });

  var bundleDir = path.join(opts.basedir, 'bundles');

  forEach(opts.pages, function(page, name) {
    pages.set(name, page);
  });

  forEach(opts.fns || {}, function(fn, name) {
    pages.fn(name, fn);
  });

  opts.app.use(pages);
  opts.app.use(serveStatic(bundleDir));

  var pack = dynapack();

  pack.on('end', done);

  pack.on('bundled', function(bundles) {
    var scripts = mapValues(
      bundles.entries,
      function(entryBundles) {
        return entryBundles.map(function(bundle) {
          return '/' + bundle;
        });
      }
    );
    pages.setScripts(scripts);
  });

  var entries = pages.entries();
  entries.pipe(pack).pipe(dest(bundleDir));
  //entries.resume();
}

module.exports = serveAjax;
