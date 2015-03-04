var api = require('./api');
var merge = require('xtend/immutable');
var stem = require('osh-iso-test');

var UserPage = {
  read: function(session, done) {
    var page = this;

    this.setState({title: 'User page'});
    api.getUser(page.props.username, function(err, user) {
      page.setState({
        user: user,
        body: (
          '<h1 id="name">' + user.name + '</h1>'
        )
      });
      done();
    });
  },

  render: function() {},

  run: function() {
    // When we run, we better be tory, not adam. Because tory
    // interrupts adam.
    if (this.props.username === 'tory') stem.ok('tory interrupted adam');
    else stem.fail('tory should have interrupted adam');
  }
};

module.exports = UserPage;
