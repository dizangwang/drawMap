export default {
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
    // var that = this;
    // const arr = [];

    // that.floorArr.forEach((item) => {
    //   if (flrArr.includes(item.value)) {
    //     arr.push(item.label);
    //   }
    // });
    // if (that.floorArr.length === flrArr.length) {
    //   that.goFloorNumCheckAll = true;
    // } else {
    //   that.goFloorNumCheckAll = false;
    // }

    // that.facilityToFloor = arr.join(",");
    // that.mapEditor.addFeatureById("point", that.facilityTypeTarget.id, "floor", that
    //   .facilityToFloor);
  },
  facilityGroup(group) {
    var that = this;
    setTimeout(() => {
      that.mapEditor.addFeatureById("point", that.facilityTypeTarget.id, "group", group);
      that.mapEditor.addFeatureById("point", that.facilityTypeTarget.id, "typeID", group);
    });
  },
  facilityToFloor(floor) {
    var that = this;
    setTimeout(() => {
      that.mapEditor.addFeatureById("point", that.facilityTypeTarget.id, "floor", floor);
    });
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

    const val = JSON.parse(JSON.stringify(result));
    that.getFloorInfoById(val.floorData.properties.id).then((floorInfo) => {
      that.finishStatus = floorInfo.finishStatus;
      if (that.finishStatus) {
        that.floorFinishStatus = "未完成";
      } else {
        that.floorFinishStatus = "完成";
      }
    });
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
    if (!val.imageData.data) {
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
    // 判断有没有对角线经纬度
    // that.getFloorInfoById(val.floorData.properties.id).then((floorInfo) => {
    //   // 如果包含对角线经纬度信息
    //   if (floorInfo.lowerRightCornerLatitude && floorInfo.lowerRightCornerLongitude
    //     && floorInfo.upperLeftCornerLatitude && floorInfo.upperLeftCornerLongitude) {
    //     if (i > 0) {
    //      // that.floorFinishStatus = "完成";
    //     }
    //   } else {
    //     that.$message({
    //       message: "当前楼层缺少对角线经纬度信息",
    //       type: "warning"
    //     });
    //   }
    // });
  }
};
