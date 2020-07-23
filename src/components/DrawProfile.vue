<template>
  <div class="draw">
    <div :id="mapId" :style="mapStyle"></div>
    <div class="rightTopButtonCon">
      <Poptip title trigger="hover" content="单击开始，双击结束" placement="bottom">
        <el-button size="mini" class="button" @click="drawClick" type="primary">绘制</el-button>
      </Poptip>
      <Poptip title trigger="hover" content="绘制完统一保存" placement="bottom">
        <el-button size="mini" class="button" @click="saveClick" type="primary">保存</el-button>
      </Poptip>
      <el-button size="mini" class="button" @click="quitClick" type="primary">退出</el-button>
    </div>
    <div class="middleTopButtonCon" :style="{width:floorConWidth}">
      <div class="floorNumCon">
        <div
          @click="floorNumClick(item)"
          class="floorNum"
          v-for="item in floorArr"
          :key="item"
          :class="{floorNumActive:item==activeFloorNum,hasFloorData:hasFloorDatafn(item)}"
        >{{editNum(item)}}</div>
      </div>
    </div>
    <div id="r-result">
      <Input
        v-model="searchValue"
        placeholder="请输入..."
        @on-change="searchValueChange"
        style="width:250px"
      />
      <div
        id="searchResultPanel"
        style="border:1px solid black;width:150px;height:auto;display:none"
      ></div>

      <div class="resultList" v-if="searchResultShow">
        <div
          class="searchItem"
          v-for="item in searchResult"
          @click="searchItemClick(item)"
          :key="item.uid"
        >{{item.title}}</div>
      </div>
    </div>
  </div>
</template>

<script>
// 下面注释不可删除，这是针对eslint的
/* global BMap howso BMAP_ANCHOR_TOP_LEFT BMapLib BMAP_DRAWING_POLYGON :true */
export default {
  name: "DrawProfile",
  props: {
    msg: String
  },
  data() {
    return {
      // mapid
      mapId: "map",
      // 根据屏幕宽高初始化地图宽高
      mapStyle: { width: "", height: "" },
      // 搜索框的值
      searchValue: "",
      // 搜索的结果列表
      searchResult: [],
      // 搜索的结果列表的展示
      searchResultShow: false,
      // 实例化的地图对象
      map: "",
      // 被点击的结果名称
      clickedTitle: "",
      // 绘制图层的缓存对象 楼层为Key  图层为 value
      cacheOverlays: {},
      // 室内地图实例化对象
      indoorManager: "",
      // 绘制图层的数据存储对象 楼层为Key  数据为 value
      floorData: {},
      // 当前的楼层
      currentFloor: "",
      // 实例化鼠标绘制工具
      drawingManager: "",
      // 是不是已经保存
      isSave: false,
      // 编辑时传过来的数据
      editOutLine: "",
      // 是否从设置楼层信息过来
      fromSet: false,
      // 是否是第一次渲染
      isFirstPaint: true,
      // 楼号
      floorArr: [],
      // 当前楼层号
      activeFloorNum: "",
      // 有数据的楼层
      hasDataFloorArr: [],
      // 包含楼层容器的宽度
      floorConWidth: ""
    };
  },
  watch: {
    // 监听当前楼层号变动
    activeFloorNum(floor) {
      var that = this;
      // 清空覆盖物
      that.map.clearOverlays();
      // 如果楼层有轮廓信息
      if (that.floorData[floor]) {
        // 计算轮廓的中心点经纬度
        const lngArr = [];
        const latArr = [];
        that.floorData[floor].forEach((item) => {
          lngArr.push(item.lng);
          latArr.push(item.lat);
        });
        const bigLng = Math.max(...lngArr);
        const bigLat = Math.max(...latArr);
        const smallLng = Math.min(...lngArr);
        const smallLat = Math.min(...latArr);
        // 移动到中心点
        that.map.panTo(
          new BMap.Point((bigLng + smallLng) / 2, (bigLat + smallLat) / 2)
        );
        // 设置缩放级别
        that.map.setZoom(17);
        // 绘制轮廓
        that.createPolygon(that.floorData[floor]);
      }
    }
  },
  methods: {
    // 格式化数字例 B1 -1
    editNum(num) {
      if (num.indexOf("F") > -1) {
        return num.replace("F", "");
      }
      if (num.indexOf("B") > -1) {
        return -num.replace("B", "");
      }
      return num;
    },
    // 点击楼层号
    floorNumClick(num) {
      var that = this;
      // 赋值
      that.activeFloorNum = num;
    },
    // 判断当前楼层是否有轮廓信息
    hasFloorDatafn(item) {
      return this.hasDataFloorArr.indexOf(item) > -1;
    },
    // 根据经纬度绘制多边形
    createPolygon(data) {
      var that = this;
      // 声明经纬度数组
      var arr = [];
      // 绘制前清空覆盖物
      that.map.clearOverlays();
      // 循环传进来的经纬度，把转换好的经纬度放到arr数组里
      data.forEach((item) => {
        arr.push(new BMap.Point(item.lng, item.lat));
      });
      // 声明轮廓的样式
      const styleOptions = {
        strokeColor: "red",
        fillColor: "red",
        strokeWeight: 1,
        strokeOpacity: 0.9,
        fillOpacity: 0.1,
        strokeStyle: "solid"
      };
      // 调用百度api绘制多边形
      const polygon = new BMap.Polygon(arr, styleOptions);
      // 把图层加入到地图中
      that.map.addOverlay(polygon);
    },
    // 被其他页面调用时，清空数据
    initData(initParam) {
      var that = this;
      // 判断当前地图id是否等于map,如果不等于
      if (that.mapId !== "map") {
        // 获取地图dom
        const mapdom = document.getElementById(that.mapId);
        // 如果存在清空内容
        if (mapdom) {
          mapdom.innerHTML = "";
        }
      }
      // 清空楼层数组
      that.floorArr = [];
      // 清空当前楼层
      that.activeFloorNum = "";
      // 清空有值的楼层数组
      that.hasDataFloorArr = [];
      // 如果传进来的有楼层数组，进行赋值渲染
      if (initParam.floorArr) {
        that.floorArr = initParam.floorArr;
      }
      // 创建地图id ，当打开多个窗口时，保证地图的id都是不同的
      that.mapId = `map${Math.round(Math.random() * 1000000)}`;
      that.$nextTick(() => {
        // 进行初始化
        // copy一份参数
        var initObj = JSON.parse(JSON.stringify(initParam));
        // 清空搜索值
        that.searchValue = "";
        // 清空搜索结果列表
        that.searchResult = [];
        // 设置搜索结果展示为false
        that.searchResultShow = false;
        // 设置首次渲染为true
        that.isFirstPaint = true;
        // 设置map对象为空
        that.map = "";
        // 设置缓存的图层对象为空
        that.cacheOverlays = {};
        // 设置室内图为空
        that.indoorManager = "";
        // 设置楼层对象为空
        that.floorData = {};
        // 设置当前楼层为空
        that.currentFloor = "";
        // 设置编辑轮廓为空
        that.editOutLine = "";
        // 赋值是否从设置楼层信息进入本组件
        that.fromSet = initParam.fromSet;
        // 执行初始化方法
        that.init(initObj.address, () => {
          // 如果楼层只有一层，那么默认设置为选中状态
          if (that.floorArr.length === 1) {
            const [num] = that.floorArr;
            that.activeFloorNum = num;
          }
          // 判断是否传过来轮廓的经纬度
          if (initObj.editOutLine) {
            // 设置是否保存为true
            that.isSave = true;
            // 声明i计数
            let i = 0;
            // 实例化经纬度转换对象
            const convert = new howso.CoordConvert();
            // 赋值经纬度信息
            that.editOutLine = initObj.editOutLine;
            // 循环经纬度信息
            Object.keys(that.editOutLine).forEach((key) => {
              // 如果值存在
              if (that.editOutLine[key]) {
                // 如果类型为字符串类型，转为json
                if (typeof that.editOutLine[key] === "string") {
                  that.floorData[key] = JSON.parse(that.editOutLine[key]);
                }
                // 如果有值的话就加1
                i += 1;
                // 转换经纬度，把wgs84坐标系转为百度坐标系
                that.floorData[key].forEach((kkk, num) => {
                  const gcj = convert.wgs84_To_gcj02(kkk.lng, kkk.lat);
                  that.floorData[key][num] = convert.gcj02_To_bd09(
                    gcj.lng,
                    gcj.lat
                  );
                });
                // 重新进行赋值
                that.editOutLine[key] = JSON.stringify(that.floorData[key]);
              }
            });
            // 如果i等于0，说明传进来的轮廓中没有值，无需进行下一步，程序停止
            if (i === 0) {
              return;
            }
            // 声明经度数组，纬度数组来计算中心的经纬度
            const lngArr = [];
            const latArr = [];
            // 把值赋值给floorData
            Object.keys(that.floorData).forEach((key) => {
              if (that.floorData[key]) {
                // 如果这个楼层有值，就把楼层号放到有值楼层数组里
                that.hasDataFloorArr.push(key);
                that.floorData[key].forEach((item) => {
                  lngArr.push(item.lng);
                  latArr.push(item.lat);
                });
              }
            });
            setTimeout(() => {
              const bigLng = Math.max(...lngArr);
              const bigLat = Math.max(...latArr);
              const smallLng = Math.min(...lngArr);
              const smallLat = Math.min(...latArr);
              that.map.panTo(
                new BMap.Point((bigLng + smallLng) / 2, (bigLat + smallLat) / 2)
              );
              that.map.setZoom(17);
              // 这一步的目的是如果有室内图，可以让室内图加载
              setTimeout(() => {
                that.map.panTo(
                  new BMap.Point(
                    (bigLng + smallLng) / 2 + 0.0006,
                    (bigLat + smallLat) / 2
                  )
                );
                that.map.setZoom(17);
              }, 500);
            }, 1000);
            // 当只有一层楼的情况
            if (Object.keys(that.floorData).length === 1) {
              Object.keys(that.floorData).forEach((floorNum) => {
                that.activeFloorNum = floorNum;
                if (that.floorData[floorNum]) {
                  that.createPolygon(that.floorData[floorNum]);
                }
              });
              return;
            }
            // 默认渲染F1层
            if (that.floorData.F1) {
              if (that.floorData.F1) {
                that.activeFloorNum = "F1";
                that.createPolygon(that.floorData.F1);
              }
            }
            // 如果没有F1层有B1层，就渲染B1层
            if (!that.floorData.F1 && that.floorData.B1) {
              if (that.floorData.B1) {
                that.activeFloorNum = "B1";
                that.createPolygon(that.floorData.B1);
              }
            }
          }
        });
      });
    },

    // 初始化地图
    init(area, fn) {
      var that = this;
      // 初始化地图宽高
      that.mapStyle.width = `${window.innerWidth - 35}px`;
      that.mapStyle.height = `${window.innerHeight - 85}px`;
      that.floorConWidth = `${window.innerWidth - 895}px`;
      window.onresize = () => {
        that.mapStyle.width = `${window.innerWidth - 35}px`;
        that.mapStyle.height = `${window.innerHeight - 85}px`;
        that.floorConWidth = `${window.innerWidth - 895}px`;
      };
      // 创建Map实例
      const map = new BMap.Map(that.mapId, { enableMapClick: false });
      // 把map示例赋值给this.map
      that.map = map;

      // 下面代码是为了拾取经纬度

      // that.map.addEventListener("click", (e) => {
      //   //console.log("百度坐标",e.point.lng + "," + e.point.lat);
      //   // const convert = new howso.CoordConvert();
      //   // const gcj = convert.bd09_To_gcj02(e.point.lng, e.point.lat);
      //   // console.log("wgs坐标", convert.gcj02_To_wgs84(gcj.lng, gcj.lat));
      //   console.log(that.map.getZoom());
      // });
      // 左上角，添加默认缩放平移控件
      const topLeftNavigation = new BMap.NavigationControl();
      // 左上角，添加比例尺
      const topLeftLontrol = new BMap.ScaleControl({
        anchor: BMAP_ANCHOR_TOP_LEFT
      });
      that.map.addControl(topLeftLontrol);
      that.map.addControl(topLeftNavigation);
      // 设置地图中心点和缩放层级
      that.map.centerAndZoom(area, 15);
      // 开启鼠标滚轮缩放
      that.map.enableScrollWheelZoom();
      // 创建室内图实例
      that.indoorManager = new BMapLib.IndoorManager(that.map);
      // 执行函数
      fn();
    },
    // 监听输入框值的变化
    searchValueChange(val) {
      var that = this;
      // 把输入框的值赋值给searchValue
      that.searchValue = val.target.value;
      // 如果被点击的结果名称等于输入框的值
      if (that.clickedTitle === that.searchValue) {
        return;
      }
      // 执行搜索
      that.search();
    },
    // 搜索结果框中的选项点击事件
    searchItemClick(item) {
      var that = this;
      // 定位地图中心
      that.map.centerAndZoom(item.point, 18);
      that.clickedTitle = item.title;
      that.searchValue = item.title;
      that.searchResultShow = false;
    },
    // 搜索方法
    search() {
      var that = this;
      var { map } = that;
      var local = "";
      // 清除地图上的所有覆盖物
      map.clearOverlays();
      // 搜索的回调函数
      function myFun() {
        // 获取搜索列表
        const result = local.getResults();
        if (result) {
          let targetArr = [];
          // 循环搜索列表，拿到结果数据
          Object.keys(result).forEach((key) => {
            // 判断是不是数组
            if (
              Object.prototype.toString.call(result[key]) === "[object Array]"
            ) {
              // 如果是数组，里面是否有值
              if (result[key].length > 0) {
                // 如果有值的话，是否第一项有address的属性
                if (result[key][0].address) {
                  targetArr = result[key];
                }
              }
            }
          });
          // 赋值
          that.searchResult = targetArr;
        } else {
          // 如果不存在则设置为空
          that.searchResult = [];
        }
        // 如果长度为0，则不展示结果
        if (that.searchResult.length === 0) {
          that.searchResultShow = false;
        } else {
          that.searchResultShow = true;
        }
        // 如果搜索值不为空，结果列表等于0，提示用户
        if (that.searchResult.length === 0 && that.searchValue !== "") {
          that.$Message.info("查询不到结果");
        }
      }
      // 实例化搜索对象
      local = new BMap.LocalSearch(map, {
        onSearchComplete: myFun
      });
      // 执行搜索方法
      local.search(that.searchValue);
    },
    // 清除所有楼层对应的图层
    clearAll() {
      var that = this;
      var keys = Object.keys(that.cacheOverlays);
      keys.forEach((key) => {
        that.map.removeOverlay(that.cacheOverlays[key]);
      });
    },
    // 画折现的方法
    drawClick() {
      var that = this;
      // 判断有没有点击需要绘制的楼层
      if (!that.activeFloorNum) {
        that.$message({
          message: "请点击需要绘制的楼层",
          type: "warning"
        });
        return;
      }
      // 清空所有图层
      that.map.clearOverlays();
      // 编辑时
      if (that.editOutLine) {
        // 拿到已经绘制好轮廓的楼层
        const keys = Object.keys(that.floorData);
      }
      // 获取当前楼层
      that.currentFloor = that.activeFloorNum;
      // 绘制结束回调方法
      const overlaycomplete = (e) => {
        let targetArr = [];
        that.isFirstPaint = false;
        // 查找哪个属性里面有经纬度信息
        Object.keys(e.overlay).forEach((key) => {
          // 先判断哪个属性值是数组
          if (
            Object.prototype.toString.call(e.overlay[key]) === "[object Array]"
          ) {
            // 判断数组里是否有值
            if (e.overlay[key].length > 0 && e.overlay[key][0]) {
              const arr = e.overlay[key];
              // 判断数组的最后一项和第一项是否相等
              if (
                arr[0].lng === arr[arr.length - 1].lng
                && arr[0].lat === arr[arr.length - 1].lat
              ) {
                targetArr = arr;
              }
            }
          }
        });
        // 把获取的经纬度值赋值
        that.activeLonLatData = targetArr;
        // 获取当前楼层
        const { currentFloor } = that;
        // 把当前图层放到缓存图层数组
        that.cacheOverlays[currentFloor] = e.overlay;
        // 把当前楼层经纬度放到楼层对象中
        that.floorData[currentFloor] = that.activeLonLatData;
        // 有值的楼层数组加入当前楼层
        that.hasDataFloorArr.push(currentFloor);
        // 设置是否保存为否
        that.isSave = false;
      };
      // 线的样式
      const styleOptions = {
        strokeColor: "red",
        fillColor: "red",
        strokeWeight: 1,
        strokeOpacity: 0.9,
        fillOpacity: 0.1,
        strokeStyle: "solid"
      };
      // 实例化鼠标绘制工具
      that.drawingManager = new BMapLib.DrawingManager(this.map, {
        enableDrawingTool: false,
        polygonOptions: styleOptions
      });
      that.drawingManager.open();
      // 指定画的类型--多边形
      that.drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON);
      // 添加鼠标绘制工具监听事件，用于获取绘制结果
      that.drawingManager.addEventListener("overlaycomplete", overlaycomplete);
    },
    // 保存事件
    saveClick() {
      var that = this;
      // 赋值楼层信息对象
      const floorDataCopy = JSON.parse(JSON.stringify(that.floorData));
      // 楼层数组
      const kes = Object.keys(floorDataCopy);
      // 判断楼层数是否等于0,如果等于0，提示用户先进行绘制
      if (kes.length === 0) {
        that.$message({
          message: "请先绘制轮廓",
          type: "warning"
        });
        return;
      }
      that.$message({
        message: "数据保存成功",
        type: "success"
      });
      // 设置是否保存的值为true
      that.isSave = true;
      // 获取经纬度转换对象，把百度经纬度转换成wgs84坐标经纬度
      const convert = new howso.CoordConvert();
      kes.forEach((item) => {
        const { length } = floorDataCopy[item];
        const first = floorDataCopy[item][0];
        const last = floorDataCopy[item][floorDataCopy[item].length - 1];
        if (first.lng !== last.lng || first.lat !== last.lat) {
          floorDataCopy[item].push(floorDataCopy[item][0]);
        }
        floorDataCopy[item].forEach((floor, index) => {
          const gcj = convert.bd09_To_gcj02(floor.lng, floor.lat);
          floorDataCopy[item][index] = convert.gcj02_To_wgs84(gcj.lng, gcj.lat);
        });
      });
      that.$emit("save", floorDataCopy);
    },
    // 退出操作
    quitClick() {
      var that = this;
      // 获取楼层对象中的楼层
      var floors = Object.keys(that.floorData);
      // 如果没有保存并且楼层数大于0，进行询问
      if (!that.isSave && floors.length > 0) {
        that
          .$confirm("您绘制的数据还没有保存，确认退出?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
          .then(() => {
            that.$emit("quit");
          })
          .catch(() => {
            that.$message({
              type: "info",
              message: "已取消"
            });
          });
      } else {
        that.$emit("quit");
      }
    }
  }
};
</script>

<style scoped >
#map {
  width: 100%;
  height: 100%;
  border: 1px solid hsl(0, 0%, 83%);
}
.draw {
  position: relative;
}
#r-result {
  position: absolute;
  left: 200px;
  top: 30px;
}
.resultList {
  background: white;
  width: 250px;
  border: 1px solid gray;
  color: gray;
  padding: 5px;
  max-height: 200px;
  overflow: auto;
}
.searchItem {
  cursor: pointer;
}
.searchItem:hover {
  cursor: pointer;
  color: hsl(211, 87%, 80%);
}
.button {
  margin-right: 20px;
}
.rightTopButtonCon {
  position: absolute;
  top: 30px;
  right: 60px;
}
.middleTopButtonCon {
  position: absolute;
  top: 30px;
  right: 350px;
}
.floorNumCon {
  text-align: center;
  font-size: 0;
}
.floorNum {
  width: 30px;
  height: 30px;
  border: 1px solid #c9c9c9;
  border-radius: 5px;
  text-align: center;
  line-height: 28px;
  background: white;

  display: inline-block;
  user-select: none;
  margin-left: 0px;
  cursor: pointer;
  line-height: 30px;
  margin-bottom: 5px;
  font-size: 12px;
}
.floorNum:hover {
  border-color: #66b1ff;
}
.floorNumActive {
  border-color: #66b1ff;
  background: #66b1ff;
  color: white;
}
.hasFloorData {
  color: #ffc107;
}
</style>
