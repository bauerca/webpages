module.exports = {
  render: function() {
    return (
      '<!DOCTYPE html>' +
      '<body>' +
        this.renderAjax() +
      '</body>' +
      '</html>'
    );
  }
};
