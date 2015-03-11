var HistoryCacheBack = {
  read: function(pages, render) {
    render();
  },

  render: function() {
  },

  run: function() {
    window.history.back();
  }
};

module.exports = HistoryCacheBack;
