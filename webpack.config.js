const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const GoogleFontsPlugin = require('google-fonts-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';
const isDevelopment = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';

const mode = isDevelopment ? 'development' : 'production';
let output = {
  filename: '[name].[hash].js',
  path: path.resolve(__dirname, 'dist'),
};

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv),
    },
  }),
  new HtmlWebpackPlugin({
    title: 'React boilerplate',
    chunks: ['main'],
    meta: { viewport: 'width=device-width, initial-scale=1' },
  }),
  // https://github.com/SirPole/google-fonts-plugin#readme
  new GoogleFontsPlugin({
    'google-fonts-plugin': {
      fonts: [
        {
          family: 'JetBrains Mono',
          variants: ['200', '400', '700'],
          subsets: ['latin-ext'],
        },
      ],
      formats: ['woff', 'woff2'],
    },
  }),
];

if (isDevelopment) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

var buildPath = '/rSketches/dist/';
if (isProduction) {
  plugins.push(new CleanWebpackPlugin({ verbose: true }));
  output = {
    // filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this',

    // path: path.resolve(__dirname, 'rSketches/dist/'),
    filename: '[name].[hash].js',
    publicPath: buildPath,
  };
}

module.exports = {
  devtool: isDevelopment ? 'cheap-module-inline-source-map' : 'source-map',
  mode: mode,
  entry: { main: ['@babel/polyfill', './src/index.js'] },
  output: output,
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.((glb)|(hdr)|jpe?g|png|gif|mp4|mp3|ogg|webm)$/,
        loader: 'file-loader',
        options: {
          outputPath: 'static/media/',
          name: '[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true, // true outputs JSX tags
            },
          },
        ],
      },
    ],
  },
  plugins: plugins,
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    publicPath: '/',
    historyApiFallback: true,
    compress: true,
    port: 3000,
    hot: isDevelopment,
    host: '0.0.0.0',
    disableHostCheck: true,
  },
};
