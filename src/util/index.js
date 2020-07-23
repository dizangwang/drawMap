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

  // post请求文件
  postDownload(config) {
    // 创建iframe
    var iframe = document.createElement("iframe");
    iframe.setAttribute("id", "downFilePostIframe");
    iframe.setAttribute("name", "downFilePostIframe");
    iframe.setAttribute("enctype", "multipart/form-data");
    iframe.style.height = "0px";
    iframe.style.display = "none";
    // 创建form
    const form = document.createElement("form");
    form.setAttribute("target", "down-file-iframe");
    form.setAttribute("method", "post");
    form.setAttribute("id", "downFilePostForm");
    form.setAttribute("action", config.url);
    // 组装表单数据
    Object.keys(config.data).forEach((key) => {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", key);
      input.setAttribute("value", config.data[key]);
      form.appendChild(input);
    });

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    // 提交
    form.submit();
    // 删除iframe和表单
    document.body.removeChild(iframe);
    document.body.removeChild(form);
  },

  // 上传并解析geojson文件
  parseGeson(context, fileInputId) {
    return new Promise(((resolve) => {
      // 获取dom
      var inputFile = document.querySelector(`#${fileInputId}`);
      // 文件变动
      inputFile.addEventListener("change", (event) => {
        const uri = event.target.value;
        // 判断文件格式
        if (!/.geojson/ig.test(uri)) {
          context.$message({
            type: "warning",
            message: "请上传geojson文件"
          });
          // 清空文件
          document.querySelector(`#${fileInputId}`).value = "";
          return;
        }
        const reader = new FileReader();
        // 读取文件信息
        reader.readAsText(inputFile.files[0]);
        reader.onload = (evt) => {
          document.querySelector(`#${fileInputId}`).value = "";
          const fileString = evt.target.result;
          const result = {
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
