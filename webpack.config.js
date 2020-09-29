const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/circular-slider.js",
  devServer: {
    contentBase: "./dist",
    inline: true,
    hot: true,
  },
  output: {
    filename: "circular-slider.bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
