var autoprefixer = require("autoprefixer");

module.exports = {
  publicPath: "./",
  outputDir: "dist/project",
  lintOnSave: false,
  assetsDir: "",
  devServer: {
    port: "30000",
    proxy: {
      "/backend": {
        target: "http://101.132.113.86:4000"
      },
      "/files": {
        target: "http://101.132.113.86:4000"
      }
      // "/api": {
      //   pathRewrite: {
      //     "^/api": "/"
      //   },
      //   target: "http://101.132.113.86:4000"
      // }
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
