module.exports = {
  'run': {
    path: '/'
  },
  'user': {
    path: 'users/<username>',
    params: {username: /^\w+$/}
  }
};
