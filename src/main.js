import Vue from 'vue';
import ViewUI from 'view-design';
import App from './App.vue';
import router from './router';
import store from './store';

//引入默认样式
import '../src/assets/css/index.css';

// 使用UI组件 iview
import 'view-design/dist/styles/iview.css';

// 挂载请求方法
import ajax from './httpRequest/index';

// 挂载工具
import utils from './util/index';

// 挂载接口
import apis from './apis/index';

// 挂载上传下载接口
import uploadapis from './apis/uploadApis';

Vue.use(ViewUI);
Vue.prototype.ajax = ajax;
Vue.prototype.utils = utils;
Vue.prototype.apis = apis;
Vue.prototype.uploadApis = uploadapis;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  mounted () {
    
  },
  render: (h) => h(App),
}).$mount('#app');
