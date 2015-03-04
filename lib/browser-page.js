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
}

extend(BrowserPage.prototype, Page.prototype, {
  
  stash: function() {
    // noop in browser.
  },

  setState: function(state) {
    extend(this.state, state);
  },

  request: function(action, args) {
    return this.pages.request(action, args);
  },

  submit: function(form) {
    this.pages.submit(form);
  },

  /**
   *  Actually renders to the DOM. Huh. Override this when
   *  you want to use a fancier renderer, like ReactJS.
   */
  
  renderToDocument: function() {
    // noop.
  },

  recoverState: function() {
    // noop
  },

  run: function() {
    // noop
  }
});

module.exports = BrowserPage;
