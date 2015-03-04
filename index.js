//module.exports = require('./lib/server-pages');
var ServerPages = require('./lib/server-pages');
var Cookies = require('./lib/server-cookies');
var DefaultSession = require('./lib/server-session');
var Csrf = require('./lib/csrf');
var CSRF_HEADER = require('./lib/csrf-header');
var EventEmitter = require('events').EventEmitter;
var extend = require('xtend/mutable');
var Busboy = require('busboy');
var Stash = require('./lib/stash');
var bodyParser = require('body-parser');

var parseURLEncodedForm = bodyParser.urlencoded({extended: false});
var parseJSONBody = bodyParser.json();

var RE_MULTIPART = /^multipart\/form-data/;

function create(opts) {
  var Session = opts.Session || DefaultSession;

  extend(pages, ServerPages.prototype);
  ServerPages.call(pages, opts);

  return pages;

  function pages(req, res, next) {
    var method = req.method;

    // Routing.
    var page = pages.init(method, req.url);
    var fn = pages.fn(req.url);

    if (!page && !fn) {
      return next();
    }
    //console.log('attempting to send page', page.name, page.props);

    var cookies = new Cookies(req, res);
    var session = new Session({cookies: cookies, secure: opts.secure});
    var csrf = new Csrf({cookies: cookies, secure: opts.secure});

    // Passed in to read/write methods when handling pages and used as
    // the this object for RPCs.
    var readWriteHook = extend(
      {
        host: pages.host || 'localhost',
        current: {
          props: {},
          state: {}
        },
        session: session
      },
      pages.fns()
    );

    if (fn) {
      var csrfToken = req.get(CSRF_HEADER);
      if (!csrfToken || !csrf.verifyToken(csrfToken)) {
        throw new Error(
          'ECSRF: bad csrf in rpc attempt.'
        );
      }

      parseJSONBody(req, res, function(err) {
        if (err) next(err);
        else {
          fn.call(readWriteHook, req.body, function(err, result) {
            if (err) {
              res.status(500);
              res.send({
                message: err.message
              });
            }
            else {
              res.send({
                result: result || {},
                csrf: {
                  name: Csrf.NAME,
                  value: csrf.newToken()
                }
              });
            }
          });
        }
      });
    }
    else if (method === 'POST') {
      var m;
      var contentType = req.headers['content-type'];

      if (contentType === 'application/x-www-form-urlencoded') {
        parseURLEncodedForm(req, res, function(err) {
          if (err) next(err);
          else {
            var csrfToken = req.body[Csrf.NAME];

            if (!csrf.verifyToken(csrfToken)) {
              throw new Error(
                'ECSRF: bad csrf token in form.'
              );
            }

            page.payload = req.body;
            page.write(readWriteHook, redirect);
          }
        });
      }
      else if (RE_MULTIPART.test(contentType)) {
        var busboy = new Busboy({headers: req.headers});
        var csrfOk;

        busboy.on('file', function() {
          if (!csrfOk) {
            throw new Error(
              'ECSRF: no csrf token. Must occur first in <input> ' +
              'list and should have name="' + Csrf.NAME + '".'
            );
          }
        });
        busboy.on('field', function(name, csrfToken) {
          if (!csrfOk) {
            if (name !== Csrf.NAME) {
              throw new Error(
                'ECSRF: no csrf token. Must occur first in <input> ' +
                'list and should have name="' + Csrf.NAME + '".'
              );
            }
            if (!csrf.verifyToken(csrfToken)) {
              throw new Error(
                'ECSRF: bad csrf token in multipart-encoded form.'
              );
            }
            csrfOk = true;

            page.payload = busboy;
            page.write(readWriteHook, redirect);
          }
        });
        req.pipe(busboy);
      }
      else {
        throw new Error('EPOST: Bad POST content-type');
      }

    }
    else if (method === 'GET') {
      page.read(readWriteHook, function(name, props) {
        if (name) redirect(name, props);
        else {
          res.status(page.status || 200);
          var renderHook = {
            csrf: {
              name: Csrf.NAME,
              value: csrf.newToken()
            },
            link: link
          };

          page.renderAjax = function() {
            return (
              '<span ' +
                'id="' + Stash.ID + '" ' +
                'data-data="' + this.escape(
                  JSON.stringify({
                    name: this.name,
                    props: this.props,
                    state: this._stashedState,
                    csrf: renderHook.csrf
                  })
                ) + '"' +
              '>' +
              '</span>' +
              (pages.scripts(this.name) || '')
            );
          };

          res.send(
            page.render(renderHook)
          );

          session = null;
          page = null;
        }
      });
    }
    else next();

    function redirect(name, props) {
      var uri;
      if (props === undefined) {
        uri = name;
      }
      else {
        var route = pages.route('GET', name, props);
        uri = route.uri;
      }
      res.redirect(uri);
      page = null;
      session = null;
    }
  }

  /**
   *  A simple wrapper around Router.prototype.link for this Pages
   *  instance for passing to page.renderToString.
   */

  function link(name, props) {
    return pages.link(name, props);
  }
}

module.exports = create;
