module.exports = {
  render: function(pages) {
    return (
      this.props.check ? '' :
      '<script>document.location = "/?check=true";</script>'
    );
  }
};
