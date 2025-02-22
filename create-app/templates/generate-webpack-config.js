const indent = require('../utils/indent');
const templateIf = require('../utils/template-if');

module.exports = (options) => {
  const { framework, type } = options;
  // eslint-disable-next-line
  const hasCordova = type.indexOf('cordova') >= 0;

  let resolveExtensions = "['.js', '.json']";
  if (framework === 'vue') {
    resolveExtensions = "['.js', '.vue', '.json']";
  }
  if (framework === 'react') {
    resolveExtensions = "['.js', '.jsx', '.json']";
  }

  return indent(0, `
    const webpack = require('webpack');
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    ${templateIf(framework === 'vue', () => `
    const VueLoaderPlugin = require('vue-loader/lib/plugin');
    `)}
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
    ${templateIf(type.indexOf('pwa') >= 0, () => `
    const WorkboxPlugin = require('workbox-webpack-plugin');
    `)}

    const path = require('path');

    function resolvePath(dir) {
      return path.join(__dirname, '..', dir);
    }

    const env = process.env.NODE_ENV || 'development';
    const target = process.env.TARGET || 'web';
    ${templateIf(hasCordova, () => `
    const isCordova =  target === 'cordova';
    `)}

    module.exports = {
      mode: env,
      entry: [
        './src/js/app.js',
      ],
      output: {
        ${templateIf(hasCordova, () => `
        path: resolvePath(isCordova ? 'cordova/www' : 'www'),
        `, () => `
        path: resolvePath('www'),
        `)}
        filename: 'js/app.js',
        publicPath: '',
      },
      resolve: {
        extensions: ${resolveExtensions},
        alias: {
          ${templateIf(framework === 'vue', () => `
          vue$: 'vue/dist/vue.esm.js',
          `)}
          '@': resolvePath('src'),
        },
      },
      devtool: env === 'production' ? 'source-map' : 'eval',
      devServer: {
        hot: true,
        open: true,
        compress: true,
        contentBase: '/www/',
        disableHostCheck: true,
        watchOptions: {
          poll: true,
        },
      },
      module: {
        rules: [
          {
            test: /\\.(js|jsx)$/,
            use: 'babel-loader',
            include: [
              resolvePath('src'),
              resolvePath('node_modules/framework7'),
              ${templateIf(framework === 'vue', () => `
              resolvePath('node_modules/framework7-vue'),
              `)}
              ${templateIf(framework === 'react', () => `
              resolvePath('node_modules/framework7-react'),
              `)}
              resolvePath('node_modules/template7'),
              resolvePath('node_modules/dom7'),
              resolvePath('node_modules/ssr-window'),
            ],
          },
          ${templateIf(framework === 'core', () => `
          {
            test: /\\.f7.html$/,
            use: [
              'babel-loader',
              {
                loader: 'framework7-component-loader',
                options: {
                  helpersPath: './src/template7-helpers-list.js',
                },
              },
            ],
          },
          `)}
          ${templateIf(framework === 'vue', () => `
          {
            test: /\\.vue$/,
            use: 'vue-loader',
          },
          `)}
          {
            test: /\\.css$/,
            use: [
              (env === 'development' ? 'style-loader' : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: '../'
                }
              }),
              'css-loader',
              'postcss-loader',
            ],
          },
          {
            test: /\\.styl(us)?$/,
            use: [
              (env === 'development' ? 'style-loader' : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: '../'
                }
              }),
              'css-loader',
              'postcss-loader',
              'stylus-loader',
            ],
          },
          {
            test: /\\.less$/,
            use: [
              (env === 'development' ? 'style-loader' : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: '../'
                }
              }),
              'css-loader',
              'postcss-loader',
              'less-loader',
            ],
          },
          {
            test: /\\.(sa|sc)ss$/,
            use: [
              (env === 'development' ? 'style-loader' : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: '../'
                }
              }),
              'css-loader',
              'postcss-loader',
              'sass-loader',
            ],
          },
          {
            test: /\\.(png|jpe?g|gif|svg)(\\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'images/[name].[ext]',
            },
          },
          {
            test: /\\.(mp4|webm|ogg|mp3|wav|flac|aac)(\\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'media/[name].[ext]',
            },
          },
          {
            test: /\\.(woff2?|eot|ttf|otf)(\\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'fonts/[name].[ext]',
            },
          },
        ],
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(env),
          'process.env.TARGET': JSON.stringify(target),
        }),
        ${templateIf(framework === 'vue', () => `
        new VueLoaderPlugin(),
        `)}
        ...(env === 'production' ? [
          // Production only plugins
          new UglifyJsPlugin({
            uglifyOptions: {
              compress: {
                warnings: false,
              },
            },
            sourceMap: true,
            parallel: true,
          }),
          new OptimizeCSSPlugin({
            cssProcessorOptions: {
              safe: true,
              map: { inline: false },
            },
          }),
          new webpack.optimize.ModuleConcatenationPlugin(),
        ] : [
          // Development only plugins
          new webpack.HotModuleReplacementPlugin(),
          new webpack.NamedModulesPlugin(),
        ]),
        new HtmlWebpackPlugin({
          filename: './index.html',
          template: './src/index.html',
          inject: true,
          minify: env === 'production' ? {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true
          } : false,
        }),
        new MiniCssExtractPlugin({
          filename: 'css/app.css',
        }),
        new CopyWebpackPlugin([
          {
            from: resolvePath('src/static'),
            ${templateIf(hasCordova, () => `
            to: resolvePath(isCordova ? 'cordova/www/static' : 'www/static'),
            `, () => `
            to: resolvePath('www/static'),
            `)}
          },
          ${templateIf(type.indexOf('pwa') >= 0, () => `
          {
            from: resolvePath('src/manifest.json'),
            to: resolvePath('www/manifest.json'),
          },
          `)}
        ]),
        ${templateIf(type.indexOf('pwa') >= 0 && hasCordova, () => `
        ...(!isCordova ? [
          new WorkboxPlugin.InjectManifest({
            swSrc: resolvePath('src/service-worker.js'),
          })
        ] : []),
        `, () => `
        `)}
        ${templateIf(type.indexOf('pwa') >= 0 && !hasCordova, () => `
        new WorkboxPlugin.InjectManifest({
          swSrc: resolvePath('src/service-worker.js'),
        }),
        `)}
      ],
    };
  `).trim();
};
