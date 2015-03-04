var iso = require('osh-iso-test');

var ReceiveUploadAjax = {

  /**
   *  The first time we readAndWrite the upload is in the browser using
   *  ajax.
   */

  write: function(session, redirect) {
    // Better be in the browser, this is AJAX baby.
    if ('undefined' == typeof window) {
      iso.fail('Upload was not AJAX');
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

module.exports = ReceiveUploadAjax;
