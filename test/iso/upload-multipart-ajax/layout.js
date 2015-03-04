module.exports = {
  render: function(pages) {
    return (
      '<!DOCTYPE html>' +
      '<html>' +
      '<body>' +
        this.renderForm(pages) +
        this.renderAjax() + // should result in onsubmit interception
      '</body>' +
      '</html>'
    );
  }
};
