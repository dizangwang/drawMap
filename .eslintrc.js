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
    "camelcase": 2, //变量，函数名遵循驼峰命名法
    "no-shadow-restricted-names": 2, // js关键字和保留字不能作为函数名或者变量名
    "no-dupe-args": 2, // 函数定义的时候不允许出现重复的参数
    "no-inline-comments": 2, // 不允许行内注释
    "semi": [2, "always"], // 强制语句分号结尾
    "max-len": 120, // 一行最大长度，单位为字符 一个很长的语句的时候控制一下在120个字母左右换行
    "no-eval": 2, // 不允许使用eval()
    "no-with": 2, // 不允许使用with语句
    "no-eq-null": 2, // 不允许对null用==或者!=
    "comma-dangle": [2, "never"], // 是否允许对象中出现结尾逗号
    "no-alert": 2, //不允许使用alert，confirm，prompt语句
    'no-debugger': 2,
    'no-console': 2,
    "no-multiple-empty-lines": [2, {
      "max": 1
    }], // 空行最多不能超过一行
    "no-array-constructor": 2,//禁止使用数组构造器
  },
};
