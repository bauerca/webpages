var serveStatic = require('serve-static');
var Pages = require('../../..');

module.exports = function(app, done) {
  var pages = Pages({
    basedir: __dirname,
    routes: 'routes',
    layout: 'layout'
  });

  pages.set('run', './run');

  pages.fn('getAccessToken', require('../privately/get-access-token'));
  pages.fn('refreshAccessToken', require('../privately/refresh-access-token'));

  pages.bundle({
    output: './bundles',
    prefix: '/'
  });

  app.use(pages);
  app.use(serveStatic(__dirname + '/bundles'));

  pages.on('bundled', function() {
    done();
  });
};
