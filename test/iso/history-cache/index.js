var serveStatic = require('serve-static');
var webpages = require('../../..');
var serveAjax = require('../serve-ajax');

module.exports = function(app, done) {
  return serveAjax({
    app: app,
    basedir: __dirname,
    pages: {
      run: './run',
      back: './back'
    }
  }, done);
};
