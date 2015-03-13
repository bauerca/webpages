var webpages = require('../..');
var forEach = require('lodash/collection/forEach');
var dynapack = require('dynapack');
var dest = require('vinyl-fs').dest;
var mapValues = require('lodash/object/mapValues');
var serveStatic = require('serve-static');
var path = require('path');

function serveAjax(opts, done) {
  var bundleDir = path.join(opts.basedir, 'bundles');

  var pages = webpages({
    basedir: opts.basedir,
    routes: 'routes',
    layout: 'layout',
    scripts: bundleDir
  });

  forEach(opts.pages, function(page, name) {
    pages.set(name, page);
  });

  forEach(opts.fns || {}, function(fn, name) {
    pages.fn(name, fn);
  });

  opts.app.use(pages);
  opts.app.use(serveStatic(bundleDir));

  var pack = dynapack();
  var scripts = pack.scripts();
  var entries = pages.entries();

  scripts.on('end', done);

  pack.on('end', function() {
    scripts.end();
  });

  scripts.pipe(dest(bundleDir));
  entries.pipe(pack).pipe(dest(bundleDir));
}

module.exports = serveAjax;
