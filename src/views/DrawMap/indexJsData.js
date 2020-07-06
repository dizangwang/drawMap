export default {
  // 选中的要素是不是图标
  isPoiSelected: false,
  // 查询样式列表关键字
  searchStyleWord: "",
  // 列表中被选中的样式
  styleTableSelectedArr: [],
  // 图标预览
  iconPreview: "",
  // 所有图标
  allIconModal: false,
  // 编辑样式弹窗
  editStyleModal: false,
  // 创建样式弹窗
  createStyleModal: false,
  // 数据图表数据
  dataChartData: [],
  // 数据图表POI数据
  dataChartPOIData: [],
  // 图层的类型
  layerType: "1",
  // 数据图表POI列值
  dataChartPOIColumn: [{
    title: "选择",
    type: "selection",
    width: 80
  },
  {
    title: "序号",
    type: "index",
    width: 80
  },
  {
    title: "FID",
    key: "id"
  },

  {
    title: "高度",
    key: "height",
    width: 80
  },
  {
    title: "图标",
    slot: "img",
    width: 80
  }
  // },
  // {
  //   title: "名称",
  //   key: "name"
  // }
  ],
  // poi搜索
  dataChartDataPoiSearch: "",
  // 数据图表列值
  dataChartColumn: [{
    title: "选择",
    type: "selection",
    width: 80
  },
  {
    title: "序号",
    type: "index",
    width: 80
  },
  {
    title: "FID",
    key: "id"
  },

  {
    title: "名称",
    key: "name",
    width: 140
  }
  ],
  // 数据图表信息弹窗
  dataChartInfoModal: false,
  // 要素样式列数据
  elementStyleColumn: [{
    title: "选择",
    type: "selection",
    width: 80
  },
  {
    title: "样式名称",
    key: "name"
  },
  // {
  //   title: "边框宽度",
  //   key: "borderWidth"
  // },
  // {
  //   title: "边框颜色",
  //   slot: "borderColor"
  // },
  {
    title: "填充颜色",
    slot: "color"
  }
  ],
  // 编辑主题样式展示
  editElementStyleModal: false,
  // 楼层
  floor: "",
  // 表单字段
  formValidate: {
    taskId: "",
    buildingName: "",
    overGroundFloor: "",
    underGroundFloor: "",
    lineData: ""
  },
  // 校验规则
  ruleValidate: {
    buildingName: [{
      required: true,
      message: "请填写楼宇名称",
      trigger: "blur"
    }]
  },
  // 设置楼层信息
  setFloorInfoModal: false,
  // 左侧-顶部-tab栏
  tabNum: 1,
  // 要素高度
  elementHeight: 0,
  // 标注高度
  markHeight: 0,
  // 要素样式
  elementStyle: "",
  // 右侧地图高度
  height: "",
  // 楼宇信息
  buildObj: {},
  // 加载的楼层信息
  buildingFloorsObj: {},
  // 楼层信息数组
  floorArr: [],
  // 被选中的楼层
  activeFloor: "",
  // 选中楼层的数据
  activeFloorData: {},
  // 地图编辑器
  mapEditor: "",
  // 选中的要素
  selectedElement: {
    layername: "",
    id: "",
    value: {
      id: "0",
      typeID: "",
      name: "0",
      height: 0,
      styleID: "",
      width: 5,
      fillColor: ""
    }
  },
  // 当前选中的要绘制的要素
  drawActiveType: "",
  // 绘制完要素后获得的要素信息
  targetDrawedElement: "",
  // 路径-绘制要素-楼梯类型
  drawActiveLine: "",
  // 是否有底图
  hasUnderPainting: true,
  // 被选中的poi图层
  facilityTypeTarget: {
    layername: "",
    id: "",
    value: {
      id: "",
      img: "",
      size: 0
    }
  },
  // 样式绘制前选择的样式id
  preDrawStyle: "",
  // 要素样式列表数据
  elementStyleListCopy: [],
  // 要素样式列表
  elementStyleList: [{
    id: "1",
    name: "red",
    height: 2,
    width: 5,
    fillColor: "#CD5C5C",
    borderColor: "#F4A460",
    fontSize: "16px",
    fontFillColor: "#7FFF00",
    fontBorderColor: "#48D1CC"
  },
  {
    id: "2",
    name: "blue",
    height: 2,
    width: 5,
    fillColor: "#CD5C5C",
    borderColor: "#FF00FF",
    fontSize: "16px",
    fontFillColor: "#FF00FF",
    fontBorderColor: "#6495ED"
  }
  ],
  // 需要到达的楼层
  facilityToFloor: "",
  // 分组名称
  facilityGroup: "",
  // 选择要到达的楼层
  goFloorNumModal: false,
  // 选择要到达的楼层title
  floorNumTitle: "",
  // 选择的要到达的楼层
  goFloorArr: [],
  // 全选楼梯
  goFloorNumCheckAll: false,
  // 是否绘制楼梯
  isDrawfacibility: false,
  // 是否绘制路径
  isDrawLine: false,
  // 图标列表
  allIconsArr: [],
  // 图标名称
  iconName: "",
  // 被选中的图标
  iconActiveNum: "",
  // 选中的是否是路径图层
  isLineLayerSeleced: false,
  // 楼层完成状态
  floorFinishStatus: "完成",
  // 数据图表勾选的id
  dataChartSelectedIds: [],
  // 数据图表搜索
  dataChartDataSearch: "",
  // 从参数中获取的楼宇id
  buildingId: "",
  // 调整平面图
  adjustImageWord: "调整平面图",
  // 完成状态
  finishStatus: "",
  // 缓存楼层变动
  activeFloorArrCache: [],
  // map加载时loading
  mapLoading: false
};
