var iso = require('osh-iso-test');
var merge = require('xtend/immutable');

var LinkPage = {
  read: function(pages, render) {
    render();
  },

  render: function() {},

  /**
   *  This instance of pages has the following methods
   */

  run: function(pages) {
    var link = pages.link(this.name, this.props);
    if (!link || link.href !== this.uri) {
      iso.fail('pages.link() failed in run');
    }
    else {
      iso.ok('');
    }
  }
};

module.exports = LinkPage;
