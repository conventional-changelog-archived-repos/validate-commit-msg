module.exports = function() {
  return {
    files: ['index.js', 'package.json'],
    tests: ['index.test.js'],
    env: {
      type: 'node'
    }
  };
};
