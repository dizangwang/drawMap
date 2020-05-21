module.exports = {
  publicPath: "./",
  outputDir: "dist/project",
  lintOnSave: false,
  assetsDir: "",
  devServer: {
    port: "30000",
    proxy: {
      '/api': {
        pathRewrite: {
          '^/api': '/',
        },
        target: "http://36.155.125.90:10000"
      },
    }
  },
};
