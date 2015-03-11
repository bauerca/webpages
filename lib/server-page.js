var Page = require('./page');
var extend = require('xtend/mutable');

function ServerPage() {
  Page.call(this);
  this._stashedState = {};
  this._stashState = true;
}

extend(ServerPage.prototype, Page.prototype, {
  stash: function(bool) {
    this._stashState = bool;
  },

  setState: function(state, opts) {
    extend(this.state, state);
    if ((opts && opts.stash) || this._stashState) {
      extend(this._stashedState, state);
    }
  },

  render: function() {
    return 'Implement render()!';
  }
});

module.exports = ServerPage;
