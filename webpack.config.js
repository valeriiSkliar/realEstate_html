// webpack.config.js - Updated to suppress Sass deprecation warnings
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin"); // Import the plugin
const webpack = require("webpack");

module.exports = {
  entry: {
    // Общий скрипт для всех страниц
    common: "./src/js/common.js",

    // Специфические скрипты для страниц
    search: "./src/js/pages/search.js",
    profile: "./src/js/pages/profile.js",
    favorites: "./src/js/pages/favorites.js",
    collections: "./src/js/pages/collections.js",
    subscriptions: "./src/js/pages/subscriptions.js",
    support: "./src/js/pages/support.js",
    myAdvertisements: "./src/js/pages/my-advertisements.js",

    // Стили компонентов
    breadcrumbs: "./src/scss/components/_breadcrumbs.scss",
    propertyCard: "./src/scss/components/_property-card.scss",
    propertyCardList: "./src/scss/components/_property-card-list.scss",
    myAdvertisementCard: "./src/scss/pages/_my-advertisements.scss",
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "js/[name].js",
    clean: true,
  },
  resolve: {
    alias: {
      "@fonts": path.resolve(__dirname, "src/fonts"),
    },
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
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
      chunks: ["common", "vendors", "shared"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/search-page-preview.html",
      filename: "search.html",
      chunks: ["common", "vendors", "shared", "search"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/main-dashboard-page-preview.html",
      filename: "index.html",
      chunks: ["common", "vendors", "shared"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/profile-page-preview.html",
      filename: "profile.html",
      chunks: ["common", "vendors", "shared", "profile"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/support-page-preview.html",
      filename: "support.html",
      chunks: ["common", "vendors", "shared", "support"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/subscriptions-page-preview.html",
      filename: "subscriptions.html",
      chunks: ["common", "vendors", "shared", "subscriptions"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/favorites-page-preview.html",
      filename: "favorites.html",
      chunks: ["common", "vendors", "shared", "favorites"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/collections-page-preview.html",
      filename: "collections.html",
      chunks: ["common", "vendors", "shared", "collections"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/collections-create-page-preview.html",
      filename: "collections-create.html",
      chunks: ["common", "vendors", "shared", "collections"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/collections-edit-page-preview.html",
      filename: "collections-edit.html",
      chunks: ["common", "vendors", "shared", "collections"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/my-advertisements-page-preview.html",
      filename: "my-advertisements.html",
      chunks: ["common", "vendors", "shared", "myAdvertisements"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/listings-create-page-preview.html",
      filename: "listings-create.html",
      chunks: ["common", "vendors", "shared"],
    }),

    new HtmlWebpackPlugin({
      template: "./src/pages/previews/forms-examples-preview.html",
      filename: "forms-examples.html",
      chunks: ["common", "vendors", "shared"],
    }),

    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    // Configure CopyPlugin
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/images"),
          to: path.resolve(__dirname, "public/images"),
        },
        {
          from: path.resolve(__dirname, "src/scss/components"),
          to: path.resolve(__dirname, "public/css/components"),
        },
        {
          from: path.resolve(__dirname, "src/fonts"),
          to: path.resolve(__dirname, "public/fonts"),
        },
      ],
    }),
    // Provide jQuery globally
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 9000,
    hot: true,
  },
};
