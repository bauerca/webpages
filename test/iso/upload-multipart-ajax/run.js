var RunUploadMultipart = require('../upload-multipart/run');
var merge = require('xtend/immutable');
var iso = require('osh-iso-test');

/**
 *  This test has the following flow:
 *
 *    1. GET /: Render RunUpload on server, AJAX submit form.
 *    2. POST /upload?next=server: Happens completely on client. Redirect to:
 *    3. GET /?where=server: 
 *    3. 
 */

var RunUploadMultipartAjax = merge(RunUploadMultipart, {
  envOk: function() {
    // Better be on the client.
    if ('undefined' == typeof window) {
      iso.fail('Upload was not AJAXed');
      return;
    }
    return true;
  }
});

module.exports = RunUploadMultipartAjax;
