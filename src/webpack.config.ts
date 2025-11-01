import * as fs from "fs"
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

const config: webpack.Configuration[] = [
  {
    mode: "development",

    devtool: "inline-source-map",

    entry: "./src/client/index.tsx",

    externals: {
      "mongodb-client-encryption": "commonjs mongodb-client-encryption"
    },

    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(ts|js)x?$/i,
          use: ["ts-loader"],
          exclude: /node_modules/
        }
      ]
    },

    output: {
      filename: "[name].bundle.js",
      publicPath: "./"
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/client/index.html"
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ProvidePlugin({
        process: "process/browser.js"
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^mongodb-client-encryption$/,
      })
    ],

    resolve: {
      alias: {
        browser: "process/browser"
      },
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      fallback: {
        "buffer": require.resolve("buffer"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util")
      }
    },

    target: "web"
  },
  {
    mode: "development",

    devtool: "inline-source-map",

    entry: "./src/server/index.ts",

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: ["ts-loader"],
          exclude: /node_modules/
        }
      ]
    },

    output: {
      filename: "./index.js"
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js"]
    },

    target: "node"
  }
];

export default config;
