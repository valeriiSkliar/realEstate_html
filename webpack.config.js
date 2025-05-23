// webpack.config.js - Updated to suppress Sass deprecation warnings
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin"); // Import the plugin

module.exports = {
  entry: {
    main: "./src/js/index.js",
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
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/property-view-standalone.html",
      filename: "property-view-standalone.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/search-page-preview.html",
      filename: "search.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/main-dashboard-page-preview.html",
      filename: "index.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/profile-page-preview.html",
      filename: "profile.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/support-page-preview.html",
      filename: "support.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/subscriptions-page-preview.html",
      filename: "subscriptions.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/favorites-page-preview.html",
      filename: "favorites.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/collections-page-preview.html",
      filename: "collections.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/collections-create-page-preview.html",
      filename: "collections-create.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/collections-edit-page-preview.html",
      filename: "collections-edit.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/my-advertisements-page-preview.html",
      filename: "my-advertisements.html",
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/previews/listings-create-page-preview.html",
      filename: "listings-create.html",
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
      ],
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
