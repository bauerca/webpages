var serveStatic = require('serve-static');
var webpages = require('../../..');

module.exports = function(app, done) {
  var pages = webpages({
    basedir: __dirname,
    routes: 'routes',
    layout: 'layout'
  });

  pages.set('run', './run');
  pages.set('back', './back');

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
