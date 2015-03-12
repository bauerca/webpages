var serveAjax = require('../serve-ajax');

module.exports = function(app, done) {
  return serveAjax({
    app: app,
    basedir: __dirname,
    pages: {
      view1: './view1',
      view2: './view2'
    }
  }, done);
};
