var Pages = require('../../..');

module.exports = function(app, done) {
  var pages = Pages({
    basedir: __dirname,
    routes: 'routes',
    layout: 'layout'
  });

  pages.set('run', './run');

  pages.fn('getAccessToken', require('./get-access-token'));
  pages.fn('refreshAccessToken', require('./refresh-access-token'));

  app.use(pages);
  done();
};
