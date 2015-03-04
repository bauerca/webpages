var csrf = require('csrf')();
var extend = require('xtend/mutable');

function Csrf(opts) {
  this.cookies = opts.cookies;
  this.secure = opts.secure;
}

Csrf.NAME = '_csrf_tokey';
Csrf.SECRET = 'oshcsrf';
Csrf.HEADER = 'x-osh-csrf';

extend(Csrf.prototype, {
  secret: function() {
    var secret = this.cookies.get(Csrf.SECRET);
    if (!secret) {
      secret = csrf.secretSync();
      this.cookies.set(
        Csrf.SECRET,
        secret,
        {
          httpOnly: true,
          secure: this.secure,
          path: '/'
        }
      );
    }
    return secret;
  },

  /**
   *  Create a new token for the current page. Returns cached
   *  after first call.
   */

  newToken: function() {
    if (!this._csrfToken) {
      this._csrfToken = csrf.create(this.secret());
    }
    return this._csrfToken;
  },

  verifyToken: function(csrfToken) {
    return csrf.verify(this.secret(), csrfToken);
  }
});

module.exports = Csrf;
