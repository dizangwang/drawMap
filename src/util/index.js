export default {
  localstorage_set(param1, param2) {
    const key = param1;
    const value = param2;
    localStorage.setItem(key, JSON.stringify(value));
  },
  localstorage_get(param) {
    let key = param;
    key = localStorage.getItem(key);
    if (typeof key === 'undefined') {
      return '';
    }
    return JSON.parse(key);
  },
  localstorage_remove(paramkey) {
    const key = paramkey;
    localStorage.removeItem(key);
  },
};
