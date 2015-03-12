var serveAjax = require('../serve-ajax');

module.exports = function(app, done) {
  return serveAjax({
    app: app,
    basedir: __dirname,
    fns: {
      getAccessToken: require('../privately/get-access-token'),
      refreshAccessToken: require('../privately/refresh-access-token')
    },
    pages: {
      run: './run'
    }
  }, done);
};
