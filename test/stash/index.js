var serveStatic = require('serve-static');

module.exports = function(pages) {
  pages.add('run', require.resolve('./run-page'));
  pages.get('run', function(req, res) {res.page.send()});
  pages.bundle({
    output: __dirname + '/bundles',
    prefix: '/stash/'
  });
  pages.app.use(
    '/stash',
    serveStatic(__dirname + '/bundles')
  );
};
