var extend = require('xtend/mutable');
var Session = require('./session');

var SECRET = 'oshsecret';

function ServerSession(opts) {
  Session.call(this, opts);
}

extend(ServerSession.prototype, Session.prototype, {
  setSecrets: function(secrets) {
    extend(this.secrets, secrets);
    this.cookies.set(
      SECRET,
      JSON.stringify(this.secrets),
      {
        secure: this.secure,
        httpOnly: true,
        expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'),
        path: '/'
      }
    );
  },

  loadSecrets: function() {
    if (this.secrets) return;
    var json = this.cookies.get(SECRET);
    this.secrets = json && JSON.parse(json) || {};
  }
});

module.exports = ServerSession;
