var iso = require('osh-iso-test');

var SessionPage = {
  read: function(pages, render) {
    var session = pages.session;
    if (this.props.check) {
      if (session.state.value === 'hello-ajax') iso.ok('Session state was set');
      else iso.fail('Session state missing');
      // no done(), let iso hijack the page.
    }
    else {
      // Clear session state from previous test.
      session.setState({value: 'hello-ajax'});
      render();
    }
  },

  render: function() {},

  run: function(pages) {
    // AJAX nav
    pages.go('/?check=true');
  }
};

module.exports = SessionPage;
