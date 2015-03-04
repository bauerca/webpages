var extend = require('xtend/mutable');
var Route = require('osh-route');

function Router() {
  this._methods = {};
  this._methodRoutes = {GET: {}, POST: {}};
}

extend(Router.prototype, {
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

  _setMethods: function(name, methods) {
    var routes;
    for (var i = 0; i < methods.length; i++) {
      routes = this._methodRoutes[methods[i]];
      routes[name] = this._routes[name];
    }
    this._methods[name] = methods;
  },

  /**
   *  @param {String} name Name of route or a uri.
   *  @param {Object} props A props object is required if the first argument
   *    is a route name, otherwise name will be interpreted as a uri.
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
