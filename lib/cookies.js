
/*
* Much of this code is from:
*
* Cookies.js - 1.1.0
* https://github.com/ScottHamper/Cookies
*
* This is free and unencumbered software released into the public domain.
*/

var Cookies = module.exports = {
  toString: function(key, value, options) {
    key = key.replace(/[^#$&+\^`|]+/g, encodeURIComponent);
    key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
    value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]+/g, encodeURIComponent);
    options = options || {};

    options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

    var cookieString = key + '=' + value;
    cookieString += options.httpOnly ? ';httponly' : '';
    cookieString += options.path ? ';path=' + options.path : '';
    cookieString += options.domain ? ';domain=' + options.domain : '';
    cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
    cookieString += options.secure ? ';secure' : '';

    return cookieString;
  },

  fromString: function(cookies) {
    var cookiesArray = cookies ? cookies.split('; ') : [];
    var cookie;
    var separatorIndex;
    var key, value;

    cookies = {};

    for (var i = 0; i < cookiesArray.length; i++) {
      cookie = cookiesArray[i];
      separatorIndex = cookie.indexOf('=');
      // IE omits the "=" when the cookie value is an empty string
      separatorIndex = separatorIndex < 0 ? cookie.length : separatorIndex;

      key = decodeURIComponent(cookie.substr(0, separatorIndex));
      value = decodeURIComponent(cookie.substr(separatorIndex + 1));

      cookies[key] = value;
    }

    return cookies;
  },

  _maxExpireDate: new Date('Fri, 31 Dec 9999 23:59:59 UTC'),

  _isValidDate: function(date) {
    return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
  },

  _getExpiresDate: function(expires, now) {
    now = now || new Date();
    if (typeof expires === 'number') {
      expires = (
        expires === Infinity ?
        Cookies._maxExpireDate :
        new Date(now.getTime() + expires * 1000)
      );
    }
    else if (typeof expires === 'string') {
      expires = new Date(expires);
    }
    if (expires && !Cookies._isValidDate(expires)) {
      throw new Error('`expires` parameter cannot be converted to a valid Date instance');
    }
    return expires;
  }
};
