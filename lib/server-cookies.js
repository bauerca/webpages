var Cookies = require('./cookies');
var http = require('http');

function ServerCookies(req, res) {
  this._cache = Cookies.fromString(req.headers['cookie']);
  this._headers = {};
  this.res = res;
}

ServerCookies.prototype.set = function(key, value, options) {
  var headers = this._headers;

  this._cache[key] = value;
  headers[key] = Cookies.toString(key, value, options);

  var res = this.res;
  var setHeader = res.set ? http.OutgoingMessage.prototype.setHeader : res.setHeader;
  setHeader.call(res, 'Set-Cookie',
    Object.keys(headers).map(function(key) {return headers[key]})
  );
};

ServerCookies.prototype.get = function(key) {
  return this._cache[key];
};

module.exports = ServerCookies;
