var stem = require('osh-iso-test');
var firstRun = true;

var TestHistoryPage = {
  read: function(pages, render) {
    render();
  },

  render: function() {},

  /**
   *  This instance of pages has the following methods
   */

  run: function(pages) {
    if (firstRun) {
      console.log('first run. requesting', this.name);
      pages.go(this.name, {went: true});
    }
    else if (this.props.went) {
      history.back();
    }
    else {
      stem.ok('Went back');
    }
    firstRun = false;
  }
};

module.exports = TestHistoryPage;
