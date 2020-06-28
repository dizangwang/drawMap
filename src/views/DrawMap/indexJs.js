import {
  mapActions,
  mapGetters
} from "vuex";
import SetFloorInfo from "./setFloorInfo.vue";
import CreateStyle from "./createStyle.vue";
import EditStyle from "./editStyle.vue";
import MapEditor from "../../assets/map/js/main";
import TestData from "../../assets/map/data/data";
import Data from "./indexJsData";
import Watch from "./indexJsWatch";

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
    return Data;
  },
  mounted() {
    var that = this;
    that.buildingId = that.$route.params.id;
    that.height = `${window.innerHeight - 75}px`;
    window.onresize = () => {
      that.height = `${window.innerHeight - 75}px`;
    };
    that.buildObj = {
      id: that.buildingId
    };
    that.getIcons();
    that.getElementStyles();
    that.getLabelStyles();
    // 初始化地图
    that.$nextTick(() => {
      that.initMap(TestData.floors[1]);
    });
  },
  watch: Watch,
  methods: {
    // 通行设施设置，点击楼层
    floorClick(item) {
      var that = this;
      if (that.goFloorArr.indexOf(item) > -1) {
        that.goFloorArr.splice(that.goFloorArr.indexOf(item), 1);
      } else {
        that.goFloorArr.push(item);
      }
    },
    // 判断是否给楼层加高亮
    isFloorActive(value) {
      var that = this;
      if (that.goFloorArr.indexOf(value) > -1) {
        return true;
      }
      return false;
    },
    // 通行设施设置-点击确定
    floorOkClick() {
      var that = this;
      const arr = [];
      that.floorArr.forEach((item) => {
        if (that.goFloorArr.includes(item.value)) {
          arr.push(item.label);
        }
      });
      that.facilityToFloor = arr.join(",");
      that.mapEditor.addFeatureById("point", that.facilityTypeTarget.id, "floor", that
        .facilityToFloor);
      that.goFloorNumModal = false;
    },
    // 调整底图
    adjustImage() {
      var that = this;
      const layerData = that.mapEditor.getSaveData();
      if (layerData.imageData.data) {
        if (that.adjustImageWord === "调整平面图") {
          that.mapEditor.setLayerDisplay("build", true);
          that.mapEditor.editImage(layerData.imageData.data);
          that.adjustImageWord = "完成调整";
        } else {
          that.mapEditor.setLayerDisplay("build", false);
          const arr = that.mapEditor.cancelEditImage();
          that.updateLngLat(arr);
          that.adjustImageWord = "调整平面图";
        }
      } else {
        that.$message({
          message: "请先上传底图",
          type: "warning"
        });
      }
    },
    // 调整结束后更新经纬度信息
    updateLngLat(lngLatObj) {
      var that = this;
      that.getFloorInfoById(that.activeFloorData.floorData.properties.id).then((res) => {
        const obj = {
          floorOutline: res.floorOutline,
          planarGraph: res.planarGraph,
          upperLeftCornerLongitude: lngLatObj[0],
          upperLeftCornerLatitude: lngLatObj[1],
          lowerRightCornerLongitude: lngLatObj[2],
          lowerRightCornerLatitude: lngLatObj[3]
        };
        let str = "";
        Object.keys(obj).forEach((item) => {
          str += `${item}=${obj[item]}&`;
        });
        that
          .ajax({
            method: "post",
            url: that.apis.floorMgrUpdateSettings + that.activeFloorData.floorData.properties
              .id,
            data: str
          })
          .then((result) => {
            const {
              data
            } = result;
            if (data.code === 200) {
              // that.$message({
              //   message: "提交成功",
              //   type: "success"
              // });
              that.saveDataCallBack(() => {});
            } else {
              that.$message({
                message: data.msg,
                type: "warning"
              });
            }
          });
      });
    },
    isComplete(fn) {
      var that = this;
      var i = 0;
      const layerData = that.mapEditor.getSaveData();
      // console.log(layerData.imageData.data);
      // 判断是否有底图
      if (layerData.imageData.data) {
        i += 1;
      } else {
        that.$message({
          message: "楼层缺少底图",
          type: "warning"
        });
        return;
      }
      // 判断有没有要素数据
      let y = 0;
      Object.keys(layerData.layerData).forEach((key) => {
        if (layerData.layerData[key].features.length > 0) {
          y += 1;
        }
      });
      if (y > 0) {
        i += 1;
      } else {
        that.$message({
          message: "楼层至少存在一条要素数据",
          type: "warning"
        });
        return;
      }
      // 判断是否有对角线经纬度
      that.getFloorInfoById(that.activeFloorData.floorData.properties.id).then((floorInfo) => {
        // 如果包含对角线经纬度信息
        if (floorInfo.lowerRightCornerLatitude && floorInfo.lowerRightCornerLongitude
          && floorInfo.upperLeftCornerLatitude && floorInfo.upperLeftCornerLongitude) {
          i += 1;
        } else {
          that.$message({
            message: "楼层缺少对角线经纬度信息",
            type: "warning"
          });
          return;
        }
        // console.log(i);
        if (i >= 3) {
          fn();
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
                if (data1[key][layer].features[index].geometry.coordinates) {
                  const geometry1 = JSON.stringify(data1[key][layer].features[index]
                    .geometry.coordinates);
                  const geometry2 = JSON.stringify(data2[key][layer].features[index]
                    .geometry.coordinates);
                  if (geometry1 !== geometry2) {
                    i += 1;
                  }
                }
                const properties1 = data1[key][layer].features[index].properties;
                Object.keys(properties1).forEach((property) => {
                  if (data1[key][layer].features[index].properties[property]
                    !== data2[key][
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
          .$confirm("是否删除选中的要素?", "提示", {
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
            const arrs = that.mapEditor.getData("point");
            that.dataChartPOIData = arrs.filter((currentValue, index, arr) => !/\/icon\//.test(currentValue.img));
          });
      }
    },
    // 搜索数据图表信息面要素
    dataChartDataFilter(pName) {
      var that = this;
      const data = that.mapEditor.getData("polygon");
      const arr = [];
      data.forEach((item) => {
        if (item.name.indexOf(pName) > -1) {
          arr.push(item);
        }
      });
      that.dataChartData = arr;
    },
    // 搜索数据图表信息POI素
    dataChartDataPoiFilter(poiName) {
      var that = this;
      const arrs = that.mapEditor.getData("point");
      that.dataChartPOIData = arrs.filter((currentValue, index, arr) => !/\/icon\//.test(currentValue.img));
      const data = that.dataChartPOIData;
      const arr = [];
      data.forEach((item) => {
        if (item.name.indexOf(poiName) > -1) {
          arr.push(item);
        }
      });
      that.dataChartPOIData = arr;
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
        .activeFloorData) && that.floorFinishStatus === "未完成") {
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


      if (that.floorFinishStatus === "完成") {
        that
          .$confirm("是否切换状态为完成后发布？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            that.saveDataCallBack(() => {
              that
                .ajax({
                  method: "post",
                  url: that.apis.floorFinishById + that.activeFloorData.floorData
                    .properties
                    .id,
                  data: {}
                })
                .then((res3) => {
                  const data3 = res3.data;
                  if (data3.code === 200) {
                    that
                      .ajax({
                        method: "post",
                        url: that.apis.floorMgrPublish,
                        data: {
                          id: that.activeFloorData.floorData.properties.id
                        }
                      })
                      .then((res4) => {
                        const data4 = res4.data;
                        if (data4.code === 200) {
                          that.$message({
                            message: "发布成功",
                            type: "success"
                          });
                          that.loadFloor();
                        } else {
                          that.$message({
                            message: data4.msg,
                            type: "warning"
                          });
                        }
                      });
                  } else {
                    that.$message({
                      message: data3.msg,
                      type: "warning"
                    });
                  }
                });
            });
          });
        return;
      }

      if (!that.compareData(that.activeFloorData, layerData) || !that.compareData(layerData, that
        .activeFloorData)) {
        that.saveDataCallBack(() => {
          that
            .ajax({
              method: "post",
              url: that.apis.floorFinishById + that.activeFloorData.floorData
                .properties
                .id,
              data: {}
            })
            .then((res1) => {
              const data1 = res1.data;
              if (data1.code === 200) {
                that
                  .ajax({
                    method: "post",
                    url: that.apis.floorMgrPublish,
                    data: {
                      id: that.activeFloorData.floorData.properties.id
                    }
                  })
                  .then((res2) => {
                    const data2 = res2.data;
                    if (data2.code === 200) {
                      that.$message({
                        message: "发布成功",
                        type: "success"
                      });
                      that.loadFloor();
                    } else {
                      that.$message({
                        message: data2.msg,
                        type: "warning"
                      });
                    }
                  });
              } else {
                that.$message({
                  message: data1.msg,
                  type: "warning"
                });
              }
            });
        });
      }
    },
    // 设置楼层完成
    floorFinishById() {
      var that = this;
      that.isComplete(() => {
        if (that.floorFinishStatus === "完成") {
          that.saveDataCallBack(() => {
            that
              .ajax({
                method: "post",
                url: that.apis.floorFinishById + that.activeFloorData.floorData.properties
                  .id,
                data: {}
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
          });
        } else {
          that.saveDataCallBack(() => {
            that
              .ajax({
                method: "post",
                url: that.apis.floorUnFinishById + that.activeFloorData.floorData
                  .properties
                  .id,
                data: {}
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
          });
        }
      });
    },
    // 保存数据后的回调
    saveDataCallBack(fn) {
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
            fn();
            that.loadFloor();
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
      that.iconActiveNum = "";
      that.drawActiveType = "";
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
      that.iconActiveNum = "";
      that.drawActiveType = "";
      that.mapEditor.setPointStyle(that.selectedElement.id, {
        img: that.selectedElement.value.img,
        size
      });
    },
    // 要素高度变动
    elementHeightChange(height) {
      var that = this;
      that.iconActiveNum = "";
      that.drawActiveType = "";
      if (that.selectedElement.layername === "多边形图层") {
        that.mapEditor.addFeatureById("polygon", that.selectedElement.id, "height", height);
      }
      if (that.selectedElement.layername === "建筑物图层") {
        that.mapEditor.addFeatureById("build", that.selectedElement.id, "height", height);
      }
      if (that.selectedElement.layername === "路径图层") {
        that.mapEditor.addFeatureById("path", that.selectedElement.id, "height", height);
      }
      if (that.selectedElement.layername === "POI图层") {
        that.mapEditor.addFeatureById("point", that.selectedElement.id, "height", height);
      }
    },
    // 点击选择要素
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
      const [obj] = that.allIconsArr[0];
      that.iconPreview = obj;
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
      // console.log(isAll)
      var that = this;
      if (isAll) {
        that.floorArr.forEach((item) => {
          that.goFloorArr.push(item.value);
        });
        setTimeout(() => {
          that.goFloorNumCheckAll = true;
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
      var style = "";
      that.iconActiveNum = "";
      that.drawActiveType = "";
      if (styleIndex === "") {
        that.selectedElement.value.fillColor = "";
        return;
      }

      if (styleIndex) {
        that.elementStyleList.forEach((item) => {
          if (item.id === styleIndex) {
            style = item;
          }
        });
      }
      if (that.selectedElement.layername === "多边形图层") {
        that.mapEditor.setPolygonStyle(that.selectedElement.id, {
          name: that.selectedElement.value.name,
          width: 0,
          fillColor: style.fillColor,
          styleID: style.id,
          borderColor: style.fillColor,
          borderWidth: 0,
          fontSize: that.selectedElement.value.fontSize,
          fontFillColor: that.selectedElement.value.fontFillColor,
          fontBorderColor: that.selectedElement.value.fontBorderColor
        });
        that.mapEditor.addFeatureById("polygon", that.selectedElement.id, "styleID", style.id);
        that.selectedElement.value.fillColor = style.fillColor;
        that.selectedElement.value.borderColor = style.borderColor;
        that.selectedElement.value.borderWidth = style.borderWidth;
      }
      if (that.selectedElement.layername === "建筑物图层") {
        that.mapEditor.setBuildStyle(that.selectedElement.id, {
          name: that.selectedElement.value.name,
          width: style.borderWidth,
          styleID: style.id,
          fillColor: style.fillColor,
          borderColor: style.borderColor
        });
        that.mapEditor.addFeatureById("build", that.selectedElement.id, "styleID", style.id);
        that.mapEditor.addFeatureById("build", that.selectedElement.id, "name", that.selectedElement
          .value.name);
        that.selectedElement.value.width = style.borderWidth;
        that.selectedElement.value.fillColor = style.fillColor;
        that.selectedElement.value.borderColor = style.borderColor;
      }
      if (that.selectedElement.layername === "路径图层") {
        that.mapEditor.setPathStyle(that.selectedElement.id, {
          width: style.borderWidth,
          styleID: style.id,
          color: style.borderColor,
          name: that.selectedElement.value.name
        });
        that.mapEditor.addFeatureById("path", that.selectedElement.id, "styleID", style.id);
        that.mapEditor.addFeatureById("path", that.selectedElement.id, "name", that.selectedElement
          .value.name);
        that.selectedElement.value.width = style.borderWidth;
        that.selectedElement.value.color = style.borderColor;
      }
      if (that.selectedElement.layername === "POI图层") {
        that.mapEditor.setPointStyle(that.selectedElement.id, {
          img: that.selectedElement.value.img,
          size: that.selectedElement.value.size
        });
        that.mapEditor.addFeatureById("point", that.selectedElement.id, "name", that.selectedElement
          .value.name);
        that.mapEditor.addFeatureById("point", that.selectedElement.id, "styleID", style.id);
        that.selectedElement.value.width = style.borderWidth;
        that.selectedElement.value.color = style.borderColor;
      }
    },
    // 监听要素color变动
    drawSelectedColorChange(col) {
      var that = this;
      var color = col;
      that.iconActiveNum = "";
      that.drawActiveType = "";
      if (!color) {
        color = "rgba(252, 246, 246, 0.75)";
      }
      that.selectedElement.value.fillColor = color;
      if (that.selectedElement.layername === "多边形图层") {
        that.mapEditor.setPolygonStyle(that.selectedElement.id, {
          name: that.selectedElement.value.name,
          width: that.selectedElement.value.width,
          fillColor: color,
          styleID: that.selectedElement.value.styleID,
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
          styleID: that.selectedElement.value.styleID,
          borderColor: that.selectedElement.value.borderColor
        });
        that.selectedElement.value.fillColor = color;
      }
      if (that.selectedElement.layername === "路径图层") {
        that.mapEditor.setPathStyle(that.selectedElement.id, {
          width: that.selectedElement.value.width,
          color,
          styleID: that.selectedElement.value.styleID,
          name: that.selectedElement.value.name
        });
        that.selectedElement.value.color = color;
      }
    },
    // 监听要素name变动
    drawSelectedNameInput(name) {
      var that = this;
      that.iconActiveNum = "";
      that.drawActiveType = "";
      if (that.selectedElement.layername === "多边形图层") {
        that.mapEditor.setPolygonStyle(that.selectedElement.id, {
          name,
          width: that.selectedElement.value.width,
          fillColor: that.selectedElement.value.fillColor,
          borderColor: that.selectedElement.value.borderColor,
          fontSize: 12,
          styleID: that.selectedElement.value.styleID,
          fontFillColor: that.selectedElement.value.fontFillColor,
          fontBorderColor: that.selectedElement.value.fontBorderColor
        });
        that.mapEditor.addFeatureById("polygon", that.selectedElement.id, "name", name);
      }
      if (that.selectedElement.layername === "建筑物图层") {
        that.mapEditor.setBuildStyle(that.selectedElement.id, {
          name,
          width: that.selectedElement.value.width,
          styleID: that.selectedElement.value.styleID,
          fillColor: that.selectedElement.value.fillColor,
          borderColor: that.selectedElement.value.borderColor
        });
        that.mapEditor.addFeatureById("build", that.selectedElement.id, "name", name);
      }
      if (that.selectedElement.layername === "路径图层") {
        that.mapEditor.setPathStyle(that.selectedElement.id, {
          width: that.selectedElement.value.width,
          styleID: that.selectedElement.value.styleID,
          color: that.selectedElement.value.color,
          name
        });
        that.mapEditor.addFeatureById("path", that.selectedElement.id, "name", name);
      }
      if (that.selectedElement.layername === "POI图层") {
        that.mapEditor.setPointStyle(that.selectedElement.id, {
          img: that.selectedElement.value.img,
          styleID: that.selectedElement.value.styleID,
          size: that.selectedElement.value.size,
          name
        });
        that.mapEditor.addFeatureById("point", that.selectedElement.id, "name", name);
      }
    },
    // 获取地图相关数据
    getAllData() {
      var that = this;
      that.dataChartInfoModal = true;
      that.dataChartData = that.mapEditor.getData("polygon");
      // that.dataChartPOIData = that.mapEditor.getData("point");

      const arrs = that.mapEditor.getData("point");
      that.dataChartPOIData = arrs.filter((currentValue, index, arr) => !/\/icon\//.test(currentValue.img));
    },

    // 路径-绘制要素-直梯
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
        size: 31
      });
      that.isDrawfacibility = true;
      that.floorNumTitle = "通行设施设置-直梯";
      that.drawActiveLine = 1;
      that.isDrawLine = false;
    },
    // 路径-绘制要素-扶梯
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
        size: 31
      });
      that.floorNumTitle = "通行设施设置-扶梯";
      that.drawActiveLine = 2;
      that.isDrawLine = false;
    },
    // 路径-绘制要素-楼梯
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
        size: 31
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
      that.mapEditor.setLayerDisplay("build", false);
      // /选择要素回调事件
      that.mapEditor.selectFeature((e) => {
        // console.log(e)
        const emptyObj = {
          id: "",
          layername: "",
          value: {
            borderColor: "",
            fillColor: "",
            font: "",
            fontBorderColor: "",
            fontFillColor: "",
            height: "",
            id: "",
            name: "",
            styleID: "",
            typeID: "",
            width: ""
          }
        };
        if (!e) {
          that.selectedElement = emptyObj;
          that.facilityTypeTarget = emptyObj;
          that.isPoiSelected = false;
          that.drawActiveType = "";
          that.iconActiveNum = "";
          that.isDrawLine = "";
          that.drawActiveLine = "";
          that.isLineLayerSeleced = false;
          return;
        }
        if (e.layername === "建筑物图层") {
          that.selectedElement = {
            id: "",
            layername: "",
            value: {
              borderColor: "",
              fillColor: "",
              font: "",
              fontBorderColor: "",
              fontFillColor: "",
              height: "",
              id: "",
              name: "",
              styleID: "",
              typeID: "",
              width: ""
            }
          };
          return;
        }

        that.selectedElement = e;
        that.isPoiSelected = false;
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.isDrawLine = "";
        that.drawActiveLine = "";
        that.isLineLayerSeleced = false;
        if (e.layername === "POI图层") {
          that.isPoiSelected = true;
          if (/\/icon\//.test(e.value.img) || e.value.size === 31) {
            that.facilityTypeTarget = e;
            that.facilityToFloor = that.facilityTypeTarget.value.floor;
            that.facilityGroup = that.facilityTypeTarget.value.group;
            that.selectedElement = emptyObj;
          } else {
            that.selectedElement = e;
            that.facilityTypeTarget = emptyObj;
          }
        }
        if (e.layername === "多边形图层") {
          that.selectedElement = e;
        }

        if (e.layername === "路径图层") {
          that.isLineLayerSeleced = true;
          that.selectedElement = e;
          that.selectedElement.value.fillColor = e.value.color;
        }
      });
      // /绘制结束回调
      that.mapEditor.drawFinish((e) => {
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.drawActiveLine = "";
        that.isDrawLine = "";
      });
      // 绘制要素回调事件
      that.mapEditor.drawFeature((e) => {
        // console.log(e)

        that.targetDrawedElement = e;

        // 绘制多边形的时候
        if (e.layername === "多边形图层") {
          that.selectedElement = e;
          that.selectedElement.value.height = that.elementHeight;
          that.selectedElement.value.styleID = that.preDrawStyle;
          setTimeout(() => {
            that.mapEditor.addFeatureById("polygon", e.id, "height", that.elementHeight);
            that.mapEditor.addFeatureById("polygon", e.id, "width", 0);
            that.mapEditor.addFeatureById("polygon", e.id, "borderColor", e.value
              .fillColor);
            if (that.preDrawStyle) {
              that.mapEditor.addFeatureById("polygon", e.id, "styleID", that.preDrawStyle);
            }
          });
        }
        if (e.layername === "POI图层") {
          if (that.tabNum === 2) {
            that.facilityTypeTarget = e;
          }

          setTimeout(() => {
            that.mapEditor.addFeatureById("point", e.id, "name", that.iconName);
            that.mapEditor.addFeatureById("point", e.id, "height", that.elementHeight);
            if (that.preDrawStyle) {
              that.mapEditor.addFeatureById("point", e.id, "styleID", that.preDrawStyle);
            }
          }, 1000);
          if (that.isDrawfacibility) {
            that.goFloorNumModal = true;
            // 清空楼层选择
            that.goFloorArr = [];
            that.goFloorNumCheckAll = false;
          }
        }
        if (e.layername === "多边形图层") {
          that.selectedElement = e;
          setTimeout(() => {
            that.mapEditor.addFeatureById("polygon", e.id, "width", 0);
            that.mapEditor.addFeatureById("polygon", e.id, "borderColor", e.value
              .fillColor);
            that.mapEditor.addFeatureById("polygon", e.id, "height", that.elementHeight);
            if (that.preDrawStyle) {
              that.mapEditor.addFeatureById("polygon", e.id, "styleID", that.preDrawStyle);
            }
          }, 1000);
        }
        if (e.layername === "路径图层") {
          setTimeout(() => {
            // that.mapEditor.addFeatureById("path",e.id,"height",that.elementHeight);
            // if(that.preDrawStyle){
            //   that.mapEditor.addFeatureById("path",e.id,"styleID",that.preDrawStyle);
            // }
          }, 1000);
        }
        if (e.layername === "建筑物图层") {
          setTimeout(() => {
            that.mapEditor.addFeatureById("build", e.id, "height", that.elementHeight);
            if (that.preDrawStyle) {
              that.mapEditor.addFeatureById("build", e.id, "styleID", that.preDrawStyle);
            }
          }, 1000);
        }
      });
    },
    // 初始化地图
    initMap(mapData) {
      var that = this;
      that.newMap(mapData);
      that.activeFloor = "";
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
    // 绘制点要素
    drawPoint() {
      var that = this;
      that.mapEditor.drawPoint();
    },
    // 绘制线要素
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
      var obj = {};
      var style = "";
      if (that.drawActiveType === 1) {
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.mapEditor.cancelDraw();
        return;
      }
      that.drawActiveType = 1;
      that.iconActiveNum = "";
      that.elementStyleList.forEach((item) => {
        if (item.id === that.preDrawStyle) {
          style = item;
        }
      });
      if (style) {
        obj = {
          name: "",
          styleID: style.id,
          fillColor: style.fillColor,
          borderColor: style.fillColor,
          borderWidth: 0
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

    // 设置面要素的样式
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

    // 绘制面要素
    drawpolygon() {
      var that = this;
      var obj = {};
      var style = "";
      if (that.drawActiveType === 3) {
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.mapEditor.cancelDraw();
        return;
      }
      that.iconActiveNum = "";
      that.selectedElement.id = "";
      that.drawActiveType = 3;
      that.elementStyleList.forEach((item) => {
        if (item.id === that.preDrawStyle) {
          style = item;
        }
      });
      if (style) {
        obj = {
          name: "",
          styleID: style.id,
          fillColor: style.fillColor,
          borderColor: style.fillColor,
          width: 0
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
      var obj = {};
      var style = "";
      if (that.drawActiveType === 2) {
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.mapEditor.cancelDraw();
        return;
      }
      that.iconActiveNum = "";
      that.drawActiveType = 2;
      that.elementStyleList.forEach((item) => {
        if (item.id === that.preDrawStyle) {
          style = item;
        }
      });
      if (style) {
        obj = {
          name: "",
          styleID: style.id,
          fillColor: style.fillColor,
          borderColor: style.fillColor,
          borderWidth: 0,
          width: 0
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
          // const left = that.mapEditor.transformTo3857(res.upperLeftCornerLongitude, res
          //   .upperLeftCornerLatitude);
          // const right = that.mapEditor.transformTo3857(res.lowerRightCornerLongitude, res
          //   .lowerRightCornerLatitude);
          const left = [res.upperLeftCornerLongitude, res
            .upperLeftCornerLatitude
          ];
          const right = [res.lowerRightCornerLongitude, res
            .lowerRightCornerLatitude
          ];
          that.mapEditor.setImageData({
            data: imgUrl,
            extent: [left[0], right[1], right[0], left[1]]
          });
          that.hasUnderPainting = true;
          const uuid = that.utils.getUUID();
          that.mapEditor.setBuildData({
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [left[0], left[1]],
                  [right[0], left[1]],
                  [right[0], right[1]],
                  [left[0], right[1]],
                  [left[0], left[1]]
                ]
              ]
            },
            properties: {
              id: uuid,
              name: "",
              floors: 1,
              styleID: null,
              width: 2,
              fillColor: "rgba(217,237,253,.1)",
              borderColor: "rgba(0,153,255,.5)"
            }
          });
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
            // coordinates.push(that.mapEditor.transformTo3857(item.lng, item
            //   .lat));
            coordinates.push([item.lng, item.lat]);
          });
          const uuid = that.utils.getUUID();
          // 获取最大经纬度   最小经纬度
          const bigLng = Math.max(...lngArr);
          const bigLat = Math.max(...latArr);
          const smallLng = Math.min(...lngArr);
          const smallLat = Math.min(...latArr);
          // const small = that.mapEditor.transformTo3857(smallLng, smallLat);
          // const big = that.mapEditor.transformTo3857(bigLng, bigLat);
          const small = [smallLng, smallLat];
          const big = [bigLng, bigLat];

          if (!res.upperLeftCornerLongitude && !res.upperLeftCornerLatitude && !res
            .lowerRightCornerLongitude && !res.lowerRightCornerLatitude) {
            that.mapEditor.setImageData({
              data: imgUrl,
              extent: small.concat(big)
            });
          }

          that.hasUnderPainting = true;
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
              fillColor: "rgba(217,237,253,.1)",
              borderColor: "rgba(0,153,255,.5)"
            }
          });
        }

        if ((res.upperLeftCornerLongitude && res.upperLeftCornerLatitude && res
          .lowerRightCornerLongitude && res.lowerRightCornerLatitude && res.planarGraph) || (
          res
            .floorOutline && res.planarGraph)) {
          that.saveDataCallBack(() => {});
        }
        if (!res.upperLeftCornerLongitude && !res.upperLeftCornerLatitude && !res
          .lowerRightCornerLongitude && !res.lowerRightCornerLatitude && !res.floorOutline) {
          that.$message({
            message: "没有对角线经纬度和轮廓信息无法定位底图",
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

    // 获取所有要素样式
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
    // 全选楼层
    floorCheck() {
      var that = this;
      if (that.floorArr.length === that.goFloorArr.length) {
        that.goFloorArr = [];
      } else {
        that.goFloorArr = [];
        that.floorArr.forEach((item) => {
          that.goFloorArr.push(item.value);
        });
      }
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
            const floors = [];
            that.buildingFloorsObj = data.data;
            that.floorArr = [];
            const numArr = [];


            Object.keys(that.buildingFloorsObj.floors).forEach((floor) => {
              const num = +floor;
              numArr.push(num);
            });
            numArr.sort((a, b) => b - a);
            // console.log(JSON.stringify(numArr))

            numArr.forEach((item) => {
              const key = `${item}`;
              Object.keys(that.buildingFloorsObj.floors).forEach((floorKey) => {
                if (floorKey === key) {
                  const obj = {};
                  obj[floorKey] = that.buildingFloorsObj.floors[floorKey];
                  floors.push(obj);
                }
              });
            });
            // that.buildingFloorsObj.floors=floors;
            // console.log(JSON.stringify(floors,null,4))

            floors.forEach((item) => {
              Object.keys(item).forEach((key) => {
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
            });

            // Object.keys(that.buildingFloorsObj.floors).forEach((key) => {
            //   const floorKey = +key;
            //   let strKey = "";
            //   if (floorKey > 0) {
            //     strKey = `F${floorKey}`;
            //   } else {
            //     strKey = `B${-floorKey}`;
            //   }
            //   that.floorArr.push({
            //     id: that.buildingFloorsObj.floors[key].floorData.properties.id,
            //     label: strKey,
            //     value: key
            //   });
            // });
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
    }
  }
};
