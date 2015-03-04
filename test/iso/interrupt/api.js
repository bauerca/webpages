var latency = require('./latency');

var names = {
  adam: 'Adam Light',
  tory: 'Victoria Conrad'
};

module.exports = {
  getUser: function(username, done) {
    setTimeout(function() {
      done(null, {
        alias: username,
        name: names[username]
      });
    }, latency);
  }
};
