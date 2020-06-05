export default {

  // 把数据放到本地缓存
  localstorageSet(key, value) {
    if (typeof value === "object") {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    if (typeof value === "string") {
      localStorage.setItem(key, value);
      return;
    }
    localStorage.setItem(key, value);
  },

  // 从本地缓存取出数据
  localstorageGet(getKey) {
    try {
      return JSON.parse(localStorage.getItem(getKey));
    } catch (e) {
      return localStorage.getItem(getKey);
    }
  },

  // 根据key
  localstorageRemove(rmKey) {
    localStorage.removeItem(rmKey);
  },

  // 上传并解析geojson文件
  parseGeson(context, fileInputId) {
    return new Promise(((resolve) => {
      var inputFile = document.querySelector(`#${fileInputId}`);
      inputFile.addEventListener("change", (event) => {
        var uri = event.target.value;
        if (!/.geojson/ig.test(uri)) {
          context.$message({
            type: "warning",
            message: "请上传geojson文件"
          });
          document.querySelector(`#${fileInputId}`).value = "";
          return;
        }
        var reader = new FileReader();
        reader.readAsText(inputFile.files[0]);
        reader.onload = (evt) => {
          document.querySelector(`#${fileInputId}`).value = "";
          var fileString = evt.target.result;
          var result = {
            code: "",
            data: ""
          };
          try {
            result.data = JSON.parse(fileString);
            result.code = 200;
            resolve(result);
            context.$message({
              type: "success",
              message: "上传成功"
            });
          } catch (error) {
            context.$message({
              type: "warning",
              message: "json解析异常,请检查内容的格式是否正确"
            });
            result.data = fileString;
            result.code = 400;
          }
          resolve(result);
        };
      }, false);
    }));
  }
};
