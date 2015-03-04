var stem = require('osh-iso-test');
var firstRun = true;

var RedirectorPage = {
  read: function(pages, render) {
    if (this.props.redirect) {
      redirected = true;
      render(this.name, {redirected: 'true'});
    }
    else render();
  },

  render: function() {},

  /**
   *  This instance of pages has the following methods
   */

  run: function(pages) {
    if (firstRun) {
      console.log('first run. requesting', this.name);
      pages.go(this.name, {redirect: true});
    }
    else if (this.props.redirected) {
      console.log('redirected');
      stem.ok('Success');
    }
    else {
      console.log('not redirected');
      stem.fail('Not redirected');
    }
    firstRun = false;
  }
};

module.exports = RedirectorPage;
