var iso = require('osh-iso-test');

var ReceiveUpload = {
  /**
   *  The first time we readAndWrite the upload is in the browser using
   *  ajax.
   */

  write: function(pages, redirect) {
    // Better be on the server.
    if ('undefined' != typeof window) {
      iso.fail('Upload was not POSTed to the server');
    }
    else if (!this.payload) {
      iso.fail('Payload does not exist');
    }
    else if (this.payload.hello !== 'hello') {
      iso.fail('Payload did not contain data');
    }
    else {
      iso.ok('A-Ok');
    }
    // Don't redirect. Test result should take over page.
  }
};

module.exports = ReceiveUpload;
