var RunUploadAjax = {
  read: function(pages, render) {
    render();
  },

  renderForm: function(pages) {
    var csrf = pages.csrf;
    return (
      '<form id="form" method="POST" action="/upload">' +
        '<input type="hidden" name="' + csrf.name + '" value="' + csrf.value + '"/>' +
        '<input type="text" name="hello" value="hello"/>' +
        '<input id="submitter" type="submit" value="Submit form"/>' +
      '</form>'
    );
  }
};

module.exports = RunUploadAjax;
