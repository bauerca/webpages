var iso = require('osh-iso-test');
var ReceiveUploadMultipart = require('../upload-multipart/upload');
var merge = require('xtend/immutable');

var ReceiveUploadMultipartAjax = merge(ReceiveUploadMultipart, {
});

module.exports = ReceiveUploadMultipartAjax;
