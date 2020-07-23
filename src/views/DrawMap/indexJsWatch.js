export default {
  // 样式绘制前选择的样式id
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
  // 分组名称
  facilityGroup(group) {
    var that = this;
    setTimeout(() => {
      that.mapEditor.addFeatureById("point", that.facilityTypeTarget.id, "group", group);
    });
  },
  // 需要到达的楼层
  facilityToFloor(floor) {
    var that = this;
    setTimeout(() => {
      that.mapEditor.addFeatureById("point", that.facilityTypeTarget.id, "targetFloor", floor);
    });
  },
  // 图层的类型
  layerType() {
    this.dataChartSelectedIds = [];
  },
  // 左侧-顶部-tab栏
  tabNum(num) {
    var that = this;
    if (num !== 2) {
      that.isDrawfacibility = false;
      that.isDrawLine = false;
    }
    if (num !== 1) {
      that.iconActiveNum = "";
    }
  },
  // 被选中的楼层
  activeFloor(afl) {
    if (afl) {
      this.activeFloorArrCache.push(afl);
    }
  },
  // 选中楼层的数据
  activeFloorData(result) {
    var that = this;
    if (!result) {
      return;
    }
    // 复制参数
    const val = JSON.parse(JSON.stringify(result));
    // 获取楼层信息
    that.getFloorInfoById(val.floorData.properties.id).then((floorInfo) => {
      that.finishStatus = floorInfo.finishStatus;
      if (that.finishStatus) {
        that.floorFinishStatus = "未完成";
      } else {
        that.floorFinishStatus = "完成";
      }
    });
    // 判断楼层底图的经纬度
    if (!val.imageData.extent) {
      val.imageData.extent = [];
    } else if (typeof val.imageData.extent === "string") {
      // 如果经纬度时字符串
      val.imageData.extent = JSON.parse(val.imageData.extent);
    }
    // 如果不存在楼层的经纬度
    if (!val.floorData.geometry) {
      delete val.floorData.geometry;
    }
    document.querySelector("#mapInDoor").innerHTML = "";
    // 实例化地图
    that.newMap(val);

    // 是否有底图经纬度
    if (!val.imageData.data) {
      that.hasUnderPainting = false;
      that.$message({
        message: "没有底图无法进行任何绘制操作",
        type: "warning"
      });
      return;
    }
    // 设置是否有底图为true
    that.hasUnderPainting = true;
    // 判断是否有图片
    if (val.imageData.data) {
      const image = new Image();
      image.src = val.imageData.data;
      that.mapLoading = true;
      that.loadingText = "底图加载中...";
      // 底图加载成功时
      image.onload = function () {
        that.mapLoading = false;
        that.loadingText = "";
      };
      // 底图加载失败
      image.onerror = function () {
        that.mapLoading = false;
        that.loadingText = "";
        that.$message({
          message: "底图加载失败",
          type: "warning"
        });
      };
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
  }
};
