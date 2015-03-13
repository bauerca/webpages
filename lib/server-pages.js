var fs = require('fs');
var escape = require('escape-html');
var extend = require('xtend/mutable');
var merge = require('xtend/immutable');
var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');
var path = require('path');
var ServerPage = require('./server-page');
var Pages = require('./pages');
var mkdirp = require('mkdirp');
var File = require('vinyl');
var Readable = require('readable-stream').Readable;

/** 
 *  A collection of methods to attach to the pages middleware.
 */

function ServerPages(opts) {
  opts = opts || {};
  opts.Page = opts.Page || ServerPage;

  this.strict = true;
  this.basedir = opts.basedir || process.cwd();
  this.layout = require(path.resolve(this.basedir, opts.layout));
  this.__pages = {};
  this._fns = {};
  this._scriptsDir = opts.scripts && path.resolve(this.basedir, opts.scripts);
  this._scripts = {};

  Pages.call(this, opts);
}

ServerPages.FN_RE = new RegExp('^' + Pages.FN_PATH + '/?\\?name=([a-zA-Z_]+)$');

extend(ServerPages.prototype, Pages.prototype, EventEmitter.prototype, {
  routes: function(__routes) {
    this.__routes = path.resolve(this.basedir, __routes);
    var routeConfigs = require(this.__routes);
    Pages.prototype.routes.call(this, routeConfigs);
  },

  set: function(name, __page) {
    __page = path.resolve(this.basedir, __page);
    this.__pages[name] = __page;

    var pages = this;
    var proto;
    try {
      proto = require(__page);
    }
    catch (e) {
      console.error('Could not find', __page);
      throw e;
    }
    if ('object' !== typeof proto || (!proto.read && !proto.write)) {
      throw new Error(
        'Page "' + __page + '" did not export a Page prototype.'
      );
    }

    var methods = [];

    if (proto.read) methods.push('GET');
    if (proto.write) methods.push('POST');

    this._setMethods(name, methods);
    this._setPrototype(name, merge(proto, this.layout));
  },

  /**
   *  Add a remote procedure.
   */

  fn: function(nameOrUrl, fn) {
    if (!fn) {
      // Looking for a RPC given a url...
      var match = ServerPages.FN_RE.exec(nameOrUrl);
      return (
        match &&
        this._fns.hasOwnProperty(match[1]) &&
        this._fns[match[1]]
      );
    }
    this._fns[nameOrUrl] = function(opts, done) {
      this.session.loadSecrets();
      fn.call(this, opts, done);
    };
  },

  fns: function() {
    return this._fns;
  },

  /**
   *  Return a page instance initialized with only route
   *  properties.
   *
   *  @param {String} action
   *  @param {String|Object} args
   */

  init: function(method, uri) {
    var route = this.route(method, uri);
    if (route) {
      var Page = this._cache[route.name];
      if (Page) {
        var page = new Page();
        return extend(page, route);
      }
    }
  },

  entries: function() {
    var _fns = this._fns;
    var __pages = this.__pages;
    var __routes = this.__routes;
    var methods = this._methods;

    var entryHeader = (
      'var pages = require("' + require.resolve('./browser-pages') + '");\n' +
      'pages.routes(require("' + __routes + '"));\n' +
      Object.keys(__pages).map(function(name) {
        return (
          'pages.set(' + 
            '["' + methods[name].join('", "') + '"], ' +
            '"' + name + '", ' +
            '"' + __pages[name] + '"/*js*/' +
          ');'
        );
      })
      .join('\n') +
      'pages._fns = [' +
        Object.keys(_fns).map(function(name) {
          return '"' + name + '"';
        })
        .join(',') +
      '];\n'
    );

    var names = Object.keys(__pages);
    var index = 0;
    var stream = new Readable({objectMode: true});

    stream._read = function(size) {
      var file;
      var name;
      var base;


      while (index < names.length) {
        name = names[index++];
        base = path.dirname(__pages[name]);

        file = new File({
          base: base,
          path: path.join(base, name + '.main.js'),
          contents: new Buffer(
            entryHeader +
              'require("' + __pages[name] + '");\n' +
              'pages.init();'
          )
        });

        if (!this.push(file)) break;
      }

      if (index === names.length) {
        this.push(null);
      }
    };

    return stream;
  },

  scripts: function(name) {
    var scripts = this._scripts[name];

    if (!scripts && this._scriptsDir) {
      scripts = this._scripts[name] = fs.readFileSync(
        path.join(this._scriptsDir, name + '.main.html'),
        {encoding: 'utf8'}
      );
    }

    return scripts || '';
  }
});

module.exports = ServerPages;
