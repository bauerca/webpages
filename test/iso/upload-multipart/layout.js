module.exports = {
  render: function(pages) {
    return (
      '<html>' +
      '<body>' +
        this.renderForm(pages) +
      '</body>' +
      '</html>'
    );
  }
};
