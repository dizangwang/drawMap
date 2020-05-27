import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userInfo: { name: "矢量图" },
    taskTypes: []
  },
  mutations: {
    USERINFO: (state, userInfo) => {
      state.userInfo = userInfo;
    },
    TASKTYPES: (state, taskTypes) => {
      state.taskTypes = taskTypes;
    }
  },
  actions: {
    setUserInfo({ commit }, mode) {
      commit("USERINFO", mode);
    },
    setTaskTypes({ commit }, mode) {
      commit("TASKTYPES", mode);
    }
  },
  getters: {
    userInfo: (state) => state.userInfo,
    taskTypes: (state) => state.taskTypes
  }

});
