var extend = require('xtend/mutable');
var Router = require('./router');


function Pages(opts) {
  Router.call(this, opts);
  this._cache = {};
  this._Base = opts.Page;
  opts.routes && this.routes(opts.routes);
}

Pages.FN_PATH = '/__fn__';

extend(Pages.prototype, Router.prototype, {
  _setPrototype: function(name, proto) {
    var BasePage = this._Base;
    function Page() {BasePage.call(this)}
    extend(
      Page.prototype,
      BasePage.prototype,
      {
        name: name
      },
      proto
    );
    this._cache[name] = Page;
    return Page;
  }
});

module.exports = Pages;
