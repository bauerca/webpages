var serveStatic = require('serve-static');
var webpages = require('../../..');

module.exports = function(app, done) {
  var pages = webpages({
    basedir: __dirname,
    routes: 'routes',
    layout: 'layout'
  });

  pages.set('view1', './view1');
  pages.set('view2', './view2');

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
