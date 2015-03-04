module.exports = function(opts, done) {
  if (this.session.secrets.refreshToken !== 'badf00d') {
    done(new Error('bad secret'));
  }
  else if (opts.msg !== 'refresh') {
    return done(new Error('No payload in RPC refreshAccessToken'));
  }
  else {
    this.session.setState({accessToken: 'deadbeef2'});
    done();
  }
};
