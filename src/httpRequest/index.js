import axios from "axios";
// 响应拦截
// axios.interceptors.response.use((response) => response, (error) => {

// });

const ajax = (param) => {
  const obj = param;
  if (typeof obj.method === "undefined" || !obj.method) {
    obj.method = "post";
  }
  if (obj.method === "post") {
    // 处理参数
    var str = "?";
    Object.keys(obj.data).forEach((key) => {
      str += `${key}=${obj.data[key]}&`;
    });
    return axios({
      method: obj.method,
      url: obj.url + str,
      data: {},
      responseType: "json",
      headers: {
        "Content-Type": "application/json"
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
