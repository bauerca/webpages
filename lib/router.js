var extend = require('xtend/mutable');
var Route = require('osh-route');

/**
 *  A simple wrapper around a collection of
 *  [OshRoutes](https://github.com/openscihub/osh-route) for routing
 *  HTTP actions (i.e. GET /some/uri) to OshRoute props objects (or vice
 *  versa--returning URIs given the route name).
 */

function Router() {
  this._methods = {};
  this._methodRoutes = {GET: {}, POST: {}};
}

extend(Router.prototype, {

  /**
   *  Set the routes for this router instance. This method accepts a mapping
   *  between route names and [osh-route](https://github.com/openscihub/osh-route)
   *  configuration objects. This router will handle instantiation.
   *
   *  @param {Object<String, Object>} routeConfigs Mapping between route names and
   *  osh-route configs.
   */

  routes: function(routeConfigs) {
    var routeConfig;
    var route;

    this._routes = {};

    for (var name in routeConfigs) {
      routeConfig = routeConfigs[name];
      route = new Route(routeConfig);
      //console.log(route);
      this._routes[name] = route;
    }
  },

  /**
   *  Associate HTTP methods with the given route name.
   *
   *  @param {String} name The route name.
   *  @param {Array<String>} methods The methods supported by the given route name.
   */

  _setMethods: function(name, methods) {
    var routes;

    for (var i = 0; i < methods.length; i++) {
      routes = this._methodRoutes[methods[i]];
      routes[name] = this._routes[name];
    }

    this._methods[name] = methods;
  },

  /**
   *  @typedef {Object} Route
   *  @property {String} method Either "GET" or "POST".
   *  @property {String} name The name of the matched route or the name given in the
   *  construction of the route.
   *  @property {Object} props The props parsed from a uri or given in the construction
   *  of the route.
   *  @property {String} uri The uri built from the route name and props or given in
   *  the construction of the route.
   *  @property {String} action The string: "<method> <uri>" which can act as a unique
   *  identifier for this route.
   */

  /**
   *  @param {String} method Either GET or POST.
   *  @param {String} nameOrUri Name of route or a uri.
   *  @param {Object} propsOrUndefined A props object is required if the first argument
   *    is a route name, otherwise the props are contained in the query string.
   *
   *  @returns {Route} The matched and parsed route or undefined if there was no
   *  matching route.
   *
   */

  route: function(method, nameOrUri, propsOrUndefined) {
    if (!method || !nameOrUri) {
      throw new Error('EROUTING: Need HTTP method and name/uri');
    }

    var routes = this._methodRoutes[method];

    if (!routes) return;

    var uri, props, name;

    if (propsOrUndefined === undefined) {
      uri = nameOrUri;

      for (name in routes) {
        if (props = routes[name].props(uri)) break;
      }

      if (!props) return;
    }
    else {
      name = nameOrUri;
      props = propsOrUndefined;
      var route = routes[name];
      if (!route) return;
      uri = route.uri(props);
    }

    return {
      method: method,
      name: name,
      props: props,
      uri: uri,
      action: method + ' ' + uri
    };
  },

  form: function(name, props) {
    var info = this.route('POST', name, props);

    if (info) {
      return {
        action: info.uri,
        method: info.method
      };
    }
  },

  link: function(name, props) {
    var info = this.route('GET', name, props);

    if (info) return {href: info.uri};
  },

  uri: function(name, props) {
    var info = this.route('GET', name, props);

    if (info) return info.uri;
  }
});

module.exports = Router;
