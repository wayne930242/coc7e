const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    bundle: path.resolve(__dirname, 'src/corecal.js'),
  },
  output: {
    publicPath: '/js',
    path: path.resolve(__dirname, 'js'),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname),
  },
}
