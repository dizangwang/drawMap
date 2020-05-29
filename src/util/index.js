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
  }
};
