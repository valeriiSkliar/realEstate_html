// webpack.config.js - Updated to suppress Sass deprecation warnings
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin"); // Import the plugin
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  entry: {
    // index script
    index: "./src/js/index.js",

    // Pages scripts
    // search: "./src/js/pages/search.js",
    // profile: "./src/js/pages/profile.js",
    // collections: "./src/js/pages/collections.js",
    // subscriptions: "./src/js/pages/subscriptions.js",
    // support: "./src/js/pages/support.js",
    // myAdvertisements: "./src/js/pages/my-advertisements.js",

    // // Components styles
    // breadcrumbs: "./src/scss/components/_breadcrumbs.scss",
    // propertyCard: "./src/scss/components/_property-card.scss",
    // propertyCardList: "./src/scss/components/_property-card-list.scss",
    // myAdvertisementCard: "./src/scss/pages/_my-advertisements.scss",

    // // Pages styles
    // homePage: "./src/scss/pages/_home.scss",
    // searchPage: "./src/scss/pages/_search.scss",
    // profilePage: "./src/scss/pages/_profile.scss",
    // supportPage: "./src/scss/pages/_support.scss",
    // favoritesPage: "./src/scss/pages/_favorites.scss",
    // collectionsPage: "./src/scss/pages/_collections.scss",
    // subscriptionsPage: "./src/scss/pages/_subscriptions.scss",
    // myAdvertisementsPage: "./src/scss/pages/_my-advertisements.scss",
    // propertyViewPage: "./src/scss/pages/_property-view.scss",
    // listingsCreatePage: "./src/scss/pages/_listings-create.scss",
    // archivedAdvertisementsPage:
    //   "./src/scss/pages/_archived-advertisements.scss",
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "js/[name].[contenthash].js",
    filename: "js/[name].[contenthash].js",
    clean: true,
  },
  resolve: {
    alias: {
      "@fonts": path.resolve(__dirname, "src/fonts"),
    },
  },
  optimization: {
    minimize: process.env.NODE_ENV === "production",
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    ],
    splitChunks: {
      chunks: "all",
      maxInitialRequests: 20,
      maxAsyncRequests: 20,
      cacheGroups: {
        // jquery: {
        //   test: /[\\/]node_modules[\\/]jquery[\\/]/,
        //   name: "jquery",
        //   chunks: "all",
        //   priority: 40,
        // },
        // bootstrap: {
        //   test: /[\\/]node_modules[\\/]bootstrap[\\/]/,
        //   name: "bootstrap",
        //   chunks: "all",
        //   priority: 30,
        // },
        // swiper: {
        //   test: /[\\/]node_modules[\\/]swiper[\\/]/,
        //   name: "swiper",
        //   chunks: "all",
        //   priority: 30,
        // },
        // select2: {
        //   test: /[\\/]node_modules[\\/]select2[\\/]/,
        //   name: "select2",
        //   chunks: "all",
        //   priority: 30,
        // },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 10,
        },
        shared: {
          name: "shared",
          minChunks: 2,
          chunks: "all",
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: () => [require("autoprefixer")],
              },
            },
          },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                outputStyle: "expanded",
                sourceMap: true,
                includePaths: ["node_modules"],
                quietDeps: true, // Suppress warnings from dependencies
                logger: {
                  warn: function (message) {
                    // Suppress specific deprecation warnings
                    if (
                      message.includes("Deprecation") ||
                      message.includes("deprecated")
                    ) {
                      return;
                    }
                    console.warn(message);
                  },
                },
              },
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["css-loader"],
        include: [path.resolve(__dirname, "src/scss/components")],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
        exclude: [path.resolve(__dirname, "src/scss/components")],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name].[hash][ext]",
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/property-view-standalone.html",
      filename: "property-view-standalone.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "propertyViewPage",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/search-page-preview.html",
      filename: "search.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "search",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/main-dashboard-page-preview.html",
      filename: "index.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "homePage",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/profile-page-preview.html",
      filename: "profile.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "profile",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/support-page-preview.html",
      filename: "support.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "support",
      //   "supportPage",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/subscriptions-page-preview.html",
      filename: "subscriptions.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "subscriptions",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/favorites-page-preview.html",
      filename: "favorites.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "favorites",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/collections-page-preview.html",
      filename: "collections.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "collections",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/collections-create-page-preview.html",
      filename: "collections-create.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "collections",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/collections-edit-page-preview.html",
      filename: "collections-edit.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "collections",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/my-advertisements-page-preview.html",
      filename: "my-advertisements.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      //   "myAdvertisements",
      // ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/listings-create-page-preview.html",
      filename: "listings-create.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      // ],
    }),

    new HtmlWebpackPlugin({
      template: "./src/pages/previews/forms-examples-preview.html",
      filename: "forms-examples.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      // ],
    }),
    new HtmlWebpackPlugin({
      template:
        "./src/pages/previews/archived-advertisements-page-preview.html",
      filename: "archived-advertisements.html",
      // chunks: [
      //   "jquery",
      //   "bootstrap",
      //   "swiper",
      //   "select2",
      //   "vendors",
      //   "shared",
      //   "index",
      // ],
    }),

    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/images"),
          to: path.resolve(__dirname, "public/images"),
        },
      ],
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
  performance: {
    maxAssetSize: 500000,
    maxEntrypointSize: 1000000,
    hints: process.env.NODE_ENV === "production" ? "warning" : false,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 9000,
    hot: true,
  },
};
