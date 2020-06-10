import {
  mapActions,
  mapGetters
} from "vuex";
import SetFloorInfo from "./setFloorInfo.vue";
import "../../assets/map/libs/ol.js"
import MapEditor from "../../assets/map/js/main";
import TestData from "../../assets/map/data/data";

export default {
  name: "ChartShowControl",
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: {
    SetFloorInfo
  },
  data() {
    return {

      // 数据图表数据
      dataChartData: [{
        id: 22
      }],

      // 数据图表列值
      dataChartColumn: [{
          title: "选择",
          type: "selection",
          width: 80
        },
        {
          title: "序号",
          key: "id"
        },
        {
          title: "FID",
          key: "id"
        },
        {
          title: "类型ID",
          key: "id"
        },
        {
          title: "高度",
          key: "id"
        },
        {
          title: "名称",
          key: "id"
        }
      ],

      // 数据图表信息弹窗
      dataChartInfoModal: false,

      // 元素样式列数据
      elementStyleColumn: [{
          title: "选择",
          type: "selection",
          width: 80
        },
        {
          title: "样式名称",
          key: "name"
        },
        {
          title: "类型ID",
          key: "typeId"
        },
        {
          title: "填充颜色",
          slot: "color"
        }
      ],

      // 元素样式数据
      elementStyleData: [{
          name: "样式1",
          typeId: 555,
          color: "red"
        },
        {
          name: "样式1",
          typeId: 555,
          color: "yellow"
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

      // 元素高度
      elementHeight: 0,

      // 标注高度
      markHeight: 0,

      // 元素样式
      elementStyle: "",

      // 右侧地图高度
      height: "",

      // 楼宇信息
      buildObj: {},

      //加载的楼层信息
      buildingFloorsObj: {},

      //楼层信息数组
      floorArr: [],

      //被选中的楼层
      activeFloor: "",

      //选中楼层的数据
      activeFloorData: {},

      //地图编辑器
      mapEditor: "",

      //选中的元素
      selectedElement: {
        "layername": "",
        "id": "",
        "value": {
          "id": "",
          "name": "",
          "height": 0,
          "styleID": "",
          "width": 5,
          "color": ""
        }
      },
      //当前选中的要绘制的要素
      drawActiveType: "",
      //绘制完元素后获得的元素信息
      targetDrawedElement: "",
      //路径-绘制元素-楼梯类型
      drawActiveLine: "",
      //是否有底图
      hasUnderPainting: true,
      //被选中的poi图层
      facilityTypeTarget: {
        "layername": "",
        "id": "",
        "value": {
          id: "",
          img: "",
          size: 0
        }
      }
    };
  },
  mounted() {
    var that = this;
    that.height = `${window.innerHeight - 80}px`;
    window.onresize = () => {
      that.height = `${window.innerHeight - 80}px`;
    };
    that.buildObj = that.utils.localstorageGet("buildObj");
    that.getFloorOutlineByBuildingId();
    that.loadFloor();
    that.getFloorInfoById(78);
    that.getIcons();
    that.getElementStyles();
    that.getLabelStyles();
    //初始化地图
    that.$nextTick(() => {
      that.initMap();
    });
  },
  watch: {
    activeFloorData(val) {
      var that = this;
      //是否有轮廓信息
      let hasOutline = false;
      if (!!val.geometry && !!val.geometry["coordinates"]) {
        if (val.geometry["coordinates"].length > 0) {
          hasOutline = true;
        } else {
          hasOutline = false;
        }

      } else {
        hasOutline = false;
      }
      //是否有对角线
      let hasRectLatLon = false;
      if (val.imageData.extent) {
        if (val.imageData.extent.length > 0) {
          hasRectLatLon = true;
        } else {
          hasRectLatLon = false;
        }
      } else {
        hasRectLatLon = false;
      }

      //是否有底图
      if (!val.imageData.data && !val.imageData.id) {
        that.hasUnderPainting = false;
        that.$message({
          message: "无法进行任何绘制操作",
          type: "warning"
        });
        return;
      } else {
        that.hasUnderPainting = true;
      }
      //处理图片
      if (!val.imageData.data && val.imageData.id) {
        val.imageData.data = "/files/img/" + val.imageData.id;
      }


      //（1）如果有对角线信息，则提示“楼层信息设置成功”，页面自动加载底图。
      if (hasRectLatLon) {
        that.$message({
          message: "楼层信息设置成功",
          type: "success"
        });
        that.mapEditor.setData(val);
        return
      }

      //（2）如果没对角线信息，有轮廓信息，则提示“请点击调整底图按钮，根据轮廓进行缩放平移”，
      if (hasOutline) {
        that.$message({
          message: "请点击调整底图按钮，根据轮廓进行缩放平移",
          type: "info"
        });
        that.mapEditor.setData(val);
        return
      }

      //（3）如果没对角线信息，没轮廓信息，则提示“当前楼层不具备经纬度信息，将不能发布”
      if (!hasOutline && !hasRectLatLon) {
        that.$message({
          message: "当前楼层不具备经纬度信息，将不能发布",
          type: "warning"
        });
        return
      }
    }
  },
  methods: {
    //路径-绘制元素-直梯
    verticalFloorClick() {
      var that = this;
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.drawPoint({
        img: "./icon/verticalFloor.png",
        size: 50,
      });
      that.drawActiveLine = 1;
    },
    //路径-绘制元素-扶梯
    holdFloorClick() {
      var that = this;
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.drawPoint({
        img: "./icon/holdFloor.png",
        size: 50,
      });
      that.drawActiveLine = 2;
    },
    //路径-绘制元素-楼梯
    commonFloorClick() {
      var that = this;
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.drawPoint({
        img: "./icon/floor.png",
        size: 50,
      });
      that.drawActiveLine = 3;
    },
    //初始化地图
    initMap() {
      var that = this;
      //实例化地图
      that.mapEditor = new MapEditor({
        container: "mapInDoor",
        data: TestData.floors[1],
      });

      ///选择要素回调事件
      that.mapEditor.selectFeature(e => {
        that.selectedElement = e;
        if ("POI图层" === e.layername) {
          that.facilityTypeTarget = e;
        }
        if ("多边形图层" === e.layername) {
          that.selectedElement = e;
        }
      })
      //绘制要素回调事件
      that.mapEditor.drawFeature(e => {
        that.targetDrawedElement = e;
        //绘制多边形的时候
        if (that.drawActiveType === 3) {
          that.selectedElement = e;
        }
        if ("POI图层" === e.layername) {
          that.facilityTypeTarget = e;
        }
      })

    },
    //地图放大
    mapBiggerClick() {
      var that = this;
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.zoomOut();
    },
    //地图缩小
    mapLittleClick() {
      var that = this;
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.zoomIn();
    },

    //绘制点元素
    drawPoint() {
      var that = this;
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.drawPoint();
    },
    //绘制线元素
    drawLine() {
      var that = this;
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.drawPath({
        width: 5,
        color: 'blue',
      });
    },
    //绘制矩形
    drawRect() {
      var that = this;
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.drawBox();
      that.drawActiveType = 1;
    },

    //设置面元素的样式
    setPolygonStyle(id) {
      var that = this;
      that.mapEditor.setPolygonStyle(id, {
        name: "polygon1",
        width: 5,
        fillColor: 'black',
        borderColor: 'rgba(0,0,0,1)',
        fontSize: 12,
        fontFillColor: 'rgba(255,255,255,1)',
        fontBorderColor: 'rgba(0,0,0,1)'
      });
    },

    //绘制面元素
    drawpolygon() {
      var that = this;
      // that.setPolygonStyle("1_polygon");
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.drawPolygon();
      that.selectedElement.id = "";
      that.drawActiveType = 3;
    },
    //绘制圆
    drawcircle() {
      var that = this;
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.drawCircle();
      that.drawActiveType = 2;
    },
    //取消绘制
    canceldraw() {
      var that = this;
      if (!that.hasUnderPainting) {
        return
      }
      that.mapEditor.cancelDraw();
      that.drawActiveType = "";
    },
    // 设置楼层信息
    setFloorInfoClick() {
      var that = this;
      that.setFloorInfoModal = true;
      that.$nextTick(() => {
        that.$refs.setFloorInfo.init({
          id: that.activeFloorData.floorData.properties.id
        });
      });
    },

    // 保存楼层信息成功
    setFloorInfoSuccess() {

      this.loadFloor();
      this.setFloorInfoModal = false
    },

    // 获得所有的标注样式
    getLabelStyles() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getLabelStyles,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 获取所有元素样式
    getElementStyles() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getElementStyles,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 获取所有图标
    getIcons() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getIcons,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    //监听楼层变动
    floorChange(e) {
      var that = this;
      that.activeFloorData = that.buildingFloorsObj.floors[e];
    },

    // 加载楼层信息
    loadFloor() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.loadFloor + that.buildObj.id,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            that.buildingFloorsObj = data.data;
            that.floorArr = [];
            Object.keys(that.buildingFloorsObj.floors).forEach((key) => {
              let floorKey = +key;
              let strKey = "";
              if (floorKey > 0) {
                strKey = "F" + floorKey;
              } else {
                strKey = "B" + -floorKey;
              }
              that.floorArr.push({
                label: strKey,
                value: key
              });
            });

            if (!that.activeFloor) {
              if (that.buildingFloorsObj.floors["1"]) {
                that.activeFloor = "1";
                that.activeFloorData = that.buildingFloorsObj.floors[that.activeFloor];
              } else {
                that.activeFloor = "-1";
                that.activeFloorData = that.buildingFloorsObj.floors[that.activeFloor];
              }
            } else {
              that.activeFloorData = that.buildingFloorsObj.floors[that.activeFloor];
            }
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 设置楼层完成
    floorFinishById(id) {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.floorFinishById + id,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 根据楼层id获取楼层信息
    getFloorInfoById(id) {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getFloorInfoById + id,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 根据楼宇id获取整个楼层的信息
    getFloorOutlineByBuildingId() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getFloorOutlineByBuildingId + that.buildObj.id,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    }
  }
};
