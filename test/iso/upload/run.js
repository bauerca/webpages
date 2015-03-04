/**
 *  This test has the following flow:
 *
 *    1. GET /: Render RunUpload on server, AJAX submit form.
 *    2. POST /upload?next=server: Happens completely on client. Redirect to:
 *    3. GET /?where=server: 
 *    3. 
 */


var RunUpload = {
  read: function(pages, render) {
    this.setState({where: this.props.where || 'browser'});
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
  },

  render: function() {}
};

module.exports = RunUpload;
