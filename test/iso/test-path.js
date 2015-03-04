var iso = require('osh-iso-test');

module.exports = function(path) {
  return ('undefined' == typeof window ? '' : iso.route) + path
};
