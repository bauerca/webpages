var Stash = require('./stash');
var merge = require('xtend/immutable');

var stashElement = document.getElementById(Stash.ID);
if (!stashElement) {
  throw new Error('No stash found in document!');
}

var BrowserStash = merge(Stash, JSON.parse(
  stashElement.getAttribute('data-data')
));

module.exports = BrowserStash;
