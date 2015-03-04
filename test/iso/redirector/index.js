var serveStatic = require('serve-static');
var Pages = require('../../..');

module.exports = function(app, done) {
  var pages = Pages({
    basedir: __dirname,
    routes: 'routes',
    layout: 'layout'
  });

  pages.set('run', './run');

  pages.bundle({
    output: __dirname + '/bundles',
    prefix: '/'
  });

  app.use(pages);
  app.use(serveStatic(__dirname + '/bundles'));

  pages.on('bundled', function() {
    done();
  });
};
