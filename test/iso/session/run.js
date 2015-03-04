var stem = require('osh-iso-test');

var SessionPage = {
  read: function(pages, done) {
    var session = pages.session;
    if (this.props.check) {
      //console.log(session.state);
      if (session.state.value === 'hello') stem.ok('Session state was set');
      else stem.fail('Session state missing');
    }
    else {
      // Clear session state from previous test.
      session.setState({value: 'hello'});
      done();
    }
  },
  render: function() {}
};

module.exports = SessionPage;
