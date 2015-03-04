# Webpages.js

A Node.js framework for API-consuming web apps that unifies AJAX client-side
behavior and graceful degradation.  Apps built on webpages.js should
work with or without javascript in the browser, which means

- initial page loads are snappy,
- user actions (navigation, form submission) can precede js enhancement, and
- pages are search-engine ready,

all through a single javascript API.

Features include:

- Module bundling and client-side loading (via [dynapack](https://github.com/bauerca/dynapack))
- Automatic AJAX for both `<a/>` and `<form/>` actions
- Session management and CSRF protection

## Installation

```
npm install webpages
```

## Usage

A simple example describes it best, so here is the minimal set of
files we need to get going.

```
routes.js
layout.js
page.js
user-page.js
server.js
```

The contents of each are printed below; let's start with `routes.js`
as it should look the most familiar:

```js
var routes = {
  // Only one route, b/c we have only one page.
  'user': {
    path: '/users/<username>',
    params: {
      username: /^[a-z]+$/
    }
  }
};

module.exports = routes;
```

Each entry in the route map is a config object for an
[osh-route](https://github.com/openscihub/osh-route).

The file `layout.js` exports an object that will be merged into all page
prototypes on the server (i.e., layout attributes overwrite page prototype
attributes). The layout should export a render function that returns the full
html string:

```js
var Layout = {
  render: function(pages) {
    return (
      '<!DOCTYPE html>' +
        '<head>' +
          '<title>' + this.state.title + '</title>' +
        '</head>' +
        '<body>' +
          this.state.body +
          this.renderAjax() +
        '</body>' +
      '</html>'
    );
  }
};

module.exports = Layout;
```

The file `page.js` defines the base page prototype and takes care of
rendering (and rerendering) page state to the browser document.

```js
var Page = {
  /**
   *  Render on the browser. Use a DOM renderer
   *  with diffing, like ReactJS, rather than what is done here.
   */

  render: function(pages) {
    document.body.innerHTML = this.state.body;
    document.title = this.state.title;
  }
};

module.exports = Page;
```

The module `user.js` exports a complete page prototype, grabbing data
from an API server using [SuperAgent](http://visionmedia.github.io/superagent/))
(which works on the client and server--important!)
and preparing the state for rendering.

```js
var request = require('superagent'); // isomorphic!..mostly
var merge = require('xtend/immutable');
var escape = require('escape-html');
var Page = require('./page');

/**
 *  Extend our basic rendering page prototype with a read method.
 */

var UserPage = merge(Page, {
  /**
   *  Read data from various APIs. In this case, we
   *  pull some user data from a fictitious API.
   */

  read: function(pages, render) {
    var page = this;

    request.get('https://api.mysite.com/users/' + this.props.username)
    .end(function(err, res) {
      var user = res && res.body;
      page.setState({
        title: page.props.username, // see routes.js
        body: '<h1>' + escape(err ? err.message : user && user.fullname) + '</h1>'
      });
      render();
    });
  }
});

module.exports = Page;
```

Finally, you serve the app using Express, and optionally use the built-in
bundler (based on [dynapack](https://github.com/bauerca/dynapack)) to
enable client-side AJAX rendering and navigation. The following is
`server.js`:

```js
var express = require('express');
var serveStatic = require('serve-static');
var webpages = require('webpages');

var app = express();

var pages = webpages({
  basedir: __dirname, // all paths are relative to basedir
  routes: './routes',
  layout: './layout'
});

pages.set('user', './user-page');

pages.bundle({
  output: './bundles',
  prefix: '/js/'
});

app.use(pages);
app.use('/js', serveStatic(__dirname + '/bundles'));

pages.on('bundled', function() {
  app.listen(3333);
});
```


- writing "isomorphic" interfaces to APIs (this is often accomplished via an
  existing HTTP request
  library... ahem... [SuperAgent](http://visionmedia.github.io/superagent/))
- Find or build a HTML/DOM rendering and diffing
  library... ahem... [React.js](http://facebook.github.io/react/)
- Hook them together using webpages.js.

## Documentation

### webpages(opts)

Call this to create a new pages instance on the server; it returns
an express middleware function augmented with the following
setup methods.

For example:

```js
var pages = webpages({
  basedir: __dirname,
  routes: './routes',
  layout: './layout'
});
```

#### opts.basedir

- default: `process.cwd()`
- required: yes
- type: `String`

All configuration parameters that are specified as
relative paths are assumed relative to this directory.

#### opts.routes

- required: yes
- type: String

Path to a module that exports an object mapping route ids to
[Route](https://github.com/openscihub/osh-route) config objects.
The path can be relative to `basedir` set in constructor.

Example routes.js:

```js
module.exports = {
  'user': {
    path: '/users/<username>',
    params: {
      username: /^[a-z]+$/
    }
  },
  'article': {
    path: '/articles/<articleId>',
    params: {
      articleId: /^\w+$/
    }
  }
};
```

#### opts.layout

Path to a module that exports a page prototype with a render method
that returns a string of HTML. This object is merged into all page prototypes
for rendering on the server.

### pages

The following methods are available on the instance returned by `webpages(opts)`.

#### pages.set(name, page)

- `name`: The id of a route exported by the [routes module](#optsroutes).
  - type: String
  - required: yes
- `page`: Path to a module that exports a [page](#page) prototype. Can
  be relative to [basedir](#optsbasedir).
  - type: String
  - required: yes

Register page logic with a route. You need to register by way of a module
path so that Pages can bundle your javascript.

#### pages.fn(name, fn)

- `name`: The name of the server function.
- `fn`: The server function.
  - Signature: `fn(opts, done)` where `opts` is POJO data and `done` is
    a callback. Pass error and result as first and second arg, respectively,
    to `done`.

Register a server function (or remote procedure) with the Pages instance.  A
server function is callable within a [page's](#page) read/write methods and
runs on only the server (when called in the browser, an AJAX request handles
the function call for you, being careful to send and check a CSRF token
for security).

Use server functions when a task needs to be performed privately, like
authenticating with an OAuth2-capable API server.

Errors returned to the `done` callback will have only their `err.message` property
sent back to the client if the server function call came from the browser.

Within the server function, `this` has the following properties:

- `this.session`: The current [Session](#session) instance.

Example:

```js
pages.fn('refreshAccessToken', function(opts, done) {
  // For persisting the refresh token.
  var session = this.session;

  request.post('https://api.api.api/oauth/token')
  .auth('thewebs', 'sshh')
  .send({
    grant_type: 'refresh_token',
    refresh_token: session.secrets.refreshToken
  })
  .end(function(err, res) {
    if (err) done(err);
    else {
      session.setSecrets({refreshToken: res.body.refresh_token});
      done(null, res.body.access_token);
    }
  });
});
```


#### pages.bundle(opts)

- options
  - `output`: Output directory for bundles. Can be relative to basedir.
    - type: String
    - default: `'/bundles'`
  - `prefix`: Prefix for script urls. If serving scripts from the same
    express app that houses the pages instance, this value should match
    the mount path (with a trailing slash).

Bundle up javascript using [Dynapack](https://github.com/bauerca/dynapack).
Options are passed to Dynapack after resolving any relative paths.

When bundling has finished, the `'bundled'` event is fired on the pages
instance.

Example:

```js
pages.bundle({
  output: __dirname + '/bundles',
  prefix: '/js/'
});

app.use(pages);
app.use('/js', serveStatic(__dirname + '/bundles'));

pages.on('bundled', function() {
  app.listen(3333);
});
```


## Page

A Page prototype registered with the [pages.set()](#pagessetnamepage) method
should implement the following API. Lifecycle methods are required to do
anything useful.

### Lifecycle methods

These methods should be defined on a Page prototype.

#### read(pages, render)

Called on a GET request for the Page.

Using information in `this.props` and the given `pages` object, gather data
from APIs and make calls to `this.setState(state)` to prepare the page for
rendering. Call the `render` callback without arguments when ready to render
the page.

The `pages` object contains the following properties to help with optimization
and managing session state:

- `pages.session`: The current [Session](#session) instance.
- `pages.current`: The currently rendered page. If you are not managing your
  own caching, use this to migrate state from the old page to the
  new page without requerying an API. The only properties available are:
  - `pages.current.name`
  - `pages.current.props`
  - `pages.current.state`

It also houses every server function registered with
[pages.fn()](#pagesfnname-fn).

The `render` callback doubles as a redirector; passing it either a URI or a
name/props pair will skip rendering of the current page and either send a 302
response (if running on the server) or begin an AJAX GET of the indicated page
(if running in the browser). For example, if there was an error fetching data
from an API, you can redirect to a not-found page via:

```js
module.exports = {
  read: function(pages, render) {
    var page = this;
    var session = pages.session;
    var current = pages.current;

    if (current && current.props.username === 'beatrix') {
      this.setState({
        user: current.state.user
      });
      render();
    }
    else {
      api.getUser('beatrix', function(err, user) {
        if (err) {
          render('error', {code: 404, msg: err.message});
          // Assuming the 'error' route path is simply: '/error', the
          // following would be equivalent:
          //render('/error?code=404&msg=' + encodeURIComponent(err.message));
        }
        else {
          page.setState({user: user});
          render();
        }
      });
    }
  }

  // ...
};
```

where `'error'` is the name of a route.

#### recover(pages)

If stashing was disabled in [Page.read()](#readpagesrender), the state that
was not stashed should be recovered from the server-rendered HTML in this
method. This is called once per browser session, on initial page load.

For example, an API might return a large chunk of raw HTML. Rather than
use the automatic webpages.js stashing and recovery feature, it would be more efficient
to read the HTML from the document on initial page load.

For example, given the layout prototype:

```js
var Layout = {
  render: function(pages) {
    return (
      '<div id="post">' + this.state.blogPost + '</div>'
    );
  }
};
```

Custom state stashing and recovery could be acheived as follows:

```js
var MyPage = {
  read: function(pages, render) {
    var page = this;
  
    // Important... see this later in the docs. Turns off all
    // stashing.
    page.stash(false);
  
    request.get('https://api.blog.com/posts/42')
    .end(function(res) {
      page.setState({
        blogPost: res.text
      });
      render();
    });
  },

  // Called on only the browser.
  recover: function(pages) {
    this.setState({
      blogPost: document.getElementById('post').innerHTML
    });
  },

  run: function(pages) {
    // and we have it...
    console.log(this.state.blogPost);
  }
};
```

#### render(pages)

This method should exist on all page prototypes that have a `read()` method
and on the special [layout](#optslayout) prototype.

In both versions, the `pages` object has the following
properties:

- `pages.csrf`: Properties required by webpages.js when submitting forms
  to protect against cross-site request forgeries. The following strings
  should be set as attributes on a hidden `<input>` element that appears
  *first* in any `<form>` groups. Each property name matches the `<input>`
  attribute name on which it should be set.
  - `pages.csrf.name`: Field name recognized by osh-pages.
  - `pages.csrf.value`: The csrf token.
- `pages.uri(name, props)`: Get a URI from route name/props pairs for creating
  links.

##### Layout.render(pages)

The render method on the layout prototype is called on the server for
initial renders. This version should
return the entire page html, including `<!DOCTYPE html>`, `<head>`, and
whatnot.

Example:

```js
var escape = require('escape-html');

var Layout = {
  // ...

  render: function(pages) {
    return (
      '<!DOCTYPE html>' +
        '<head>' +
          escape(this.state.title) +
        '</head>' +
        '<body>' +
          this.state.body +
          this.renderAjax() +
        '</body>'
      '</html>'
    );
  }
};

module.exports = Layout;
```

##### Page.render(pages)

Update the browser document to show the current page. A very basic implementation
(that would defeat the purpose of AJAX navigation) might be:

```js
var MyPage = {
  // ...

  render: function(pages) {
    document.body.innerHTML = this.state.body;
    document.title = this.state.title;
  }
};
```

A more performant version would find the smallest difference between the
currently rendered page and the page to render, and update only those elements
of the document that need it. React.js provides automatic DOM diffing and is a
good choice here (in fact, this library was built with React rendering in
mind); in principle, any DOM diffing/rendering tool would work.

Event handlers *should not* be attached to the document in this step. Instead
they *should* be attached in the run() lifecycle method, which gets called both
on initial page load and after each AJAX render. In general, it is okay to push
rendering into the run method (at the risk of re-rendering your initial page),
but not okay to push progressive enhancement into the render method.

*Note: In the case of a view library like React, which provides rendering and
progressive enhancement, simply defer rendering to run() (although
setting some DOM, like document.title, might be more appropriate for
render()). Up to you.*

#### run(pages)

Attach event handlers to the DOM. Or use a view library (like ReactJS) that
handles progressive enhancement, DOM diffing/rendering, and event handling.

#### write(pages, redirect)

Called when the page is POSTed to. This method stands alone; render
methods are not called after write, because pages should not be returned from
POST requests, only redirects (see [this wonderful treatise on the
topic](http://www.theserverside.com/news/1365146/Redirect-After-Post)). It is
possible to have a page prototype that consists only of a write method (do
this to create a route that serves only POST requests).

The `pages` object contains the following properties to help with
managing session state:

- `pages.session`: The current [Session](#session) instance.

It also houses every server function registered with
[pages.fn()](#pagesfnname-fn).

Inside the write method, `this.payload` is used to access the data that was
POSTed from the form. Standard urlencoded forms will result in a simple
`this.payload` object, where keys are form input names. For example, submission
of the form:

```html
<form>
  <input name="greeting" type="text" value="hello"/>
  <input type="submit"/>
</form>
```

would result in a payload object (shown as json):

```js
{
  "greeting": "hello"
}
```

If the form encoding was `multipart/form-data` (for
file uploads), then the `this.payload` object will be a readable stream which
can be piped to a superagent request to some API. If not piping, the payload
can be split up by listening for `'field'` events (`this.payload` is also an
event emitter in this case).

The given redirect method should be called with a name and props object
like,

```js
redirect('view-user', {username: 'tory'});
```

or with a uri

```js
redirect('/users/tory');
```

In the following contrived example, the write method is enacting a POST
request that will attempt to change the full name of a user:

```js
var Page = module.exports = {
  // ...

  write: function(session, redirect) {
    request.post('https://api.mysite.com/users/' + session.state.username)
    .set('x-api-key', session.state.apiKey)
    .send({
      fullname: this.payload.fullname
    })
    .end(function(res) {
      if (res.ok) {
        redirect('view-user', {
          username: session.state.username
        });
      }
      else {
        redirect('update-user-form', {
          // Some error message from the API server:
          msg: res.body.message
        });
      }
    });
  }
};
```


### Instance methods

These methods are used from within the lifecycle methods described above.

#### setState(state)

Call this in [Page.read()](#readpagesrender) and [Page.recover()](#recoverpages)
to set downloaded or recovered state on the page instance.

#### stash(boolean)

Toggle stashing of state set with [setState()](#setstatestate). By default,
stashing is turned on, so that all the state set in a Page's read lifecycle
method is available in the browser on initial page load (without the need for
requerying APIs).

#### renderAjax()

Call this in your layout render method to enable AJAX/progressive enhancement.  It
includes `<script>` elements for the javascript bundles generated by Dynapack
and a `<span>` for transporting state that was stashed in a Page's read method
for reuse in the browser.


## Session

This is passed in to the read/write lifecycle methods on the pages object. Use it to
set small chunks of data in cookies that are persisted between pages.
There are two types of state that can be set to a session, public and secret. Public
state is available on `pages.session.state` whereas secret state is only available on
`this.session.secrets` from within a [server function](#pagesfnname-fn).

### session.setState(state)

Store public data in a browser cookie. This function can be called anywhere (browser
or server) and does *not* set the `http-only` flag. This state persis

### session.setSecrets(secrets)

Store secret session data in a `http-only` browser cookie. This method is only callable
from within a [server function](#pagesfnname-fn), where the session instance is
found at `this.session`.

## License

MIT
