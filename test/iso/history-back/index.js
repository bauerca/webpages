var serveStatic = require('serve-static');
var Pages = require('../../..');
var serveAjax = require('../serve-ajax');

module.exports = function(app, done) {
  return serveAjax({
    app: app,
    basedir: __dirname,
    pages: {
      run: './run'
    }
  }, done);
};
