module.exports = {
  render: function(pages) {
    return (
      '<form id="form" action="/" method="POST">' +
        '<input name="test" value="hello" type="text"/>' +
      '</form>' +
      this.renderAjax()
    );
  }
};
