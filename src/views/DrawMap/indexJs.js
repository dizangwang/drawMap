// 设置楼层信息组件
import SetFloorInfo from "./setFloorInfo.vue";
// 创建样式组件
import CreateStyle from "./createStyle.vue";
// 编辑样式组件
import EditStyle from "./editStyle.vue";
// 引入gis
import MapEditor from "../../assets/map/js/main";
// 引入数据
import TestData from "../../assets/map/data/data";
// data
import Data from "./indexJsData";
// watch
import Watch from "./indexJsWatch";

export default {
  name: "DrawMap",
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
    // 设置选中的tab
    that.tabNum = 1;
    // 初始化adjustImageWord
    that.adjustImageWord = "调整平面图";
    that.setFloorInfoModal = false;
    // 获取楼宇的id
    that.buildingId = that.$route.params.id;
    // 设置高度
    that.height = `${window.innerHeight - 75}px`;
    // 动态设置高度
    window.onresize = () => {
      that.height = `${window.innerHeight - 75}px`;
    };
    // 楼宇对象
    that.buildObj = {
      id: that.buildingId
    };
    // 获取图标
    that.getIcons();
    // 获取元素样式
    that.getElementStyles();
    // 获取标注样式
    that.getLabelStyles();
    // 初始化地图
    that.$nextTick(() => {
      that.initMap(TestData.floors[1]);
    });
    // 绑定beforeunload事件，窗口在退出时进行询问
    window.addEventListener("beforeunload", (ev) => {
      var event = ev;
      // 窗口刷新或关闭的时候进行判断询问
      if (/drawMap/g.test(window.location.hash)) {
        // 获取当前图层数据
        const layerData = that.mapEditor.getSaveData();
        // 进行数据对比，如果图层数据和数据库数据不一致进行弹窗询问
        if (!that.compareData(layerData, that.activeFloorData)) {
          event.preventDefault();
          event.returnValue = "绘制内容尚未保存,确定要离开此页面吗？";
        }
      }
    });
  },
  watch: Watch,
  // 导航离开该组件的对应路由时调用
  beforeRouteLeave(to, from, next) {
    var that = this;
    // 获取当前图层数据
    const layerData = that.mapEditor.getSaveData();
    // 如果数据不一致
    if (!that.compareData(layerData, that.activeFloorData)) {
      // 停止页面跳转
      next(false);
      // 弹窗进行询问
      setTimeout(() => {
        that
          .$confirm("绘制内容尚未保存", "提示", {
            confirmButtonText: "保存后离开",
            cancelButtonText: "离开",
            type: "warning",
            distinguishCancelAndClose: true,
            callback(action, instance) {
              // 点击了 保存后离开
              if (action === "confirm") {
                that.saveDataCallBack(() => {
                  that.$message({
                    message: "保存成功",
                    type: "success"
                  });
                  // 进行跳转
                  next();
                });
              }
              // 点击了 离开
              if (action === "cancel") {
                // 进行跳转
                next();
              }
            }
          });
      }, 500);
    } else {
      // 进行跳转
      next();
    }
  },
  methods: {
    // 上传base64编码
    uploadBase64(base64, fn) {
      var that = this;
      // 设置等待信息
      that.mapLoading = true;
      that.loadingText = "上传图片中...";
      that
        .ajax({
          method: "post",
          url: that.uploadApis.uploadFiles,
          data: {
            file: encodeURIComponent(base64)
          }
        })
        .then((result) => {
          const {
            data
          } = result;

          if (data.code === 200) {
            fn(data.data.url, data.data.id);
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        }).catch((error) => {
          // 处理异常
          that.loadingText = "";
          that.mapLoading = false;
          if (/413/.test(error)) {
            that.$message({
              message: "请求实体太大，图片转换失败，请减小图片分辨率",
              type: "warning"
            });
          } else {
            that.$message({
              message: "图片转换失败，请重新设置底图",
              type: "warning"
            });
          }
        });
    },
    // 通行设施设置，编辑楼层
    facilityToFloorClick() {
      var that = this;
      that.goFloorNumModal = true;
      if (that.facilityToFloor) {
        const arr = that.facilityToFloor.split(",");
        const newArr = [];
        // 楼层转换
        arr.forEach((item) => {
          if (item.indexOf("F") > -1) {
            newArr.push(`${item.replace("F", "")}`);
          }
          if (item.indexOf("B") > -1) {
            newArr.push(`${-item.replace("B", "")}`);
          }
        });
        // 赋值
        that.goFloorArr = newArr;
      } else {
        // 清空楼层选择
        that.goFloorArr = [];
      }
    },
    // 通行设施设置，点击楼层
    floorClick(item) {
      var that = this;
      // 如果到达楼层里面有当前值，那么删除，如果没有那么push
      if (that.goFloorArr.indexOf(item) > -1) {
        that.goFloorArr.splice(that.goFloorArr.indexOf(item), 1);
      } else {
        that.goFloorArr.push(item);
      }
    },
    // 判断是否给楼层加高亮
    isFloorActive(value) {
      var that = this;
      // 判断到达楼层里有没有当前值
      if (that.goFloorArr.indexOf(value) > -1) {
        return true;
      }
      return false;
    },
    // 通行设施设置-点击确定
    floorOkClick() {
      var that = this;
      const arr = [];
      // 循环楼层
      that.floorArr.forEach((item) => {
        // 判断到达楼层里面有没有当前值，有的话把label放入arr
        if (that.goFloorArr.includes(item.value)) {
          arr.push(item.label);
        }
      });
      that.facilityToFloor = arr.join(",");
      // 设置元素属性
      that.mapEditor.addFeatureById("point", that.facilityTypeTarget.id, "targetFloor", that
        .facilityToFloor);
      that.goFloorNumModal = false;
    },
    // 调整底图
    adjustImage() {
      var that = this;
      // 获取图层信息
      const layerData = that.mapEditor.getSaveData();
      // 判断楼层有没有底图
      if (layerData.imageData.data) {
        if (that.adjustImageWord === "调整平面图") {
          // 设置建筑轮廓显示
          that.mapEditor.setLayerDisplay("build", true);
          that.mapEditor.editImage(layerData.imageData.data, layerData.imageData.extent, that
            .imgFix);
          that.adjustImageWord = "完成调整";
        } else {
          // 设置建筑轮廓隐藏
          that.mapEditor.setLayerDisplay("build", false);
          const result = that.mapEditor.cancelEditImage();
          // 上传变换的base64
          that.uploadBase64(result.data, (url, id) => {
            that.mapEditor.setImageData({
              data: url,
              extent: result.extent
            });
            // 更新楼层信息
            that.updateLngLat(result, id);
          });
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
    updateLngLat(resultInfo, id) {
      var that = this;
      var lngLatObj = resultInfo.extent;
      that.saveDataCallBack(() => {
        // 获取楼层的信息更新经纬度的信息
        that.mapLoading = true;
        that.loadingText = "楼层信息更新中...";
        // 获取楼层信息
        that.getFloorInfoById(that.activeFloorData.floorData.properties.id).then((res) => {
          that.finishStatus = res.finishStatus;
          if (that.finishStatus) {
            that.floorFinishStatus = "未完成";
          } else {
            that.floorFinishStatus = "完成";
          }
          // 拼装参数
          const obj = {
            floorOutline: res.floorOutline,
            planarGraph: id,
            upperLeftCornerLongitude: lngLatObj[0],
            upperLeftCornerLatitude: lngLatObj[3],
            lowerRightCornerLongitude: lngLatObj[2],
            lowerRightCornerLatitude: lngLatObj[1]
          };
          let str = "";
          Object.keys(obj).forEach((item) => {
            str += `${item}=${obj[item]}&`;
          });
          // 更新楼层的信息
          that
            .ajax({
              method: "post",
              url: that.apis.floorMgrUpdateSettings + that.activeFloorData.floorData
                .properties
                .id,
              data: str
            })
            .then((result) => {
              const {
                data
              } = result;
              that.mapLoading = false;
              if (data.code === 200) {
                // that.$message({
                //   message: "提交成功",
                //   type: "success"
                // });
              } else {
                that.$message({
                  message: data.msg,
                  type: "warning"
                });
              }
            });
        });
      });
    },
    // 判断是否达到了完成的条件
    isComplete(fn) {
      var that = this;
      var i = 0;
      const layerData = that.mapEditor.getSaveData();
      // const layerData =that.activeFloorData
      // 判断是否有底图
      if (layerData.imageData.data) {
        i += 1;
      } else {
        that.$message({
          message: "楼层缺少底图",
          type: "warning"
        });
        that.mapLoading = false;
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
        that.mapLoading = false;
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
          that.mapLoading = false;
          return;
        }
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
              that.mapLoading = false;
            }
          });
      });
    },
    // 对比geo数据判断数据是否保存 true:数据一致  false:数据有差异
    compareData(param1, param2) {
      var that = this;
      var data1 = param1;
      var data2 = param2;
      var keys = Object.keys(data1);
      var i = 0;
      keys.forEach((key) => {
        // 对比图片信息
        if (key === "imageData") {
          // 循环图片信息
          Object.keys(data1[key]).forEach((imgKey) => {
            // 当图片都存在的时候
            if (data1[key].data !== null && data2[key].data !== null) {
              // 如果两者不相等
              if (data1[key].data !== data2[key].data) {
                i += 1;
              }
            }
            // 如果经纬度信息存在
            if (data2[key].extent !== null) {
              // 如果extent的类型为字符串，则需要转换
              if (typeof data1[key].extent === "string") {
                data1[key].extent = JSON.parse(data1[key].extent);
              }
              // 如果extent的类型为字符串，则需要转换
              if (typeof data2[key].extent === "string") {
                data2[key].extent = JSON.parse(data2[key].extent);
              }
              // 如果两者的extent序列化后不相等
              if (JSON.stringify(data2[key].extent) !== JSON.stringify(data1[key].extent)) {
                i += 1;
              }
            }
          });
        }
        // 对比楼层信息
        if (key === "floorData") {
          // 如果楼层信息不等于空对象
          if (JSON.stringify(data1[key]) !== "{}") {
            if (data1[key].geometry) {
              // 重新组装经纬度对象进行对比
              let coo1 = "";
              let coo2 = "";
              if (data1[key].geometry.coordinates) {
                coo1 = JSON.parse(JSON.stringify(data1[key].geometry.coordinates));
                coo1[0].forEach((gc1, gcnum1) => {
                  // 因为gis获取的经纬度与数据库的经纬度会在最后几位有差别所以只对比小数点后7位
                  coo1[0][gcnum1][0] = (+gc1[0]).toFixed(7);
                  coo1[0][gcnum1][1] = (+gc1[1]).toFixed(7);
                });
                coo1 = JSON.stringify(coo1);
              }
              if (data2[key].geometry) {
                if (data2[key].geometry.coordinates) {
                  coo2 = JSON.parse(JSON.stringify(data2[key].geometry.coordinates));
                  coo2[0].forEach((gc2, gcnum2) => {
                    // 因为gis获取的经纬度与数据库的经纬度会在最后几位有差别所以只对比小数点后7位
                    coo2[0][gcnum2][0] = (+gc2[0]).toFixed(7);
                    coo2[0][gcnum2][1] = (+gc2[1]).toFixed(7);
                  });
                  coo2 = JSON.stringify(coo2);
                }
              }
              // 判断两者是否相等
              if (coo1 !== coo2) {
                i += 1;
              }
            }
            // 判断属性是否相等
            Object.keys(data1[key].properties).forEach((pro) => {
              if (data1[key].properties[pro] !== data2[key].properties[pro]) {
                i += 1;
              }
            });
          }
        }
        // 对比图层
        if (key === "layerData") {
          Object.keys(data1[key]).forEach((layer) => {
            // 当图层类型为多边形时
            if (layer === "polygon") {
              // 先判断元素的长度相不相等
              if (data1[key][layer].features.length === data2[key][layer].features.length) {
                const obj1 = {};
                const obj2 = {};
                // 重新组装对象，以id作为对象的属性，对应的属性值为features
                if (data1[key][layer].features.length !== 0) {
                  data1[key][layer].features.forEach((feature, index) => {
                    obj1[data1[key][layer].features[index].properties.id] = data1[
                      key][layer].features[index];
                    obj2[data2[key][layer].features[index].properties.id] = data2[
                      key][layer].features[index];
                  });
                  // 循环第一个对象的属性值
                  Object.keys(obj1).forEach((fitem) => {
                    const coordinates1 = obj1[fitem].geometry.coordinates;
                    const properties1 = obj1[fitem].properties;
                    if (obj2[fitem]) {
                      const coordinates2 = obj2[fitem].geometry.coordinates;
                      const properties2 = obj2[fitem].properties;

                      let geometry1 = coordinates1;
                      geometry1.forEach((geo1, gnum1) => {
                        geometry1[gnum1].forEach((geo11, gnum11) => {
                          // 因为gis获取的经纬度与数据库的经纬度会在最后几位有差别所以只对比小数点后7位
                          geometry1[gnum1][gnum11][0] = (+geo11[0]).toFixed(7);
                          geometry1[gnum1][gnum11][1] = (+geo11[1]).toFixed(7);
                        });
                      });
                      geometry1 = JSON.stringify(geometry1);
                      let geometry2 = coordinates2;

                      geometry2.forEach((geo2, gnum2) => {
                        geometry2[gnum2].forEach((geo22, gnum22) => {
                          // 因为gis获取的经纬度与数据库的经纬度会在最后几位有差别所以只对比小数点后7位
                          geometry2[gnum2][gnum22][0] = (+geo22[0]).toFixed(7);
                          geometry2[gnum2][gnum22][1] = (+geo22[1]).toFixed(7);
                        });
                      });
                      geometry2 = JSON.stringify(geometry2);
                      // 判断两者是否相等
                      if (geometry1 !== geometry2) {
                        i += 1;
                      }
                      // 判断属性是否相等
                      Object.keys(properties1).forEach((property) => {
                        if (properties1[property] !== properties2[property]) {
                          i += 1;
                        }
                      });
                    } else {
                      i += 1;
                    }
                  });
                }
              } else {
                i += 1;
              }
            }
            // 当图层类型为线元素时
            if (layer === "path") {
              if (data1[key][layer].features.length === data2[key][layer].features.length) {
                const obj1 = {};
                const obj2 = {};
                // 重新组装对象，以id作为对象的属性，对应的属性值为features
                if (data1[key][layer].features.length !== 0) {
                  data1[key][layer].features.forEach((feature, index) => {
                    obj1[data1[key][layer].features[index].properties.id] = data1[
                      key][layer].features[index];
                    obj2[data2[key][layer].features[index].properties.id] = data2[
                      key][layer].features[index];
                  });
                  // 循环第一个对象的属性值
                  Object.keys(obj1).forEach((fitem) => {
                    const coordinates1 = obj1[fitem].geometry.coordinates;
                    const properties1 = obj1[fitem].properties;
                    if (obj2[fitem]) {
                      const coordinates2 = obj2[fitem].geometry.coordinates;
                      const properties2 = obj2[fitem].properties;

                      let geometry1 = coordinates1;
                      geometry1.forEach((geo1, gnum1) => {
                        geometry1[gnum1].forEach((geo11, gnum11) => {
                          // 因为gis获取的经纬度与数据库的经纬度会在最后几位有差别所以只对比小数点后7位
                          geometry1[gnum1][gnum11] = (+geo11).toFixed(7);
                        });
                      });
                      geometry1 = JSON.stringify(geometry1);
                      let geometry2 = coordinates2;

                      geometry2.forEach((geo2, gnum2) => {
                        geometry2[gnum2].forEach((geo22, gnum22) => {
                          // 因为gis获取的经纬度与数据库的经纬度会在最后几位有差别所以只对比小数点后7位
                          geometry2[gnum2][gnum22] = (+geo22).toFixed(7);
                        });
                      });
                      geometry2 = JSON.stringify(geometry2);
                      // 判断两者是否相等
                      if (geometry1 !== geometry2) {
                        i += 1;
                      }
                      // 判断属性是否相等
                      Object.keys(properties1).forEach((property) => {
                        if (properties1[property] !== properties2[property]) {
                          i += 1;
                        }
                      });
                    } else {
                      i += 1;
                    }
                  });
                }
              } else {
                i += 1;
              }
            }
            // 当图层类型为点元素时
            if (layer === "point") {
              if (data1[key][layer].features.length === data2[key][layer].features.length) {
                const obj1 = {};
                const obj2 = {};
                // 重新组装对象，以id作为对象的属性，对应的属性值为features
                if (data1[key][layer].features.length !== 0) {
                  data1[key][layer].features.forEach((feature, index) => {
                    obj1[data1[key][layer].features[index].properties.id] = data1[
                      key][layer].features[index];
                    obj2[data2[key][layer].features[index].properties.id] = data2[
                      key][layer].features[index];
                  });
                  // 循环第一个对象的属性值
                  Object.keys(obj1).forEach((fitem) => {
                    const coordinates1 = obj1[fitem].geometry.coordinates;
                    const properties1 = obj1[fitem].properties;
                    if (obj2[fitem]) {
                      const coordinates2 = obj2[fitem].geometry.coordinates;
                      const properties2 = obj2[fitem].properties;

                      let geometry1 = coordinates1;
                      // 因为gis获取的经纬度与数据库的经纬度会在最后几位有差别所以只对比小数点后7位
                      geometry1[0] = (+geometry1[0]).toFixed(7);
                      geometry1[1] = (+geometry1[1]).toFixed(7);
                      geometry1 = JSON.stringify(geometry1);
                      let geometry2 = coordinates2;
                      // 因为gis获取的经纬度与数据库的经纬度会在最后几位有差别所以只对比小数点后7位
                      geometry2[0] = (+geometry2[0]).toFixed(7);
                      geometry2[1] = (+geometry2[1]).toFixed(7);
                      geometry2 = JSON.stringify(geometry2);
                      // 判断两者是否相等
                      if (geometry1 !== geometry2) {
                        i += 1;
                      }
                      // 判断属性是否相等
                      Object.keys(properties1).forEach((property) => {
                        if (properties1[property] !== properties2[property]) {
                          i += 1;
                        }
                      });
                    } else {
                      i += 1;
                    }
                  });
                }
              } else {
                i += 1;
              }
            }
          });
        }
      });
      // 返回i有没有变动 如过i等于0说明两个参数是一致的，如果不等于0两个参数是不一致的
      return i === 0;
    },

    // 删除选中的图层
    deleteSelectedElement() {
      var that = this;
      // 判断有没有勾选数据
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
            // 循环选中的id
            that.dataChartSelectedIds.forEach((item) => {
              // 如果是面元素
              if (that.layerType === "1") {
                that.mapEditor.deleteFeatureById("polygon", item.id);
              }
              // 如果是点元素
              if (that.layerType === "2") {
                that.mapEditor.deleteFeatureById("point", item.id);
              }
            });
            // 删除完之后重新进行赋值
            // 给面元素赋值
            that.dataChartData = that.mapEditor.getData("polygon");
            // 给点元素赋值
            const arrs = that.mapEditor.getData("point");
            that.dataChartPOIData = arrs.filter((currentValue, index, arr) => currentValue
              .size !== 31);
          });
      }
    },
    // 搜索数据图表信息面要素
    dataChartDataFilter(pName) {
      var that = this;
      // 拿到面元素的数据
      const data = that.mapEditor.getData("polygon");
      const arr = [];
      data.forEach((item) => {
        // 如果name中包含搜索框中的值
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
      that.dataChartPOIData = arrs.filter((currentValue, index, arr) => currentValue.size !== 31);
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
      if (that.compareData(layerData, that
        .activeFloorData) && that.floorFinishStatus === "未完成") {
        that.loadingText = "楼层发布中...";
        that.mapLoading = true;
        // 发布
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
            that.mapLoading = false;
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
      // 如果楼层没有变动且状态为 未完成
      if (that.compareData(layerData, that
        .activeFloorData) && that.floorFinishStatus === "完成") {
        that
          .$confirm("是否切换状态为完成后发布？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            that.loadingText = "楼层发布中...";
            that.mapLoading = true;
            // 完成
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
                  that.floorFinishStatus = "未完成";
                  // 发布
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
                      that.mapLoading = false;
                      if (data4.code === 200) {
                        that.$message({
                          message: "发布成功",
                          type: "success"
                        });
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
                  that.mapLoading = false;
                }
              });
          }).catch(() => {
            that.mapLoading = false;
          });
        return;
      }
      // 如果楼层对比不同那么先保存再切换状态再发布
      if (!that.compareData(layerData, that.activeFloorData)) {
        that
          .$confirm("是否保存并切换状态为完成后发布？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            that.loadingText = "楼层发布中...";
            that.mapLoading = true;
            // 保存
            that.saveDataCallBack(() => {
              // 完成
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
                    that.floorFinishStatus = "未完成";
                    // 发布
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
                        that.mapLoading = false;
                        if (data2.code === 200) {
                          that.$message({
                            message: "发布成功",
                            type: "success"
                          });
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
                    that.mapLoading = false;
                  }
                });
            });
          }).catch(() => {
            that.mapLoading = false;
          });
      }
    },
    // 设置楼层完成
    floorFinishById() {
      var that = this;
      that.loadingText = "";
      that.mapLoading = true;

      function floorFinish(flag) {
        let url = "";
        // 1:完成2：未完成
        if (flag === 1) {
          that.loadingText = "设置楼层完成中...";
          url = that.apis.floorFinishById + that.activeFloorData.floorData.properties.id;
        } else if (flag === 2) {
          that.loadingText = "设置楼层未完成中...";
          url = that.apis.floorUnFinishById + that.activeFloorData.floorData.properties.id;
        }
        that
          .ajax({
            method: "post",
            url,
            data: {}
          })
          .then((res) => {
            const {
              data
            } = res;
            that.mapLoading = false;
            if (data.code === 200) {
              if (flag === 1) {
                that.floorFinishStatus = "未完成";
              }
              if (flag === 2) {
                that.floorFinishStatus = "完成";
              }
              that.$message({
                message: "操作成功",
                type: "success"
              });
            } else {
              that.$message({
                message: data.msg,
                type: "warning"
              });
            }
          }).catch(() => {
            that.mapLoading = false;
          });
      }

      // 检查是否符合条件
      that.isComplete(() => {
        const layerData = that.mapEditor.getSaveData();
        if (that.floorFinishStatus === "完成") {
          // 点击发布，判断地图是否已保存且状态为完成
          if (that.compareData(layerData, that.activeFloorData)) {
            floorFinish(1);
          } else {
            that.saveDataCallBack(() => {
              floorFinish(1);
            });
          }
        } else if (that.compareData(layerData, that.activeFloorData)) {
          floorFinish(2);
        } else {
          that.saveDataCallBack(() => {
            floorFinish(2);
          });
        }
      });
    },
    // 预览
    previewClick() {
      var that = this;
      const layerData = that.mapEditor.getSaveData();
      // 判断图层有没有变动如果没有则重新加载楼层
      if (that.compareData(layerData, that.activeFloorData)) {
        that.loadFloor();
      } else {
        // 判断图层有没有变动如果有则保存后重新加载楼层
        that.saveDataCallBack(() => {
          that.loadFloor();
          that.getFloorInfoById(that.activeFloorData.floorData.properties.id).then((
            floorInfo
          ) => {
            that.finishStatus = floorInfo.finishStatus;
            if (that.finishStatus) {
              that.floorFinishStatus = "未完成";
            } else {
              that.floorFinishStatus = "完成";
            }
          });
        });
      }
    },
    // 保存数据后的回调
    saveDataCallBack(fn) {
      var that = this;
      var obj = {};
      // 如果当前图层数据的楼层信息 为空对象说明 此时还没有经纬度信息无法绘制
      const layerData = that.mapEditor.getSaveData();
      // 如果当前图层数据的楼层信息 为空对象说明 此时还没有经纬度信息无法绘制
      if (JSON.stringify(layerData.floorData) === "{}") {
        that.mapLoading = false;
        return;
      }
      // 保存的时候直接把当前图层数据赋值给当前楼层数据
      that.activeFloorData.floorData = JSON.parse(JSON.stringify(layerData.floorData));
      that.activeFloorData.imageData.data = layerData.imageData.data;
      that.activeFloorData.imageData.extent = JSON.stringify(layerData.imageData.extent);
      that.activeFloorData.layerData = JSON.parse(JSON.stringify(layerData.layerData));
      const layerDataCopy = JSON.parse(JSON.stringify(layerData));
      layerDataCopy.imageData.data = encodeURIComponent(layerData.imageData.data);
      // 进行参数组装
      obj.id = that.buildingFloorsObj.id;
      obj.name = that.buildingFloorsObj.name;
      obj.floorsCounts = that.buildingFloorsObj.floorsCounts;
      obj.floors = {};
      obj.floors[that.activeFloorData.floorData.properties.floors] = layerDataCopy;
      that.mapLoading = true;
      that.loadingText = "数据保存中...";
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
          that.mapLoading = false;
          if (data.code === 200) {
            fn();
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        }).catch(() => {
          that.mapLoading = false;
        });
    },
    // 保存数据
    saveData() {
      var that = this;
      var obj = {};
      // 获取当前图层数据
      const layerData = that.mapEditor.getSaveData();
      // 如果当前图层数据的楼层信息 为空对象说明 此时还没有经纬度信息无法绘制
      if (JSON.stringify(layerData.floorData) === "{}") {
        that.mapLoading = false;
        return;
      }
      // 保存的时候直接把当前图层数据赋值给当前楼层数据
      that.activeFloorData.floorData = JSON.parse(JSON.stringify(layerData.floorData));
      that.activeFloorData.imageData.data = layerData.imageData.data;
      that.activeFloorData.imageData.extent = JSON.stringify(layerData.imageData.extent);
      that.activeFloorData.layerData = JSON.parse(JSON.stringify(layerData.layerData));
      const layerDataCopy = JSON.parse(JSON.stringify(layerData));
      layerDataCopy.imageData.data = encodeURIComponent(layerData.imageData.data);
      // 进行参数组装
      obj.id = that.buildingFloorsObj.id;
      obj.name = that.buildingFloorsObj.name;
      obj.floorsCounts = that.buildingFloorsObj.floorsCounts;
      obj.floors = {};
      obj.floors[that.activeFloorData.floorData.properties.floors] = layerDataCopy;
      that.mapLoading = true;
      that.loadingText = "数据保存中...";
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
          that.mapLoading = false;
          if (data.code === 200) {
            that.$message({
              message: "保存成功",
              type: "success"
            });
            // 保存成功后，获取状态进行展示
            that.getFloorInfoById(that.activeFloorData.floorData.properties.id).then((
              floorInfo
            ) => {
              that.finishStatus = floorInfo.finishStatus;
              if (that.finishStatus) {
                that.floorFinishStatus = "未完成";
              } else {
                that.floorFinishStatus = "完成";
              }
            });
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        }).catch(() => {
          that.mapLoading = false;
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
      // this.mapEditor.cancelDraw();
    },
    // 创建样式成功调用方法
    createStyleSuccess() {
      this.createStyleModal = false;
      this.editStyleModal = false;
      // 重新获取样式列表
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
    // 展开图标
    addIconClick() {
      var that = this;
      that.allIconModal = true;
      const [obj] = that.allIconsArr;
      that.iconPreview = obj;
    },
    // 图标管理
    commonIconClick(item, index) {
      var that = this;
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
      that.selectedElement = emptyObj;
      // 如果当前选中，那就取消绘制
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
      // 调用gis绘制图标
      that.mapEditor.drawPoint({
        img: item.imgPath,
        size: 30
      });
    },
    // 全选楼梯变动监听
    goFloorNumAllChange(isAll) {
      var that = this;
      // 判断是不是全选
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
      // 判断有没有选中
      if (that.styleTableSelectedArr.length === 0) {
        that.$message({
          message: "请选择要编辑的样式",
          type: "warning"
        });
        return;
      }
      // 判断有没有多选
      if (that.styleTableSelectedArr.length > 1) {
        that.$message({
          message: "只能选择一个要编辑的样式",
          type: "warning"
        });
        return;
      }
      that.editStyleModal = true;
      that.$nextTick(() => {
        // 调用编辑样式组件的初始化方法
        that.$refs.editStyle.init(that.styleTableSelectedArr[0]);
      });
    },
    // 新建样式
    createStyleClick() {
      var that = this;
      that.createStyleModal = true;
      that.$nextTick(() => {
        // 调用创建样式组件的初始化方法
        that.$refs.createStyle.init();
      });
    },
    // 监听样式选择器变动，重新给选中的元素赋值
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
      that.selectedElement.value.styleID = styleIndex;
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
        that.selectedElement.value.styleID = style.id;
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
    // 监听要素color变动，重新给选中的元素赋值
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
    // 监听要素name变动，重新给选中的元素赋值
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
      // 获取面元素的数据
      that.dataChartData = that.mapEditor.getData("polygon");
      // 获取点元素的数据
      const arrs = that.mapEditor.getData("point");
      // 过滤poi的数据
      that.dataChartPOIData = arrs.filter((currentValue, index, arr) => currentValue.size !== 31);
    },

    // 路径-绘制要素
    facilitieFloorClick(item) {
      var that = this;
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
      that.selectedElement = emptyObj;
      // 如果当前选中则取消绘制
      if (that.drawActiveLine === item.drawActiveLine) {
        that.drawActiveLine = "";
        that.isDrawLine = false;
        that.mapEditor.cancelDraw();
        return;
      }
      // 绘制楼梯
      that.mapEditor.drawPoint({
        img: item.img,
        size: 31
      });
      that.isDrawfacibility = true;
      that.floorNumTitle = item.floorNumTitle;
      that.drawActiveLine = item.drawActiveLine;
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
      // 设置建筑物轮廓隐藏
      that.mapEditor.setLayerDisplay("build", false);
      // /选择要素回调事件
      that.mapEditor.selectFeature((e) => {
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
        // 如果当前选择的元素为null
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
          that.selectedElement = emptyObj;
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
          // 如果图标的size等于31说明是楼梯元素
          if (e.value.size === 31) {
            that.facilityTypeTarget = e;
            that.facilityToFloor = that.facilityTypeTarget.value.targetFloor;
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
        that.targetDrawedElement = e;

        // 绘制多边形的时候
        if (e.layername === "多边形图层") {
          that.selectedElement = e;
          that.selectedElement.value.height = that.elementHeight;
          // 更改元素属性
          setTimeout(() => {
            that.mapEditor.addFeatureById("polygon", e.id, "height", that.elementHeight);
            that.mapEditor.addFeatureById("polygon", e.id, "width", 1);
            if (that.preDrawStyle) {
              that.mapEditor.addFeatureById("polygon", e.id, "styleID", that.preDrawStyle);
            }

            that.mapEditor.cancelDraw();
            that.drawActiveType = "";
          });
        }
        if (e.layername === "POI图层") {
          if (that.tabNum === 2) {
            that.facilityTypeTarget = e;
          }

          setTimeout(() => {
            that.mapEditor.addFeatureById("point", e.id, "name", that.iconName);
            that.mapEditor.addFeatureById("point", e.id, "height", 1);
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
            that.mapEditor.addFeatureById("polygon", e.id, "width", 1);
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
      // 初始化地图
      that.newMap(mapData);
      that.activeFloor = "";
      // 加载楼层信息
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
      // 设置当前元素为空的元素
      that.selectedElement = emptyObj;
      // 判断是不是在画线元素，如果是
      if (that.isDrawLine) {
        // 清空线元素
        that.drawActiveLine = "";
        that.isDrawLine = false;
        // 取消绘制
        that.mapEditor.cancelDraw();
        return;
      }
      that.isDrawLine = true;
      that.drawActiveLine = "";
      // 绘制线元素
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
      // 如果当前是按钮是绘制状态，那么结束绘制
      if (that.drawActiveType === 1) {
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.mapEditor.cancelDraw();
        return;
      }
      // 设置为选中状态
      that.drawActiveType = 1;
      // 清空图标选中状态
      that.iconActiveNum = "";
      that.elementStyleList.forEach((item) => {
        if (item.id === that.preDrawStyle) {
          style = item;
        }
      });
      // 如果样式存在
      if (style) {
        obj = {
          name: "",
          styleID: style.id,
          fillColor: style.fillColor,
          borderColor: style.fillColor,
          fontFillColor: "rgba(255,255,255,1)",
          fontBorderColor: "rgba(0,0,0,1)",
          borderWidth: 0,
          width: 0
        };
        // 调用gis绘制
        that.mapEditor.drawBox(obj);
        return;
      }
      // 如果没有样式，按默认样式绘制
      that.mapEditor.drawBox({
        name: "",
        width: 1,
        fillColor: "rgba(255,255,255,0.3)",
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
      // 如果当前是按钮是绘制状态，那么结束绘制
      if (that.drawActiveType === 3) {
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.mapEditor.cancelDraw();
        return;
      }
      // 清空图标选中状态
      that.iconActiveNum = "";
      that.selectedElement.id = "";
      // 设置为选中状态
      that.drawActiveType = 3;
      // 循环样式列表
      that.elementStyleList.forEach((item) => {
        if (item.id === that.preDrawStyle) {
          style = item;
        }
      });
      // 如果样式存在
      if (style) {
        obj = {
          name: "",
          styleID: style.id,
          fillColor: style.fillColor,
          borderColor: style.fillColor,
          width: 0,
          fontFillColor: "rgba(255,255,255,1)",
          fontBorderColor: "rgba(0,0,0,1)"
        };
        // 调用gis绘制
        that.mapEditor.drawPolygon(obj);
        return;
      }
      // 如果没有样式，按默认样式绘制
      that.mapEditor.drawPolygon({
        name: "",
        width: 1,
        fillColor: "rgba(255,255,255,0.3)",
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
      // 如果当前是按钮是绘制状态，那么结束绘制
      if (that.drawActiveType === 2) {
        that.drawActiveType = "";
        that.iconActiveNum = "";
        that.mapEditor.cancelDraw();
        return;
      }
      // 清空图标选中状态
      that.iconActiveNum = "";
      // 设置为选中状态
      that.drawActiveType = 2;
      // 循环样式列表
      that.elementStyleList.forEach((item) => {
        // 如果当前选中的样式id和当前循环的id先等
        if (item.id === that.preDrawStyle) {
          // 把样式相关属性赋值给style
          style = item;
        }
      });
      // 如果样式存在
      if (style) {
        obj = {
          name: "",
          styleID: style.id,
          fillColor: style.fillColor,
          borderColor: style.fillColor,
          borderWidth: 0,
          width: 0,
          fontFillColor: "rgba(255,255,255,1)",
          fontBorderColor: "rgba(0,0,0,1)"
        };
        // 调用gis绘制圆形
        that.mapEditor.drawCircle(obj);
        return;
      }
      // 如果没有样式，按默认样式绘制
      that.mapEditor.drawCircle({
        name: "",
        width: 1,
        fillColor: "rgba(255,255,255,0.3)",
        borderColor: "rgba(0,0,0,1)",
        fontSize: 12,
        fontFillColor: "rgba(255,255,255,1)",
        fontBorderColor: "rgba(0,0,0,1)"
      });
    },
    // 取消绘制
    canceldraw() {
      var that = this;
      // 调用gis取消绘制
      that.mapEditor.cancelDraw();
      that.drawActiveType = "";
    },
    // 点击-设置楼层信息
    setFloorInfoClick() {
      var that = this;
      that.setFloorInfoModal = true;
      that.$nextTick(() => {
        // 调用设置楼层组件的初始化方法
        that.$refs.setFloorInfo.init({
          id: that.activeFloorData.floorData.properties.id
        });
      });
    },

    // 保存楼层信息成功
    setFloorInfoSuccess(id) {
      var that = this;
      var imgUrl = "";
      that.mapLoading = true;
      that.loadingText = "数据保存中...";
      // 获取楼层信息
      that.getFloorInfoById(id).then((res) => {
        // 拼装图片url
        imgUrl = `/files/img/${res.planarGraph}`;
        // 如果楼层中有对角线经纬度信息
        if (res.upperLeftCornerLongitude && res.upperLeftCornerLatitude && res
          .lowerRightCornerLongitude && res.lowerRightCornerLatitude) {
          that.$message({
            message: "楼层信息设置成功",
            type: "success"
          });
          that.mapLoading = false;
          const left = [res.upperLeftCornerLongitude, res
            .upperLeftCornerLatitude
          ];
          const right = [res.lowerRightCornerLongitude, res
            .lowerRightCornerLatitude
          ];
          that.hasUnderPainting = true;
          // 设置轮廓信息
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
              id: that.activeFloorData.floorData.properties.id,
              name: `${that.activeFloorData.floorData.properties.floors}`,
              floors: that.activeFloorData.floorData.properties.floors,
              styleID: null,
              width: 2,
              fillColor: "rgba(217,237,253,.1)",
              borderColor: "rgba(0,153,255,.5)"
            }
          });
          const img = new Image();
          img.src = imgUrl;
          that.mapLoading = true;
          img.onload = () => {
            // 获取图片的默认位置
            const data = that.mapEditor.defaultImageData(img, that.imgFix);
            // 上传base64编码
            that.uploadBase64(data.data, (url) => {
              // 设置底图
              that.mapEditor.setImageData({
                data: url,
                extent: data.extent
              });
              // 保存当前图层信息
              that.saveDataCallBack(() => {
                that.mapLoading = false;
              });
            });
          };
          // 图片加载失败
          img.onerror = () => {
            that.$message({
              message: "图片加载失败",
              type: "warning"
            });
            that.mapLoading = false;
          };
        }
        // 如果没有经纬度信息，判断有没有轮廓信息
        if (res.floorOutline) {
          const floorOutline = JSON.parse(res.floorOutline);
          const coordinates = [];
          const lngArr = [];
          const latArr = [];
          // 轮廓的路径
          floorOutline.forEach((item) => {
            lngArr.push(+item.lng);
            latArr.push(+item.lat);
            coordinates.push([item.lng, item.lat]);
          });
          // 获取最大经纬度   最小经纬度
          const bigLng = Math.max(...lngArr);
          const bigLat = Math.max(...latArr);
          const smallLng = Math.min(...lngArr);
          const smallLat = Math.min(...latArr);
          const small = [smallLng, smallLat];
          const big = [bigLng, bigLat];
          that.hasUnderPainting = true;
          // 设置轮廓
          that.mapEditor.setBuildData({
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                coordinates
              ]
            },
            properties: {
              id: that.activeFloorData.floorData.properties.id,
              name: `${that.activeFloorData.floorData.properties.floors}`,
              floors: that.activeFloorData.floorData.properties.floors,
              styleID: null,
              width: 2,
              fillColor: "rgba(217,237,253,.1)",
              borderColor: "rgba(0,153,255,.5)"
            }
          });
          // 如果没有对角线经纬度
          if (!res.upperLeftCornerLongitude && !res.upperLeftCornerLatitude && !res
            .lowerRightCornerLongitude && !res.lowerRightCornerLatitude) {
            const img = new Image();
            img.src = imgUrl;
            that.mapLoading = true;
            img.onload = () => {
              // 获取图片的默认位置
              const data = that.mapEditor.defaultImageData(img, that.imgFix);
              // 上传base64编码
              that.uploadBase64(data.data, (url) => {
                // 设置底层图片
                that.mapEditor.setImageData({
                  data: url,
                  extent: data.extent
                });
                that.$message({
                  message: "请点击调整平面图，根据轮廓进行调整",
                  type: "warning"
                });
                // 保存相关信息
                that.saveDataCallBack(() => {
                  that.mapLoading = false;
                });
              });
            };
            // 图片加载失败
            img.onerror = () => {
              that.$message({
                message: "图片加载失败",
                type: "warning"
              });
              that.mapLoading = false;
            };
          } else {
            // 保存当前图层信息
            that.saveDataCallBack(() => {
              that.mapLoading = false;
            });
          }
        }

        // if (res.upperLeftCornerLongitude && res.upperLeftCornerLatitude && res
        //   .lowerRightCornerLongitude && res.lowerRightCornerLatitude && !res.floorOutline) {
        //   // that.saveDataCallBack(() => {
        //   //   that.mapLoading = false;
        //   // });
        // }
        // 如果没有经纬度信息
        if (!res.upperLeftCornerLongitude && !res.upperLeftCornerLatitude && !res
          .lowerRightCornerLongitude && !res.lowerRightCornerLatitude && !res.floorOutline) {
          that.$message({
            message: "当前楼层不具备经纬度信息，将不能发布",
            type: "warning"
          });
          that.mapLoading = false;
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
            that.allIconsArr = data.data;
            // 常用图标
            that.showIconsArr = data.data.filter(({ common }) => common);
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 左上角-返回上一页
    back() {
      var that = this;
      const layerData = that.mapEditor.getSaveData();
      if (!that.compareData(layerData, that.activeFloorData)) {
        that
          .$confirm("绘制内容尚未保存", "提示", {
            confirmButtonText: "保存后离开",
            cancelButtonText: "离开",
            type: "warning",
            distinguishCancelAndClose: true,
            callback(action, instance) {
              if (action === "confirm") {
                that.saveDataCallBack(() => {
                  that.$message({
                    message: "保存成功",
                    type: "success"
                  });
                  setTimeout(() => {
                    window.history.back();
                  }, 800);
                });
              }
              if (action === "cancel") {
                window.history.back();
              }
            }
          });
      } else {
        window.history.back();
      }
    },
    // 监听楼层变动
    floorChange(e) {
      var that = this;
      setTimeout(() => {
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
        // 获取地图的图层信息
        const layerData = that.mapEditor.getSaveData();
        // 以前的楼层
        let oldfloor = "";
        // 缓存楼层变动数组如果长度大于等于2
        if (that.activeFloorArrCache.length >= 2) {
          // 以前的楼层等于缓存楼层变动数组的最后一个
          oldfloor = that.activeFloorArrCache[that.activeFloorArrCache.length - 2];
        } else {
          // 如果小于2
          [oldfloor] = that.activeFloorArrCache;
        }
        // 当前的楼层先等于以前的楼层
        that.activeFloor = oldfloor;
        // 判断图层有没有变动，如果有变动
        if (!that.compareData(layerData, that.activeFloorData)) {
          that
            .$confirm("绘制内容尚未保存", "提示", {
              confirmButtonText: "保存后离开",
              cancelButtonText: "离开",
              type: "warning",
              distinguishCancelAndClose: true,
              callback(action, instance) {
                // 点击“保存后离开”
                if (action === "confirm") {
                  // 保存数据
                  that.saveData();
                  // 清空目标对象
                  that.selectedElement = emptyObj;
                  // 清空路径对象
                  that.facilityTypeTarget = emptyObj;
                  that.adjustImageWord = "调整平面图";
                  // 赋值当前楼层
                  that.activeFloor = e;
                  // 赋值当前楼层数据
                  that.activeFloorData = that.buildingFloorsObj.floors[e];
                }
                // 点击“离开”
                if (action === "cancel") {
                  // 清空目标对象
                  that.selectedElement = emptyObj;
                  // 清空路径对象
                  that.facilityTypeTarget = emptyObj;
                  that.adjustImageWord = "调整平面图";
                  // 赋值当前楼层
                  that.activeFloor = e;
                  // 赋值当前楼层数据
                  that.activeFloorData = that.buildingFloorsObj.floors[e];
                }
                // 点击“关闭”
                if (action === "close") {
                  // 还是指向当前楼层
                  that.activeFloor = oldfloor;
                }
              }
            });
        } else {
          // 清空目标对象
          that.selectedElement = emptyObj;
          // 清空路径对象
          that.facilityTypeTarget = emptyObj;
          that.adjustImageWord = "调整平面图";
          // 赋值当前楼层
          that.activeFloor = e;
          // 赋值当前楼层数据
          that.activeFloorData = that.buildingFloorsObj.floors[e];
        }
      });
    },

    // 全选楼层
    floorCheck() {
      var that = this;
      // 如果到达的楼层数等于所有楼层数，那么清空到达楼层
      if (that.floorArr.length === that.goFloorArr.length) {
        that.goFloorArr = [];
      } else {
        // 如果不等于，那么先清空到达楼层，再重新把所有楼层都赋值给到达楼层
        that.goFloorArr = [];
        that.floorArr.forEach((item) => {
          that.goFloorArr.push(item.value);
        });
      }
    },

    // 加载楼层信息
    loadFloor() {
      var that = this;
      that.mapLoading = true;
      that.loadingText = "数据加载中...";
      that
        .ajax({
          method: "get",
          url: that.apis.loadFloor + that.buildObj.id,
          data: ""
        })
        .then((res) => {
          that.mapLoading = false;
          const {
            data
          } = res;
          if (data.code === 200) {
            // 排序好的楼层
            const floors = [];
            that.buildingFloorsObj = data.data;
            // 最终排序好的楼层
            that.floorArr = [];
            // 楼层楼号缓存数组
            const numArr = [];
            // 循环楼层
            Object.keys(that.buildingFloorsObj.floors).forEach((floor) => {
              const num = +floor;
              numArr.push(num);
            });
            // 对楼层进行倒序排序
            numArr.sort((a, b) => b - a);
            // 循环楼层
            numArr.forEach((item) => {
              const key = `${item}`;
              Object.keys(that.buildingFloorsObj.floors).forEach((floorKey) => {
                // 排序好的楼层等于返回的楼层
                if (floorKey === key) {
                  const obj = {};
                  obj[floorKey] = that.buildingFloorsObj.floors[floorKey];
                  floors.push(obj);
                }
              });
            });
            // 排序好的新楼层数组循环
            floors.forEach((item) => {
              Object.keys(item).forEach((key) => {
                const floorKey = +key;
                let strKey = "";
                // 把阿拉伯数字转成通用楼层展示
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
            // 判断有没有目标楼层，如果没有
            if (!that.activeFloor) {
              // 判断有没有一层，有的话默认展示一层，如果没有展示负一层
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
