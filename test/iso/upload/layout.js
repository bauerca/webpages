module.exports = {
  render: function(pages) {
    return (
      '<html>' +
      '<body>' +
        this.renderForm(pages) +
        '<script>document.getElementById("submitter").click();</script>' +
      '</body>' +
      '</html>'
    );
  }
};
