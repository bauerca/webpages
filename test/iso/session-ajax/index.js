var webpages = require('../../..');
var serveStatic = require('serve-static');

module.exports = function(app, done) {
  var pages = webpages({
    basedir: __dirname,
    routes: 'routes',
    layout: 'layout'
  });

  pages.set('run', './run');

  pages.bundle({
    output: './bundles',
    prefix: '/'
  });

  app.use(pages);
  app.use(serveStatic(__dirname + '/bundles'));

  pages.on('error', function(err) {
    done(err);
  });

  pages.on('bundled', function() {
    done();
  });
};
