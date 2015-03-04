var iso = require('osh-iso-test');

/**
 *  This test has the following flow:
 *
 *    1. GET /: Render RunUpload on server, AJAX submit form.
 *    2. POST /upload?next=server: Happens completely on client. Redirect to:
 *    3. GET /?where=server: 
 *    3. 
 */


var RunUploadMultipart = {
  read: function(pages, render) {
    render();
  },

  renderForm: function(pages) {
    var csrf = pages.csrf;
    return (
      '<form id="form" method="POST" action="/" enctype="multipart/form-data">' +
        '<input type="hidden" name="' + csrf.name + '" value="' + csrf.value + '"/>' +
        '<input type="text" name="hello" value="hello"/>' +
        '<input type="file" name="filefield"/>' +
        '<input id="submitter" type="submit" value="Submit form"/>' +
      '</form>'
    );
  },

  render: function() {},

  envOk: function() {
    // Better be on the server.
    if ('undefined' != typeof window) {
      iso.fail('Upload was not POSTed to the server');
      return false;
    }
    return true;
  },

  write: function(pages, redirect) {
    if (this.envOk()) {
      if (!this.payload) {
        iso.fail('Payload does not exist');
      }
      else {
        // Listen for multipart data.
        var failMessage;
        var fieldOk;
        var fileOk;
        this.payload.on('field', function(name, value) {
          if (name !== 'hello' || value !== 'hello') {
            failMessage = 'bad regular field';
          }
          else fieldOk = true;
          console.log(arguments);
        });
        this.payload.on('file', function(name, file, filename, encoding, mimetype) {
          if (name !== 'filefield') {
            failMessage = 'bad file field';
          }
          else fileOk = true;
          file && file.resume && file.resume();
          console.log(arguments);
        });
        this.payload.on('finish', function() {
          if (!fieldOk) iso.fail('missing regular field');
          else if (!fileOk) iso.fail('missing file field');
          else {
            failMessage ? iso.fail(failMessage) : iso.ok('A-Ok');
          }
        });
      }
      // Don't redirect. Test result should take over page.
    }
  }
};

module.exports = RunUploadMultipart;
