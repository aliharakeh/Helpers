module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: ['postcss-loader']
      }
    ]
  }
};
