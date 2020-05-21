import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userInfo: { name: "矢量图" }
  },
  mutations: {
    USERINFO: (state, userInfo) => {
      state.userInfo = userInfo;
    }
  },
  actions: {
    setUserInfo({ commit }, mode) {
      commit("USERINFO", mode);
    }
  },
  getters: {
    userInfo: (state) => state.userInfo
  }

});
