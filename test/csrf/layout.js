module.exports = {
  render: function(pages) {
    return pages.csrf.name + '=' + pages.csrf.value;
  }
};
