var extend = require('xtend/mutable');

var STATE = 'oshpub';

/**
 *  Base for browser and server sessions that use cookies to store
 *  state.
 */

function Session(opts) {
  var session = this;
  this.secure = opts.secure;
  this.cookies = opts.cookies;
  this.refreshState();
}

extend(Session.prototype, {
  refreshState: function() {
    var json = this.cookies.get(STATE);
    this.state = json && JSON.parse(json) || {};
  },

  setState: function(state) {
    extend(this.state, state);
    this.cookies.set(
      STATE,
      JSON.stringify(this.state),
      {
        secure: this.secure,
        httpOnly: false,
        expires: new Date('Fri, 31 Dec 9999 23:59:59 GMT'),
        path: '/'
      }
    );
  }

});

module.exports = Session;
