module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    "plugin:vue/essential",
    "@vue/airbnb"
  ],
  parserOptions: {
    parser: "babel-eslint"
  },

  // 全局安装eslint-plugin-vue这个包
  rules: {

    // 变量，函数名遵循驼峰命名法
    camelcase: 2,

    // js关键字和保留字不能作为函数名或者变量名
    "no-shadow-restricted-names": 2,

    // 函数定义的时候不允许出现重复的参数
    "no-dupe-args": 2,

    // 不允许行内注释
    "no-inline-comments": 2,

    // 强制语句分号结尾
    semi: [2, "always"],

    // 一行最大长度，单位为字符 一个很长的语句的时候控制一下在120个字母左右换行
    "max-len": ["error", 120],

    // 不允许使用eval()
    "no-eval": 2,

    // 不允许使用with语句
    "no-with": 2,

    // 不允许对null用==或者!=
    "no-eq-null": 2,

    // 是否允许对象中出现结尾逗号
    "comma-dangle": [2, "never"],

    // 不允许使用alert，confirm，prompt语句
    "no-alert": 2,
    "no-debugger": 2,
    "no-console": 2,

    // 空行最多不能超过一行
    "no-multiple-empty-lines": [2, {
      max: 1
    }],

    // 禁止使用数组构造器
    "no-array-constructor": 2,
    "linebreak-style": ["off", "windows"],
    "no-var": 0,
    quotes: ["error", "double", { allowTemplateLiterals: true }],
    // "no-unused-vars": 0,
    // "no-undef": 0,
    // "vars-on-top": 0,
    // "no-mixed-operators":0
  }
};
