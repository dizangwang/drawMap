import {
  mapActions,
  mapGetters
} from "vuex";
import SetFloorInfo from "./setFloorInfo.vue";
import CreateStyle from "./createStyle.vue";
import EditStyle from "./editStyle.vue";
import MapEditor from "../../assets/map/js/main";
import TestData from "../../assets/map/data/data";

export default {
  name: "ChartShowControl",
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: {
    SetFloorInfo,
    CreateStyle,
    EditStyle
  },
  data() {
    return {

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
        title: "边框宽度",
        key: "borderWidth"
      },
      {
        title: "边框颜色",
        slot: "borderColor"
      },
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

      // 选中的元素
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
      // 绘制完元素后获得的元素信息
      targetDrawedElement: "",
      // 路径-绘制元素-楼梯类型
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
      // 元素样式列表
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
      iconActiveNum: ""
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
    // 初始化地图
    that.$nextTick(() => {
      that.initMap();
    });
  },
  watch: {
    preDrawStyle() {
      var that = this;
      switch (that.drawActiveType) {
        case 1:
          that.drawRect();
          break;
        case 2:
          that.drawcircle();
          break;
        case 3:
          that.drawpolygon();
          break;
        default:
      }
    },
    goFloorArr(flrArr) {
      var that = this;
      const arr = [];
      that.floorArr.forEach((item) => {
        if (flrArr.includes(item.value)) {
          arr.push(item.label);
        }
      });

      that.facilityToFloor = arr.join(",");
    },
    tabNum(num) {
      var that = this;
      if (num !== 2) {
        that.isDrawfacibility = false;
        that.isDrawLine = false;
      }
      if (num !== 1) {
        that.iconActiveNum = "";
      }
      that.mapEditor.cancelDraw();
    },
    activeFloorData(result) {
      var that = this;

      // 是否有轮廓信息
      const val = result;
      const hasOutline = false;

      // if (!!val.geometry && !!val.geometry.coordinates) {
      //   if (val.geometry.coordinates.length > 0) {
      //     hasOutline = true;
      //   } else {
      //     hasOutline = false;
      //   }
      // } else {
      //   hasOutline = false;
      // }
      // 是否有对角线
      // let hasRectLatLon = false;
      // if (val.imageData.extent) {
      //   if (val.imageData.extent.length > 0) {
      //     hasRectLatLon = true;
      //   } else {
      //     hasRectLatLon = false;
      //   }
      // } else {
      //   hasRectLatLon = false;
      // }

      // 是否有底图
      // if (!val.imageData.data && !val.imageData.id) {
      //   that.hasUnderPainting = false;
      //   that.$message({
      //     message: "无法进行任何绘制操作",
      //     type: "warning"
      //   });
      //   return;
      // }
      // that.hasUnderPainting = true;

      // 处理图片
      // if (!val.imageData.data && val.imageData.id) {
      //   const {
      //     id
      //   } = val.imageData;
      //   val.imageData.data = `/files/img/${id}`;
      // }

      // （1）如果有对角线信息，则提示“楼层信息设置成功”，页面自动加载底图。
      // if (hasRectLatLon) {
      //   that.$message({
      //     message: "楼层信息设置成功",
      //     type: "success"
      //   });
      //   //  that.mapEditor.setData(val);
      //   return;
      // }

      // （2）如果没对角线信息，有轮廓信息，则提示“请点击调整底图按钮，根据轮廓进行缩放平移”，
      // if (hasOutline) {
      //   that.$message({
      //     message: "请点击调整底图按钮，根据轮廓进行缩放平移",
      //     type: "info"
      //   });
      //   // that.mapEditor.setData(val);
      //   return;
      // }

      // （3）如果没对角线信息，没轮廓信息，则提示“当前楼层不具备经纬度信息，将不能发布”
      // if (!hasOutline && !hasRectLatLon) {
      //   that.$message({
      //     message: "当前楼层不具备经纬度信息，将不能发布",
      //     type: "warning"
      //   });
      // }
    }
  },
  methods: {
    // 创建样式成功调用方法
    createStyleSuccess() {
      this.createStyleModal = false;
      this.editStyleModal = false;
      this.getElementStyles();
    },
    // 样式勾选变动监听
    styleTableSelectChange(styles) {
      this.styleTableSelectedArr = styles;
    },
    // 删除选中的样式
    deleteStyleClick() {
      var that = this;
      if (that.styleTableSelectedArr.length === 0) {
        that.$message({
          message: "请选择要删除的样式",
          type: "warning"
        });
      } else {
        that
          .$confirm("是否删除选中的样式?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            const ids = [];
            that.styleTableSelectedArr.forEach((item) => {
              ids.push(item.id);
            });

            that
              .ajax({
                method: "post",
                url: that.apis.elementStyleMgrDelete,
                data: {
                  id: ids.join(",")
                }
              })
              .then((res) => {
                const {
                  data
                } = res;
                if (data.code === 200) {
                  that.$message({
                    message: "删除成功",
                    type: "success"
                  });
                  that.getElementStyles();
                } else {
                  that.$message({
                    message: data.msg,
                    type: "warning"
                  });
                }
              });
          });
      }
    },
    // 所有图标中-图标的点击事件
    iconItemClick(item) {
      var that = this;
      that.mapEditor.drawPoint({
        img: item.imgPath,
        size: 50
      });
      that.allIconModal = false;
    },
    // 所有图标中-图标的鼠标移出事件
    iconItemMouseOut() {
      this.iconPreview = "";
    },
    // 所有图标中-图标的鼠标经过事件
    iconItemHover(icon) {
      this.iconPreview = icon;
    },
    // 增加图标
    addIconClick() {
      var that = this;
      that.allIconModal = true;
      this.iconPreview = "";
    },
    // 图标管理
    commonIconClick(item, index) {
      var that = this;
      that.iconName = item.name;
      that.iconActiveNum = index + 1;
      that.drawActiveType = "";
      that.mapEditor.drawPoint({
        img: item.imgPath,
        size: 50
      });
    },
    // 全选楼梯变动监听
    goFloorNumAllChange(isAll) {
      var that = this;
      if (isAll) {
        that.floorArr.forEach((item) => {
          that.goFloorArr.push(item.value);
        });
      } else {
        that.goFloorArr = [];
      }
    },
    // 点击主题
    themeClick() {
      var that = this;
      that.editElementStyleModal = true;
    },
    // 编辑样式
    editStyleClick() {
      var that = this;
      if (that.styleTableSelectedArr.length === 0) {
        that.$message({
          message: "请选择要编辑的样式",
          type: "warning"
        });
        return;
      }
      if (that.styleTableSelectedArr.length > 1) {
        that.$message({
          message: "只能选择一个要编辑的样式",
          type: "warning"
        });
        return;
      }
      that.editStyleModal = true;
      that.$nextTick(() => {
        that.$refs.editStyle.init(that.styleTableSelectedArr[0]);
      });
    },
    // 新建样式
    createStyleClick() {
      var that = this;
      that.createStyleModal = true;
      that.$nextTick(() => {
        that.$refs.createStyle.init();
      });
    },
    // 监听样式选择器变动
    styleSelectChange(styleIndex) {
      var that = this;
      var style = that.elementStyleList[styleIndex];
      if (that.selectedElement.layername === "多边形图层") {
        that.mapEditor.setPolygonStyle(that.selectedElement.id, {
          name: that.selectedElement.value.name,
          width: that.selectedElement.value.width,
          fillColor: style.fillColor,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth,
          fontSize: that.selectedElement.value.fontSize,
          fontFillColor: that.selectedElement.value.fontFillColor,
          fontBorderColor: that.selectedElement.value.fontBorderColor
        });
      }
      if (that.selectedElement.layername === "建筑物图层") {
        that.mapEditor.setBuildStyle(that.selectedElement.id, {
          name: that.selectedElement.value.name,
          width: style.borderWidth,
          fillColor: style.fillColor,
          borderColor: style.borderColor
        });
      }
      if (that.selectedElement.layername === "路径图层") {
        that.mapEditor.setPathStyle(that.selectedElement.id, {
          width: style.borderWidth,
          color: style.borderColor,
          name: that.selectedElement.value.name
        });
      }
    },
    // 监听元素color变动
    drawSelectedColorChange(color) {
      var that = this;
      if (that.selectedElement.layername === "多边形图层") {
        that.mapEditor.setPolygonStyle(that.selectedElement.id, {
          name: that.selectedElement.value.name,
          width: that.selectedElement.value.width,
          fillColor: color,
          borderColor: that.selectedElement.value.borderColor,
          fontSize: 12,
          fontFillColor: that.selectedElement.value.fontFillColor,
          fontBorderColor: that.selectedElement.value.fontBorderColor
        });
      }
      if (that.selectedElement.layername === "建筑物图层") {
        that.mapEditor.setBuildStyle(that.selectedElement.id, {
          name: that.selectedElement.value.name,
          width: that.selectedElement.value.width,
          fillColor: color,
          borderColor: that.selectedElement.value.borderColor
        });
      }
      if (that.selectedElement.layername === "路径图层") {
        that.mapEditor.setPathStyle(that.selectedElement.id, {
          width: that.selectedElement.value.width,
          color,
          name: that.selectedElement.value.name
        });
      }
    },
    // 监听元素name变动
    drawSelectedNameInput(name) {
      var that = this;
      if (that.selectedElement.layername === "多边形图层") {
        that.mapEditor.setPolygonStyle(that.selectedElement.id, {
          name,
          width: that.selectedElement.value.width,
          fillColor: that.selectedElement.value.fillColor,
          borderColor: that.selectedElement.value.borderColor,
          fontSize: 12,
          fontFillColor: that.selectedElement.value.fontFillColor,
          fontBorderColor: that.selectedElement.value.fontBorderColor
        });
      }
      if (that.selectedElement.layername === "建筑物图层") {
        that.mapEditor.setBuildStyle(that.selectedElement.id, {
          name,
          width: that.selectedElement.value.width,
          fillColor: that.selectedElement.value.fillColor,
          borderColor: that.selectedElement.value.borderColor
        });
      }
      if (that.selectedElement.layername === "路径图层") {
        that.mapEditor.setPathStyle(that.selectedElement.id, {
          width: that.selectedElement.value.width,
          color: that.selectedElement.value.color,
          name
        });
      }
      if (that.selectedElement.layername === "POI图层") {
        that.mapEditor.setPointStyle(that.selectedElement.id, {
          img: that.selectedElement.value.img,
          size: that.selectedElement.value.size,
          name
        });
      }
    },
    // 获取数据
    getAllData() {
      // var that = this;
      // console.log("build", JSON.stringify(that.mapEditor.getData("build"), null, 4));
      // console.log("point", JSON.stringify(that.mapEditor.getData("point"), null, 4));
      // console.log("path", JSON.stringify(that.mapEditor.getData("path"), null, 4));
      // console.log("polygon", JSON.stringify(that.mapEditor.getData("polygon"), null, 4));
      // console.log("all", JSON.stringify(that.mapEditor.getData("all"), null, 4));
    },

    // 路径-绘制元素-直梯
    verticalFloorClick() {
      var that = this;
      if (!that.hasUnderPainting) {
        return;
      }
      that.mapEditor.drawPoint({
        img: "./icon/verticalFloor.png",
        size: 50
      });
      that.isDrawfacibility = true;
      that.floorNumTitle = "通行设施设置-直梯";
      that.drawActiveLine = 1;
      that.isDrawLine = false;
    },
    // 路径-绘制元素-扶梯
    holdFloorClick() {
      var that = this;
      if (!that.hasUnderPainting) {
        return;
      }
      that.isDrawfacibility = true;
      that.mapEditor.drawPoint({
        img: "./icon/holdFloor.png",
        size: 50
      });
      that.floorNumTitle = "通行设施设置-扶梯";
      that.drawActiveLine = 2;
      that.isDrawLine = false;
    },
    // 路径-绘制元素-楼梯
    commonFloorClick() {
      var that = this;
      if (!that.hasUnderPainting) {
        return;
      }
      that.floorNumTitle = "通行设施设置-楼梯";
      that.isDrawfacibility = true;
      that.mapEditor.drawPoint({
        img: "./icon/floor.png",
        size: 50
      });
      that.drawActiveLine = 3;
      that.isDrawLine = false;
    },
    // 初始化地图
    initMap() {
      var that = this;
      // 实例化地图
      that.mapEditor = new MapEditor({
        container: "mapInDoor",
        data: TestData.floors[1]
      });

      // /选择要素回调事件
      that.mapEditor.selectFeature((e) => {
        that.selectedElement = e;
        if (e.layername === "POI图层") {
          if (that.tabNum === 2) {
            if (/\/icon\//.test(e.value.img)) {
              that.facilityTypeTarget = e;
            }
          }
          that.selectedElement = e;
          that.selectedElement.value.fillColor = "#ffffff";
        }
        if (e.layername === "多边形图层") {
          that.selectedElement = e;
        }
        if (e.layername === "建筑物图层") {
          that.selectedElement = e;
        }
        if (e.layername === "路径图层") {
          that.selectedElement = e;
          that.selectedElement.value.fillColor = e.value.color;
        }
      });
      // 绘制要素回调事件
      that.mapEditor.drawFeature((e) => {
        that.targetDrawedElement = e;
        // 绘制多边形的时候
        if (that.drawActiveType === 3) {
          that.selectedElement = e;
        }
        if (e.layername === "POI图层") {
          if (that.tabNum === 2) {
            that.facilityTypeTarget = e;
          }

          if (that.isDrawfacibility) {
            that.goFloorNumModal = true;
            // 清空楼层选择
            that.goFloorArr = [];
            that.goFloorNumCheckAll = false;
          }
        } else {
          // setTimeout(()=>{
          //   that.canceldraw();
          // },500)

        }
      });
    },
    // 地图放大
    mapBiggerClick() {
      var that = this;
      if (!that.hasUnderPainting) {
        return;
      }
      that.mapEditor.zoomOut();
    },
    // 地图缩小
    mapLittleClick() {
      var that = this;
      if (!that.hasUnderPainting) {
        return;
      }
      that.mapEditor.zoomIn();
    },

    // 绘制点元素
    drawPoint() {
      var that = this;
      if (!that.hasUnderPainting) {
        return;
      }
      that.mapEditor.drawPoint();
    },
    // 绘制线元素
    drawLine() {
      var that = this;
      if (!that.hasUnderPainting) {
        return;
      }
      that.isDrawLine = true;
      that.drawActiveLine = "";
      that.mapEditor.drawPath({
        width: 5,
        color: "#0000FF"
      });
    },
    // 绘制矩形
    drawRect() {
      var that = this;
      if (!that.hasUnderPainting) {
        return;
      }
      that.drawActiveType = 1;
      that.iconActiveNum = "";
      var obj = {};
      var style = that.elementStyleList[that.preDrawStyle];
      if (style) {
        obj = {
          typeID: style.id,
          fillColor: style.fillColor,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth
        };
        that.mapEditor.drawBox(obj);
        return;
      }
      that.mapEditor.drawBox();
    },

    // 设置面元素的样式
    setPolygonStyle(id) {
      var that = this;
      that.mapEditor.setPolygonStyle(id, {
        name: "polygon1",
        width: 5,
        fillColor: "black",
        borderColor: "rgba(0,0,0,1)",
        fontSize: 12,
        fontFillColor: "rgba(255,255,255,1)",
        fontBorderColor: "rgba(0,0,0,1)"
      });
    },

    // 绘制面元素
    drawpolygon() {
      var that = this;
      // that.setPolygonStyle("1_polygon");
      if (!that.hasUnderPainting) {
        return;
      }
      that.iconActiveNum = "";
      that.selectedElement.id = "";
      that.drawActiveType = 3;
      var obj = {};
      var style = that.elementStyleList[that.preDrawStyle];
      if (style) {
        obj = {
          typeID: style.id,
          fillColor: style.fillColor,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth
        };
        that.mapEditor.drawPolygon(obj);
        return;
      }
      that.mapEditor.drawPolygon();
    },
    // 绘制圆
    drawcircle() {
      var that = this;
      if (!that.hasUnderPainting) {
        return;
      }
      that.iconActiveNum = "";
      that.drawActiveType = 2;
      var obj = {};
      var style = that.elementStyleList[that.preDrawStyle];
      if (style) {
        obj = {
          typeID: style.id,
          fillColor: style.fillColor,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth
        };
        that.mapEditor.drawCircle(obj);
        return;
      }
      that.mapEditor.drawCircle();
    },
    // 取消绘制
    canceldraw() {
      var that = this;
      if (!that.hasUnderPainting) {
        return;
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
      this.setFloorInfoModal = false;
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
            that.elementStyleList = data.data;
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
            that.allIconsArr = data.data;
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 监听楼层变动
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
              const floorKey = +key;
              let strKey = "";
              if (floorKey > 0) {
                strKey = `F${floorKey}`;
              } else {
                strKey = `B${-floorKey}`;
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
