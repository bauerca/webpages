var extend = require('xtend/mutable');
var Session = require('./session');
var cookies = require('./browser-cookies');

var session = new Session({
  cookies: cookies,
  secure: location.protocol === 'https:'
});

cookies.on('refresh', function() {
  session.refreshState();
});

module.exports = session;
