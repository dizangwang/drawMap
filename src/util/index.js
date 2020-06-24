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
    var iframe = document.createElement("iframe");
    iframe.setAttribute("id", "downFilePostIframe");
    iframe.setAttribute("name", "downFilePostIframe");
    iframe.setAttribute("enctype", "multipart/form-data");
    iframe.style.height = "0px";
    iframe.style.display = "none";
    const form = document.createElement("form");
    form.setAttribute("target", "down-file-iframe");
    form.setAttribute("method", "post");
    form.setAttribute("id", "downFilePostForm");
    form.setAttribute("action", config.url);
    Object.keys(config.data).forEach((key) => {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", key);
      input.setAttribute("value", config.data[key]);
      form.appendChild(input);
    });

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(iframe);
    document.body.removeChild(form);
  },
  getUUID() {
    function UUID() {
      this.id = this.createUUID();
    }
    UUID.prototype.valueOf = () => this.id;
    UUID.prototype.toString = () => this.id;
    UUID.prototype.createUUID = () => {
      var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
      var dc = new Date();
      var t = dc.getTime() - dg.getTime();
      var tl = UUID.getIntegerBits(t, 0, 31);
      var tm = UUID.getIntegerBits(t, 32, 47);
      var thv = `${UUID.getIntegerBits(t, 48, 59)}1`;
      var csar = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
      var csl = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
      var n = UUID.getIntegerBits(UUID.rand(8191), 0, 7)
        + UUID.getIntegerBits(UUID.rand(8191), 8, 15)
        + UUID.getIntegerBits(UUID.rand(8191), 0, 7)
        + UUID.getIntegerBits(UUID.rand(8191), 8, 15)
        + UUID.getIntegerBits(UUID.rand(8191), 0, 15);
      return tl + tm + thv + csar + csl + n;
    };
    UUID.getIntegerBits = (val, start, end) => {
      var base16 = UUID.returnBase(val, 16);
      var quadArray = [];
      var quadString = "";
      var i = 0;
      for (i = 0; i < base16.length; i += 1) {
        quadArray.push(base16.substring(i, i + 1));
      }
      for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i += 1) {
        if (!quadArray[i] || quadArray[i] === "") quadString += "0";
        else quadString += quadArray[i];
      }
      return quadString;
    };
    UUID.returnBase = (number, base) => (number).toString(base).toUpperCase();
    UUID.rand = (max) => Math.floor(Math.random() * (max + 1));
    return new UUID().id;
  },

  // 上传并解析geojson文件
  parseGeson(context, fileInputId) {
    return new Promise(((resolve) => {
      var inputFile = document.querySelector(`#${fileInputId}`);
      inputFile.addEventListener("change", (event) => {
        const uri = event.target.value;
        if (!/.geojson/ig.test(uri)) {
          context.$message({
            type: "warning",
            message: "请上传geojson文件"
          });
          document.querySelector(`#${fileInputId}`).value = "";
          return;
        }
        const reader = new FileReader();
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
