module.exports = {
  read: function(pages, render) {
    // Try to set the secret. Should fail.
    pages.session.setSecrets({secret: 'sh'});
    render();
  },
  render: function() {}
};
