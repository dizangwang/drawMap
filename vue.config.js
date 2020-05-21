var autoprefixer = require("autoprefixer");

module.exports = {
  publicPath: "./",
  outputDir: "dist/project",
  lintOnSave: false,
  assetsDir: "",
  devServer: {
    port: "30000",
    proxy: {
      "/api": {
        pathRewrite: {
          "^/api": "/"
        },
        target: "http://"
      }
    }
  },

  css: {
    loaderOptions: {
      css: {
      },
      less: {
        javascriptEnabled: true
      },
      postcss: {
        plugins: [
          autoprefixer({
            overrideBrowserslist: [
              "last 20 versions"]
          })
        ]
      }
    }
  }
};
