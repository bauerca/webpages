var webpages = require('../../..');

module.exports = function(app, done) {
  var pages = webpages({
    basedir: __dirname,
    routes: 'routes',
    layout: 'layout'
  });

  pages.set('run', './run');

  app.use(pages);
  done();
};
