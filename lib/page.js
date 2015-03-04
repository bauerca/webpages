var merge = require('xtend/immutable');
var extend = require('xtend/mutable');
var escape = require('escape-html');

function Page() {
  this.state = {};
}

extend(Page.prototype, {
  needSessionSecrets: function() {},

  escape: escape,

  abort: function() {
    console.log('Nothing to abort?');
  }
});

module.exports = Page;
