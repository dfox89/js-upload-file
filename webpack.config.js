const path = require('path')
const webpack = require('webpack')
const ESLintPlugin = require('eslint-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const package = require('./package.json')

const webpackConfig = {
  mode: process.env.NODE_ENV,
  entry: process.env.NODE_ENV === 'production' ? './src/index.js' : ['./src/index.js'],
  devtool: process.env.NODE_ENV === 'production' ? false : 'eval-source-map',
  output: {
    filename: `${package.name}.min.js`,
    path: path.join(__dirname, './dist/'),
    publicPath: '/',
    library: 'JsUploadFile',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              'babel-plugin-dynamic-import-polyfill'
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new ESLintPlugin()
  ],
  stats: {
    modules: false
  }
}
if (process.env.NODE_ENV === 'production') {
  webpackConfig.plugins.push(new webpack.BannerPlugin(`${package.name} v${package.version} ${package.author}\n${package.repository.url}`))
  webpackConfig.plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    reportFilename: 'analyzer-report.html',
    openAnalyzer: false
  }))
}

module.exports = webpackConfig
