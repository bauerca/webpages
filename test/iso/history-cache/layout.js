module.exports = {
  render: function(pages) {
    return (
      '<html><body>' +
        this.renderAjax() +
        '</body></html>'
    );
  }
};
