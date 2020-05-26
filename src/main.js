import Vue from "vue";
import ViewUI from "view-design";
import "view-design/dist/styles/iview.css";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/css/index.css";

// 挂载请求方法
import ajax from "./httpRequest/index";

// 挂载工具
import utils from "./util/index";

// 挂载接口
import apis from "./apis/index";

// 挂载上传下载接口
import uploadapis from "./apis/uploadApis";

Vue.use(ElementUI);
Vue.use(ViewUI);

Vue.prototype.ajax = ajax;
Vue.prototype.utils = utils;
Vue.prototype.apis = apis;
Vue.prototype.uploadApis = uploadapis;
Vue.config.productionTip = false;
new Vue({
  router,
  store,
  mounted() {

  },
  render: (h) => h(App)
}).$mount("#app");
