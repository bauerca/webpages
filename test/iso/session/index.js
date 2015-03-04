var Pages = require('../../..');

module.exports = function(app, done) {
  var pages = Pages({
    basedir: __dirname,
    routes: 'routes',
    layout: 'layout'
  });

  pages.set('run', './run');
  app.use(pages);
  done();
};
