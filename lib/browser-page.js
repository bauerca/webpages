'use strict';

var Page = require('./page');
var extend = require('xtend/mutable');
var merge = require('xtend/immutable');

/**
 *  Listen in on the creation of a Page to store the instance in a
 *  registry. We need the registry to render pages on popstate events.
 */

function BrowserPage() {
  Page.call(this);
  this._cache = true;
}

extend(BrowserPage.prototype, Page.prototype, {
  stash: function() {
    // noop in browser.
  },

  setState: function(state) {
    extend(this.state, state);
  },

  /**
   *  Actually renders to the DOM. Huh. Override this when
   *  you want to use a fancier renderer, like ReactJS.
   */
  
  render: function() {
    // noop.
  },

  recover: function() {
    // noop
  },

  run: function() {
    // noop
  }
});

module.exports = BrowserPage;
