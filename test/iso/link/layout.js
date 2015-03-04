module.exports = {
  render: function(pages) {
    if (pages.link(this.name, this.props).href !== this.uri) {
      iso.fail('pages.link() failed in renderToString');
    }
    return this.renderAjax();
  }
};
