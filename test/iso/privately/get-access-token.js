module.exports = function(opts, done) {
  if (opts.msg !== 'access') {
    return done(new Error('No payload in RPC getAccessToken'));
  }
  try {
    this.session.setState({accessToken: 'deadbeef'});
    this.session.setSecrets({refreshToken: 'badf00d'});
    done();
  }
  catch (err) {
    done(err);
  }
};
