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
        key: "size",
        width: 80
      },
      {
        title: "图标",
        slot: "img",
        width: 80
      }
      ],
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
      // 元素样式列表数据
      elementStyleListCopy: [],
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
      iconActiveNum: "",
      // 选中的是否是路径图层
      isLineLayerSeleced: false,
      // 楼层完成状态
      floorFinishStatus: "完成",
      // 数据图表勾选的id
      dataChartSelectedIds: [],
      // 数据图表搜索
      dataChartDataSearch: ""
    };
  },
  mounted() {
    var that = this;
    that.height = `${window.innerHeight - 80}px`;
    window.onresize = () => {
      that.height = `${window.innerHeight - 80}px`;
    };
    that.buildObj = that.utils.localstorageGet("buildObj");

    that.getIcons();
    that.getElementStyles();
    that.getLabelStyles();
    // 初始化地图
    that.$nextTick(() => {
      that.initMap(TestData.floors[1]);
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
    layerType() {
      this.dataChartSelectedIds = [];
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
      if (!result) {
        return;
      }
      that.floorFinishStatus = "未完成";
      const val = JSON.parse(JSON.stringify(result));

      if (!val.imageData.extent) {
        val.imageData.extent = [];
      } else if (typeof val.imageData.extent === "string") {
        val.imageData.extent = JSON.parse(val.imageData.extent);
      }

      if (!val.floorData.geometry) {
        delete val.floorData.geometry;
      }
      document.querySelector("#mapInDoor").innerHTML = "";
      that.newMap(val);

      // 是否有底图经纬度
      if (!val.imageData.data && !val.imageData.id) {
        that.hasUnderPainting = false;
        that.$message({
          message: "没有底图无法进行任何绘制操作",
          type: "warning"
        });
        return;
      }
      that.hasUnderPainting = true;

      // 处理图片
      if (!val.imageData.data && val.imageData.id) {
        const {
          id
        } = val.imageData;
        val.imageData.data = `/files/img/${id}`;
      }
      // 如果没有经纬度
      if (val.imageData.extent.length === 0 || !val.floorData.geometry) {
        that.$message({
          message: "没有经纬度无法定位底图",
          type: "warning"
        });
        return;
      }

      let i = 0;
      Object.keys(val.layerData).forEach((key) => {
        if (val.layerData[key].features.length > 0) {
          i += 1;
        }
      });
      if (i > 0) {
        that.floorFinishStatus = "完成";
      }
    }
  },
  methods: {
    // 对比geo数据判断数据是否保存 true:数据一致  false:数据有差异
    compareData(data1, data2) {
      var keys = Object.keys(data1);
      var i = 0;
      try {
        keys.forEach((key) => {
          if (key === "imageData") {
            Object.keys(data1[key]).forEach((imgKey) => {
              if (JSON.stringify(data1[key].data) !== JSON.stringify(data2[key].data)) {
                i += 1;
              }
              if (typeof data1[key].extent === "string") {
                if (data1[key].extent !== JSON.stringify(data2[key].extent)) {
                  i += 1;
                }
              }
              if (typeof data1[key].extent === "object") {
                if (data2[key].extent !== JSON.stringify(data1[key].extent)) {
                  i += 1;
                }
              }
            });
          }
          if (key === "floorData") {
            if (data1[key].geometry) {
              if (JSON.stringify(data1[key].geometry.coordinates) !== JSON.stringify(
                data2[
                  key].geometry.coordinates
              )) {
                i += 1;
              }
            }

            Object.keys(data1[key].properties).forEach((pro) => {
              if (data1[key].properties[pro] !== data2[key].properties[pro]) {
                i += 1;
              }
            });
          }
          if (key === "layerData") {
            Object.keys(data1[key]).forEach((layer) => {
              data1[key][layer].features.forEach((feature, index) => {
                if (data1[key][layer].features
                  [index].geometry.coordinates) {
                  const geometry1 = JSON.stringify(data1[key][layer].features
                    [index].geometry.coordinates);
                  const geometry2 = JSON.stringify(data2[key][layer].features
                    [index].geometry.coordinates);
                  if (geometry1 !== geometry2) {
                    i += 1;
                  }
                }
                const properties1 = data1[key][layer].features
                  [index].properties;
                Object.keys(properties1).forEach((property) => {
                  if (data1[key][layer].features[index].properties[property] !== data2[key][
                    layer
                  ].features[index].properties[property]) {
                    i += 1;
                  }
                });
              });
            });
          }
        });
      } catch (e) {
        return false;
      }
      return i === 0;
    },

    // 删除选中的图层
    deleteSelectedElement() {
      var that = this;
      if (that.dataChartSelectedIds.length === 0) {
        that.$message({
          message: "请先勾选数据",
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
            that.dataChartSelectedIds.forEach((item) => {
              if (that.layerType === "1") {
                that.mapEditor.deleteFeatureById("polygon", item.id);
              }
              if (that.layerType === "2") {
                that.mapEditor.deleteFeatureById("point", item.id);
              }
            });
            that.dataChartData = that.mapEditor.getData("polygon");
            that.dataChartPOIData = that.mapEditor.getData("point");
          });
      }
    },
    // 搜索数据图表信息面元素
    dataChartDataFilter(pName) {
      const data = that.mapEditor.getData("polygon");
      const arr = [];
      data.forEach((item) => {
        if (item.name.indexOf(pName) > -1) {
          arr.push(item);
        }
      });
      that.dataChartData = arr;
    },
    // 数据图表信息勾选监听
    dataChartInfoChange(ids) {
      this.dataChartSelectedIds = ids;
    },
    // 发布楼层
    floorMgrPublish() {
      var that = this;
      const layerData = that.mapEditor.getSaveData();
      // 点击发布，判断地图是否已保存且状态为完成
      if (that.compareData(that.activeFloorData, layerData) && that.compareData(layerData, that
        .activeFloorData) && that.floorFinishStatus === "完成") {
        that
          .ajax({
            method: "post",
            url: that.apis.floorMgrPublish,
            data: {
              id: that.activeFloorData.floorData.properties.id
            }
          })
          .then((res) => {
            const {
              data
            } = res;
            if (data.code === 200) {
              that.$message({
                message: "发布成功",
                type: "success"
              });
            } else {
              that.$message({
                message: data.msg,
                type: "warning"
              });
            }
          });
        return;
      }

      if (!that.compareData(that.activeFloorData, layerData) || !that.compareData(layerData, that
        .activeFloorData)) {
        that
          .$confirm("是否保存并切换状态为完成后发布？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          });
        return;
      }
      if (that.floorFinishStatus !== "完成") {
        that
          .$confirm("是否切换状态为完成后发布？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          });
      }
    },
    // 设置楼层完成
    floorFinishById() {
      var that = this;
      if (that.floorFinishStatus === "未完成") {
        return;
      }
      that
        .ajax({
          method: "post",
          url: that.apis.floorFinishById + that.activeFloorData.floorData.properties.id,
          data: {}
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            that.$message({
              message: "保存成功",
              type: "success"
            });
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 保存数据
    saveData() {
      var that = this;
      const layerData = that.mapEditor.getSaveData();
      var obj = {};
      obj.id = that.buildingFloorsObj.id;
      obj.name = that.buildingFloorsObj.name;
      obj.floorsCounts = that.buildingFloorsObj.floorsCounts;
      obj.floors = {};
      obj.floors[that.activeFloorData.floorData.properties.floors] = layerData;
      that
        .ajax({
          method: "post",
          url: that.apis.saveFloor,
          data: {
            data: JSON.stringify(obj)
          }
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            that.$message({
              message: "操作成功",
              type: "success"
            });

            that.loadFloor();
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 监听样式搜索框变动-筛选样式列表
    searchStyleWordChange(styleWord) {
      var that = this;
      var data = JSON.parse(JSON.stringify(that.elementStyleList));
      const arr = [];
      data.forEach((item) => {
        if (item.name.indexOf(styleWord) > -1) {
          arr.push(item);
        }
      });
      that.elementStyleListCopy = arr;
    },
    // poi图标size大小变动
    poiSizeChange(size) {
      var that = this;
      that.mapEditor.setPointStyle(that.selectedElement.id, {
        img: that.selectedElement.value.img,
        size
      });
    },
    // 点击选择元素
    selectElementClick() {
      this.mapEditor.cancelDraw();
    },
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
        size: 30
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
      if (that.iconActiveNum === (index + 1)) {
        that.iconName = "";
        that.iconActiveNum = "";
        that.drawActiveType = "";
        that.mapEditor.cancelDraw();
        return;
      }
      that.iconName = item.name;
      that.iconActiveNum = index + 1;
      that.drawActiveType = "";
      that.mapEditor.drawPoint({
        img: item.imgPath,
        size: 30
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
      if (styleIndex === "") {
        return;
      }
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
        that.selectedElement.value.fillColor = style.fillColor;
        that.selectedElement.value.borderColor = style.borderColor;
        that.selectedElement.value.borderWidth = style.borderWidth;
      }
      if (that.selectedElement.layername === "建筑物图层") {
        that.mapEditor.setBuildStyle(that.selectedElement.id, {
          name: that.selectedElement.value.name,
          width: style.borderWidth,
          fillColor: style.fillColor,
          borderColor: style.borderColor
        });
        that.selectedElement.value.width = style.borderWidth;
        that.selectedElement.value.fillColor = style.fillColor;
        that.selectedElement.value.borderColor = style.borderColor;
      }
      if (that.selectedElement.layername === "路径图层") {
        that.mapEditor.setPathStyle(that.selectedElement.id, {
          width: style.borderWidth,
          color: style.borderColor,
          name: that.selectedElement.value.name
        });
        that.selectedElement.value.width = style.borderWidth;
        that.selectedElement.value.color = style.borderColor;
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
        that.selectedElement.value.fillColor = color;
      }

      if (that.selectedElement.layername === "建筑物图层") {
        that.mapEditor.setBuildStyle(that.selectedElement.id, {
          name: that.selectedElement.value.name,
          width: that.selectedElement.value.width,
          fillColor: color,
          borderColor: that.selectedElement.value.borderColor
        });
        that.selectedElement.value.fillColor = color;
      }
      if (that.selectedElement.layername === "路径图层") {
        that.mapEditor.setPathStyle(that.selectedElement.id, {
          width: that.selectedElement.value.width,
          color,
          name: that.selectedElement.value.name
        });
        that.selectedElement.value.color = color;
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
      var that = this;
      that.dataChartInfoModal = true;
      that.dataChartData = that.mapEditor.getData("polygon");
      that.dataChartPOIData = that.mapEditor.getData("point");
    },

    // 路径-绘制元素-直梯
    verticalFloorClick() {
      var that = this;
      if (that.drawActiveLine === 1) {
        that.drawActiveLine = "";
        that.isDrawLine = false;
        that.mapEditor.cancelDraw();
        return;
      }
      that.mapEditor.drawPoint({
        img: "./icon/verticalFloor.png",
        size: 30
      });
      that.isDrawfacibility = true;
      that.floorNumTitle = "通行设施设置-直梯";
      that.drawActiveLine = 1;
      that.isDrawLine = false;
    },
    // 路径-绘制元素-扶梯
    holdFloorClick() {
      var that = this;
      if (that.drawActiveLine === 2) {
        that.drawActiveLine = "";
        that.isDrawLine = false;
        that.mapEditor.cancelDraw();
        return;
      }
      that.isDrawfacibility = true;
      that.mapEditor.drawPoint({
        img: "./icon/holdFloor.png",
        size: 30
      });
      that.floorNumTitle = "通行设施设置-扶梯";
      that.drawActiveLine = 2;
      that.isDrawLine = false;
    },
    // 路径-绘制元素-楼梯
    commonFloorClick() {
      var that = this;

      if (that.drawActiveLine === 3) {
        that.drawActiveLine = "";
        that.isDrawLine = false;
        that.mapEditor.cancelDraw();
        return;
      }
      that.floorNumTitle = "通行设施设置-楼梯";
      that.isDrawfacibility = true;
      that.mapEditor.drawPoint({
        img: "./icon/floor.png",
        size: 30
      });
      that.drawActiveLine = 3;
      that.isDrawLine = false;
    },
    // 创建地图
    newMap(mapData) {
      var that = this;
      that.mapEditor = "";
      // 实例化地图
      that.mapEditor = new MapEditor({
        container: "mapInDoor",
        data: mapData
      });
      // /选择要素回调事件
      that.mapEditor.selectFeature((e) => {
        that.selectedElement = e;
        that.isPoiSelected = false;
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.isDrawLine = "";
        that.drawActiveLine = "";
        that.isLineLayerSeleced = false;
        if (e.layername === "POI图层") {
          that.isPoiSelected = true;
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
          that.isLineLayerSeleced = true;
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
    // 初始化地图
    initMap(mapData) {
      var that = this;
      that.newMap(mapData);
      that.getFloorOutlineByBuildingId();
      that.loadFloor();
    },
    // 地图放大
    mapBiggerClick() {
      var that = this;
      that.mapEditor.zoomOut();
    },
    // 地图缩小
    mapLittleClick() {
      var that = this;
      that.mapEditor.zoomIn();
    },
    // 绘制点元素
    drawPoint() {
      var that = this;
      that.mapEditor.drawPoint();
    },
    // 绘制线元素
    drawLine() {
      var that = this;
      if (that.isDrawLine) {
        that.drawActiveLine = "";
        that.isDrawLine = false;
        that.mapEditor.cancelDraw();
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

      if (that.drawActiveType === 1) {
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.mapEditor.cancelDraw();
        return;
      }
      that.drawActiveType = 1;
      that.iconActiveNum = "";
      var obj = {};
      var style = that.elementStyleList[that.preDrawStyle];
      if (style) {
        obj = {
          name: "",
          typeID: style.id,
          fillColor: style.fillColor,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth
        };
        that.mapEditor.drawBox(obj);
        return;
      }
      that.mapEditor.drawBox({
        name: "",
        width: 0,
        fillColor: "rgba(255,255,255,0.1)",
        borderColor: "rgba(0,0,0,1)",
        fontSize: 12,
        fontFillColor: "rgba(255,255,255,1)",
        fontBorderColor: "rgba(0,0,0,1)"
      });
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

      if (that.drawActiveType === 3) {
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.mapEditor.cancelDraw();
        return;
      }
      that.iconActiveNum = "";
      that.selectedElement.id = "";
      that.drawActiveType = 3;
      var obj = {};
      var style = that.elementStyleList[that.preDrawStyle];
      if (style) {
        obj = {
          name: "",
          typeID: style.id,
          fillColor: style.fillColor,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth
        };
        that.mapEditor.drawPolygon(obj);
        return;
      }
      that.mapEditor.drawPolygon({
        name: "",
        width: 0,
        fillColor: "rgba(255,255,255,0.1)",
        borderColor: "rgba(0,0,0,1)",
        fontSize: 12,
        fontFillColor: "rgba(255,255,255,1)",
        fontBorderColor: "rgba(0,0,0,1)"
      });
    },
    // 绘制圆
    drawcircle() {
      var that = this;

      if (that.drawActiveType === 2) {
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.mapEditor.cancelDraw();
        return;
      }
      that.iconActiveNum = "";
      that.drawActiveType = 2;
      var obj = {};
      var style = that.elementStyleList[that.preDrawStyle];
      if (style) {
        obj = {
          name: "",
          typeID: style.id,
          fillColor: style.fillColor,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth
        };
        that.mapEditor.drawCircle(obj);
        return;
      }
      that.mapEditor.drawCircle({
        name: "",
        width: 0,
        fillColor: "rgba(255,255,255,0.1)",
        borderColor: "rgba(0,0,0,1)",
        fontSize: 12,
        fontFillColor: "rgba(255,255,255,1)",
        fontBorderColor: "rgba(0,0,0,1)"
      });
    },
    // 取消绘制
    canceldraw() {
      var that = this;
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
    setFloorInfoSuccess(id) {
      var that = this;
      that.getFloorInfoById(id).then((res) => {
        const imgUrl = `/files/img/${res.planarGraph}`;
        if (res.upperLeftCornerLongitude && res.upperLeftCornerLatitude && res
          .lowerRightCornerLongitude && res.lowerRightCornerLatitude) {
          that.$message({
            message: "楼层信息设置成功",
            type: "success"
          });
          const left = that.mapEditor.transformTo3857(res.upperLeftCornerLongitude, res
            .upperLeftCornerLatitude);
          const right = that.mapEditor.transformTo3857(res.lowerRightCornerLongitude, res
            .lowerRightCornerLatitude);
          that.mapEditor.setImageData({
            data: imgUrl,
            extent: [left[0], right[1], right[0], left[1]]
          });
          that.hasUnderPainting = true;
          const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            var r = Math.random() * 16 | 0;
            var v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
          that.mapEditor.setBuildData({
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [left[0], left[1]],
                  [right[0], left[1]],
                  [right[0], right[1]],
                  [left[0], right[1]]
                ]
              ]
            },
            properties: {
              id: uuid,
              name: "",
              floors: 1,
              styleID: null,
              width: 2,
              fillColor: "rgba(217,237,253,.3)",
              borderColor: "rgba(217,237,253,1.0)"

            }
          });
          // return;
        }
        // 如果没有经纬度信息，判断有没有轮廓信息
        if (res.floorOutline) {
          const floorOutline = JSON.parse(res.floorOutline);
          const coordinates = [];
          const lngArr = [];
          const latArr = [];
          floorOutline.forEach((item) => {
            lngArr.push(+item.lng);
            latArr.push(+item.lat);
            coordinates.push(that.mapEditor.transformTo3857(item.lng, item
              .lat));
          });
          const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            var r = Math.random() * 16 || 0;
            var v = c === "x" ? r : (r && 0x3 || 0x8);
            return v.toString(16);
          });
          // 获取最大经纬度   最小经纬度
          const bigLng = Math.max(...lngArr);
          const bigLat = Math.max(...latArr);
          const smallLng = Math.min(...lngArr);
          const smallLat = Math.min(...latArr);
          const small = that.mapEditor.transformTo3857(smallLng, smallLat);
          const big = that.mapEditor.transformTo3857(bigLng, bigLat);
          that.mapEditor.setImageData({
            data: imgUrl,
            extent: small.concat(big)
          });
          that.hasUnderPainting = true;
          // toto
          that.mapEditor.setBuildData({
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                coordinates
              ]
            },
            properties: {
              id: uuid,
              name: "",
              floors: 1,
              styleID: null,
              width: 2,
              fillColor: "rgba(217,237,253,.3)",
              borderColor: "rgba(217,237,253,1.0)"
            }
          });
        } else {
          that.$message({
            message: "当前楼层不具备经纬度信息，将不能发布",
            type: "warning"
          });
        }
      });
      that.setFloorInfoModal = false;
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
            that.elementStyleListCopy = data.data;
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

      setTimeout(() => {
        that.activeFloorData = that.buildingFloorsObj.floors[e];
      });
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
                id: that.buildingFloorsObj.floors[key].floorData.properties.id,
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

    // 根据楼层id获取楼层信息
    getFloorInfoById(id) {
      var that = this;
      return new Promise((resolve) => {
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
              resolve(data.data);
            } else {
              that.$message({
                message: data.msg,
                type: "warning"
              });
            }
          });
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
