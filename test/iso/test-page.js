
var browser = ('undefined' != typeof window);

module.exports = {
  readAndWrite: function(session, done) {

    this.readAndWriteBrowser(session, function(msg) {
      if (msg) stem.fail(msg);
      else done();
    });

  }



};
