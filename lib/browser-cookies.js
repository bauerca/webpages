var Cookies = require('./cookies');
var extend = require('xtend/mutable');
var EventEmitter = require('component-emitter');

var cookies = new EventEmitter();
extend(cookies, Cookies);

cookies.set = function(key, value, options) {
  cookies._cache[key] = value;
  document.cookie = Cookies.toString(key, value, options);
};

cookies.get = function(key) {
  return cookies._cache[key];
};

cookies.refresh = function() {
  cookies._cache = Cookies.fromString(document.cookie);
  this.emit('refresh');
};

document.cookie = '__test__=test;path=/';
cookies.refresh();

cookies.enabled = cookies._cache.__test__ === 'test';

if (cookies.enabled) {
  cookies.set('__test__'); // Delete it.
}

module.exports = cookies;
