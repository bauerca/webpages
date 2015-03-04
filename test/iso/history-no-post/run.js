var iso = require('osh-iso-test');
var firstRun = true;
var redirected;

var TestHistoryOnPOSTPage = {
  read: function(pages, render) {
    render();
  },

  render: function() {},

  write: function(pages, redirect) {
    if (this.payload.test !== 'hello') {
      iso.fail('No payload');
    }
    else {
      redirect(this.name, {redirected: true});
    }
  },

  /**
   *  This instance of pages has the following methods
   */

  run: function(pages) {
    if (firstRun) {
      firstRun = false;
      pages.submit(
        document.getElementById('form')
      );
    }
    else if (this.props.redirected) {
      redirected = true;
      history.back();
    }
    else if (!redirected) {
      iso.fail('POST was not redirected');
    }
    else {
      iso.ok('POST is not in history');
    }
  }
};

module.exports = TestHistoryOnPOSTPage;
