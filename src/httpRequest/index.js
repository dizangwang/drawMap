import axios from "axios";
// 响应拦截
// axios.interceptors.response.use((response) => response, (error) => {

// });
axios.defaults.withCredentials = true;
const ajax = (param) => {
  const obj = param;
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
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      transformResponse: [function a(param1) {
        let data = param1;
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        return data;
      }]
    });
  }
  if (obj.method === "post") {
    // // 处理参数
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
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      transformResponse: [function a(param1) {
        let data = param1;
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        return data;
      }]
    });
  }
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
