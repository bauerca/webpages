'use strict';

var ensure = require('node-ensure');
var merge = require('xtend/immutable');
var extend = require('xtend/mutable');
var tick = process.nextTick;
var BrowserPage = require('./browser-page');
var Stash = require('./browser-stash');
var csrf = require('./browser-csrf');
var CSRF_HEADER = require('./csrf-header');
var Pages = require('./pages');
var session = require('./browser-session');
var EventEmitter = require('component-emitter');
var cookies = require('./browser-cookies');

var pages = new Pages({
  Page: BrowserPage
});

var empty = {};

extend(pages, {

  haveHistory: !!window.history && !!history.pushState,

  __pages: {},

  set: function(methods, name, __page) {
    pages.__pages[name] = __page;
    pages._setMethods(name, methods);
  },

  fetch: function(name, callback) {
    //console.log('get Page', name, Date.now() - __start, 'ms');
    var Page = pages._cache[name];
    if (Page) {
      return tick(callback.bind(null, Page));
    }
    var __page = pages.__pages[name];
    if (!__page) {
      throw new Error('Page ' + name + ' not registered');
    }
    //console.log('start Page fetch for', name, Date.now() - __start, 'ms');
    ensure([__page], function(err) {
      //console.log('Page', name, 'fetched', Date.now() - __start, 'ms');
      Page = pages._setPrototype(name, require(__page));
      callback(Page);
      Page = null;
    });
  },

  init: function() {
    if (!pages.haveHistory) {
      return console.warn('No AJAX without history API');
    }
    var route = pages.route('GET', Stash.name, Stash.props);
    if (!route) {
      throw new Error('Init failed');
    }
    pages.request(route, function(page) {
      if (!page) {
        throw new Error('Could not recover.');
      }
      page.setState(Stash.state);
      page.recover();
      pages._preparing = null;
      pages._rendered = page;
      ajaxify();
      pages.run(page);
    });
  },

  /**
   *  Either a route or a page.
   */

  _preparing: null,

  _rendered: null,

  render: function(page) {
    if (page !== pages._preparing) return;
    pages._preparing = null;
    page.render({
      csrf: csrf,
      current: pages.current(),
      link: link
    });
    pages._rendered = page;
  },

  run: function(page) {
    // Do not run if there was an interruption.
    if (page !== pages._rendered) return;
    page.run({
      csrf: csrf,
      go: pages.go,
      link: link,
      submit: pages.submit
    });
  },

  /**
   *  Schedule a transition to a new page.
   *
   *  The first form takes the name of the page and a props object.  Simply
   *  look up the page by name and instantiate with the props.  For example:
   *
   *    pages.instantiate('view-user', {username: 'tory'}, callback);
   *
   *  The second form finds the page by iterating through all routes (of the
   *  given method) until props are parsed from the given uri. Example:
   *
   *    pages.instantiate('GET', '/users/tory', callback);
   *
   *  This form can fail if the method+uri is not recognized by any registered
   *  route. In this case, we throw an error.
   *
   *
   *     next |current | new=next | new=current || replace | push | abort-next | ret
   *    ------+--------+----------+-------------++---------+------+------------+-----
   *  1  yes  |  yes   |   yes    |     no      ||    no   |  no  |    no      |  f
   *    ------+--------+----------+-------------++---------+------+------------+-----
   *  2  yes  |  yes   |   no     |     yes     ||   yes   |  no  |    yes     |  f
   *    ------+--------+----------+-------------++---------+------+------------+-----
   *  3  yes  |  yes   |   no     |     no      ||   yes   |  no  |    yes     |  t
   *    ------+--------+----------+-------------++---------+------+------------+-----
   *  4  yes  |   no   |   yes    |     no      ||    no   |  no  |     no     |  f
   *    ------+--------+----------+-------------++---------+------+------------+-----
   *  5  yes  |   no   |   no     |     no      ||   yes   |  no  |    yes     |  t
   *    ------+--------+----------+-------------++---------+------+------------+-----
   *  6   no  |  yes   |   no     |     yes     ||    no   |  no  |    no      |  f
   *    ------+--------+----------+-------------++---------+------+------------+-----
   *  7   no  |  yes   |   no     |     no      ||    no   | yes  |    no      |  t
   *    ------+--------+----------+-------------++---------+------+------------+-----
   *  8   no  |   no   |   no     |     no      ||   yes   |  no  |    no      |  t
   *
   */

  request: function(route, callback) {
    var uri = route.uri;
    var action = route.action;
    var preparing = pages._preparing;

    if (preparing) {
      if (action === preparing.action) {
        //console.log(preparing.action, 'already scheduled');
        return;
      }
      if (preparing.method === 'GET') {
        // Cannot abort a POST. When you abort a static-page POST (like by
        // pressing back while the POST is in flight), the server still
        // processes the request (unless the stream is cutoff, then the server
        // will likely error).
        try {
          // Cancel the outstanding request
          preparing.abort && preparing.abort();
        }
        catch (e) {}
      }
    }

    // Update history (only if this request is not from a popstate).
    if (route.method === 'GET' && !route.revisit) {
      var rendered = pages._rendered;
      if (preparing && preparing.method === 'GET' || !rendered || route.replace) {
        // If interrupting a GET preparation, we want to overwrite the previous
        // change to the browser history; i.e. we don't want the aborted page
        // showing up in the history stack. Probably.
        // 
        // On the other hand, if there's no rendered page, then this is the
        // first scheduling and we must replaceState.

        //if (preparing) console.log('aborted', preparing.action);
        //else console.log('first scheduling');
        //console.log('replacing state', route, uri);
        history.replaceState(route, null, uri);
      }
      //else if (action === rendered.action) return; // Unnecessary page request.
      else {
        //console.log('new page');
        //console.log('pushing state', route, uri);
        if (rendered._cache) {
          history.replaceState(
            extend({state: rendered.state}, history.state),
            null,
            null
          );
        }

        history.pushState(route, null, uri);
      }
    }
    //console.log('scheduled', action, 'at', Date.now() - __start, 'ms');

    pages._preparing = route;

    pages.fetch(route.name, function(Page) {
      if (!Page || route !== pages._preparing) callback();
      else {
        var page = pages._preparing = new Page();
        extend(page, route);
        callback(page);
      }
    });
  },

  current: function() {
    var rendered = pages._rendered || empty;
    return {
      name: rendered.name,
      props: rendered.props || empty,
      state: rendered.state || empty
    };
  },

  go: function(nameOrUri, propsOrUndefined) {
    var route = pages.route('GET', nameOrUri, propsOrUndefined);
    if (route) {
      //console.log('going', nameOrUri, propsOrUndefined);
      pages.request(route, pages._readRenderRun);
      return true;
    }
  },

  fns: function() {
    if (Array.isArray(pages._fns)) {
      var fns = {};
      pages._fns.forEach(function(name) {
        fns[name] = rpc.bind(null, name);
      });
      pages._fns = fns;
    }
    return pages._fns;
  },

  _readWriteHook: function() {
    return extend(
      {
        host: '',
        current: pages.current(),
        session: session
      },
      pages.fns()
    );
  },

  _readRenderRun: function(page) {
    page && page.read(pages._readWriteHook(), function(nameOrUri, propsOrUndefined) {
      if (nameOrUri) {
        // redirection
        pages.go(nameOrUri, propsOrUndefined);
      }
      else {
        pages.render(page);
        pages.run(page);
      }
    });
  },

  _writeRedirect: function(page) {
    page.write(pages._readWriteHook(), function(nameOrUri, propsOrUndefined) {
      if (pages._preparing === page) {
        pages._preparing = null;
        pages.go(nameOrUri, propsOrUndefined);
      }
    });
  },

  IGNORE_INPUT_TYPES: {
    submit: 1,
    button: 1
  },

  _formRoute: function(form) {
    return pages.route(
      form.method.toUpperCase(),
      form.action
    );
  },

  submit: function(form, route) {
    route = route || pages._formRoute(form);
    if (!route) {
      throw new Error('No route for form');
    }
    var multipart = (form.enctype === 'multipart/form-data');
    var json = !multipart && {};
    var parts = multipart && [];

    // Kick this off first; guaranteed async...
    pages.request(route, function(page) {
      if (page) {
        if (route.method === 'POST') {
          page.payload = json || new EventEmitter();
          pages._writeRedirect(page);

          if (parts) {
            var payload = page.payload;
            var emit = payload.emit;
            for (var i = 0, len = parts.length; i < len; i++) {
              emit.apply(payload, parts[i]);
            }
            emit.call(payload, 'finish');
          }
        }
        else {
          extend(page.props, json);
          pages._readRenderRun(page);
        }
      }
    });

    // Parse the form while waiting.
    var element;
    for (var i = 0, len = form.elements.length; i < len; i++) {
      element = form.elements[i];
      if (element.type in pages.IGNORE_INPUT_TYPES) continue;
      if (element.name === csrf.name) continue;
      if (multipart) {
        var isFile = element.type === 'file';
        var file = isFile && element.files[0];
        parts.push([
          isFile ? 'file' : 'field',
          element.name,
          file || element.value,
          file && file.name,
          null,
          file && file.type
        ]);
      }
      else {
        //console.log(element.name, '=', element.value);
        json[element.name] = element.value;
      }
    }
  }
});

/**
 *  A wrapped version of pages.link that can be passed into render/run
 *  methods.
 */

function link(name, props) {
  return pages.link(name, props);
}


function rpc(name, opts, done) {
  //console.log('RPC', name);
  var req = require('superagent').post(Pages.FN_PATH + '?name=' + name);
  opts && req.send(opts);
  req.set(CSRF_HEADER, csrf.value);
  req.end(function(err, res) {
    var body = res && res.body;
    if (!err && !res.ok) {
      err = new Error(body.message);
    }
    cookies.refresh();
    body && extend(csrf, body.csrf);
    done(err, body && body.result);
  });
}


function ajaxify() {
  // A browser call to onpopstate will be preceded by an update of
  // document.location to the new url
  // (http://www.w3.org/TR/2011/WD-html5-20110113/history.html#history-traversal).
  window.addEventListener('popstate', function(event) {
    var route = event.state;
    //console.log('pop route:', route);

    if (route) {
      if (route.state) {
        // state was cached.
        var Page = pages._cache[route.name];
        var page = new Page();
        extend(page, route);
        pages._preparing = page;
        pages.render(page);
        pages.run(page);
      }
      else {
        pages.request(
          extend({revisit: true}, route),
          pages._readRenderRun
        );
      }
    }
  });
  
  window.addEventListener('click', function(event) {
    var a = event.target;
    while (a && a !== window) {
      if (a.tagName === 'A' && a.host === location.host) {
        //console.log('it was a link click:', a.href);
        try {
          // If the route does not exist, check the server first; we might
          // be looking for static assets or pages that we want to render
          // on the server only.
          var route = pages.route('GET', a.href);
          if (!route) return;

          event.preventDefault();
          pages.request(route, pages._readRenderRun);
        }
        catch (err) {
          // Follow the link.
          throw err;
          //break;
        }
        return;
      }
      else a = a.parentNode;
    }
  });

  window.addEventListener('submit', function(event) {
    var form = event.target;

    // If the route does not exist, check the server first; we might
    // be looking for static assets or pages that we want to render
    // on the server only.
    var route = pages._formRoute(form);
    if (!route) return;

    event.preventDefault();
    pages.submit(form, route);
  });
}

module.exports = pages;
