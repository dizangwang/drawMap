module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "eqeqeq": "off", //比较的时候使用严格等于
    "no-alert": 'error', //不允许使用alert，confirm，prompt语句
    "no-plusplus": 'off' //不允许使用++ --运算符
  },
};
