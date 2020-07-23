import axios from "axios";
// 跨域访问需要发送cookie时一定要加axios.defaults.withCredentials = true;
axios.defaults.withCredentials = true;
const ajax = (param) => {
  const obj = param;
  // 判断参数中有没有method
  if (typeof obj.method === "undefined" || !obj.method) {
    obj.method = "post";
  }
  // 针对请求超时的方法
  if (obj.method === "timeoutPost") {
    // // 处理参数
    let str = "";
    if (typeof obj.data !== "string") {
      Object.keys(obj.data).forEach((key) => {
        str += `${key}=${obj.data[key]}&`;
      });
      obj.data = str;
    }

    return axios({
      method: "post",
      url: obj.url,
      data: obj.data,
      timeout: 30000,
      responseType: "json",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      transformResponse: [function a(param1) {
        let data = param1;
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        return data;
      }]
    });
  }
  // 当请求方法为post时
  if (obj.method === "post") {
    // 处理参数
    let str = "";
    if (typeof obj.data !== "string") {
      Object.keys(obj.data).forEach((key) => {
        str += `${key}=${obj.data[key]}&`;
      });
      obj.data = str;
    }

    return axios({
      method: obj.method,
      url: obj.url,
      data: obj.data,
      responseType: "json",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      transformResponse: [function a(param1) {
        let data = param1;
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        return data;
      }]
    });
  }
  // 当请求方法时get时
  if (obj.method === "get") {
    return axios({
      method: obj.method,
      url: obj.url,
      params: obj.data,
      responseType: "json",
      headers: {
        "Content-Type": "application/json"
      },
      transformResponse: [function a(param2) {
        let data = param2;
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        return data;
      }]
    });
  }

  return "";
};
export default ajax;
