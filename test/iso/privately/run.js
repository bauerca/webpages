var iso = require('osh-iso-test');

var RunPrivately = {
  read: function(pages, render) {
    if (this.props.refresh) {
      pages.refreshAccessToken({msg: 'refresh'}, function(err) {
        if (err) iso.fail(err.message);
        else if (pages.session.state.accessToken !== 'deadbeef2') {
          iso.fail('access token not updated');
        }
        else iso.ok('A-ok');
      });
    }
    else {
      pages.getAccessToken({msg: 'access'}, function(err) {
        if (err) iso.fail(err.message);
        else if (pages.session.state.accessToken !== 'deadbeef') {
          iso.fail('access token not set');
        }
        else render();
      });
    }
  },
  render: function() {}
};

module.exports = RunPrivately;
