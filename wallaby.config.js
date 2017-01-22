module.exports = function() {
  return {
    files: ['index.js', 'lib/**/*.js', 'package.json'],
    tests: ['index.test.js', 'test/**/*.js'],
    env: {
      type: 'node'
    }
  };
};
