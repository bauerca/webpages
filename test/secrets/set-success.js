module.exports = {
  read: function(pages, render) {
    pages.session.setState({nosecret: 'helloworld'});
    pages.setIt(null, function(err) {
      render();
    });
  },

  render: function() {}
};
