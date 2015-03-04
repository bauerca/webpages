module.exports = {
  render: function(pages) {
    return (
      '<html>' +
      '<body>' +
        this.renderForm(pages) +
        // Should intercept onsubmit:
        this.renderAjax() +
      '</body>' +
      '</html>'
    );
  }
};
