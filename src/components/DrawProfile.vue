<template>
  <div class="draw">
    <div id="map" :style="mapStyle"></div>
    <div class="rightTopButtonCon">
      <Poptip title trigger="hover" content="单击开始，双击结束" placement="bottom">
        <el-button size="mini" class="button" @click="drawClick" type="primary">绘制</el-button>
      </Poptip>
      <Poptip title trigger="hover" content="绘制完统一保存" placement="bottom">
        <el-button size="mini" class="button" @click="saveClick" type="primary">保存</el-button>
      </Poptip>
      <el-button size="mini" class="button" @click="quitClick" type="primary">退出</el-button>
    </div>
    <div id="r-result">
      <Input
        v-model="searchValue"
        placeholder="请输入..."
        @on-change="searchValueChange"
        style="width:250px"
      />
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
export default {
  name: "DrawProfile",
  props: {
    msg: String
  },
  data() {
    return {
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
      editOutLine: ""
    };
  },
  mounted() {
    // 初始化地图
    this.init();
  },
  methods: {
    // 根据经纬度绘制多边形
    createPolygon(data) {
      var that = this;
      that.map.clearOverlays();
      var arr = [];
      data.forEach((item) => {
        arr.push(new BMap.Point(item.lng, item.lat));
      });
      var styleOptions = {
        strokeColor: "red",
        fillColor: "red",
        strokeWeight: 1,
        strokeOpacity: 0.9,
        fillOpacity: 0.1,
        strokeStyle: "solid"
      };
      var polygon = new BMap.Polygon(arr, styleOptions);
      that.map.addOverlay(polygon);
    },

    // 被其他页面调用时，清空数据
    initData(initObj) {
      var that = this;
      that.searchValue = "";
      that.searchResult = [];
      that.searchResultShow = false;
      that.map = "";
      that.cacheOverlays = {};
      that.indoorManager = "";
      that.floorData = {};
      that.currentFloor = "";
      that.init(initObj.address);

      // 判断是否传过来轮廓的经纬度
      if (initObj.editOutLine) {
        that.isSave = true;
        that.editOutLine = initObj.editOutLine;

        // 把值赋值给floorData
        Object.keys(that.editOutLine).forEach((key, index) => {
          if (that.editOutLine[key]) {
            that.floorData[key] = JSON.parse(that.editOutLine[key]);
          }
        });

        // 默认渲染F1层
        if (that.editOutLine.F1) {
          that.createPolygon(JSON.parse(that.editOutLine.F1));
        }

        // 如果没有F1层有B1层，就渲染B1层
        if (!that.editOutLine.F1 && that.editOutLine.B1) {
          that.createPolygon(JSON.parse(that.editOutLine.B1));
        }
      }
    },

    // 初始化地图
    init(area) {
      var that = this;

      // 初始化地图宽高
      that.mapStyle.width = `${window.innerWidth - 35}px`;
      that.mapStyle.height = `${window.innerHeight - 85}px`;
      window.onresize = () => {
        that.mapStyle.width = `${window.innerWidth - 35}px`;
        that.mapStyle.height = `${window.innerHeight - 85}px`;
      };

      // 创建Map实例
      var map = new BMap.Map("map");
      that.map = map;

      // 左上角，添加默认缩放平移控件
      var topLeftNavigation = new BMap.NavigationControl();

      // 左上角，添加比例尺
      var topLeftLontrol = new BMap.ScaleControl({
        anchor: BMAP_ANCHOR_TOP_LEFT
      });
      map.addControl(topLeftLontrol);
      map.addControl(topLeftNavigation);

      // 如果有这个参数，就进行定位
      if (area) {
        map.centerAndZoom(area, 15);
      } else {
        // 初始化地图,设置中心点坐标和地图级别
        map.centerAndZoom(new BMap.Point(116.340739, 40.03592), 19);
      }

      // 开启鼠标滚轮缩放
      map.enableScrollWheelZoom(true);

      // 创建室内图实例
      that.indoorManager = new BMapLib.IndoorManager(map, {
        // 室内图加载完成事件
        complete(e) {
          // 获取地图右侧楼层展示
          var lis = document.querySelectorAll(".floor-select-container li");

          // 拿到已经绘制好轮廓的楼层
          var keys = Object.keys(that.floorData);
          // that.editOutLine

          // 循环楼层
          keys.forEach((key) => {
            // 循环地图右侧楼层
            lis.forEach((item) => {
              const button = item.querySelector("button");
              const floor = button.getAttribute("data-floor");

              // 楼层比对
              if (floor === key) {
                button.style.color = "red";
              }
            });
          });
        },

        // 切换楼层事件
        afterChangeFloor(e) {
          // 切换时清除所有覆盖物
          that.clearAll();
          map.clearOverlays();

          // 指定当前楼层
          that.currentFloor = e.currentFloor;

          // 获取地图右侧楼层展示
          var lis = document.querySelectorAll(".floor-select-container li");

          // 拿到已经绘制好轮廓的楼层
          var keys = Object.keys(that.cacheOverlays);
          // that.editOutLine

          // 循环楼层
          keys.forEach((key) => {
            // 循环地图右侧楼层
            lis.forEach((item) => {
              const button = item.querySelector("button");
              const floor = button.getAttribute("data-floor");
              // 楼层比对
              if (floor === key) {
                button.style.color = "red";
              }
            });
          });

          // 如果图层缓存对象中有当前楼层的数据，就渲染到地图上
          if (that.cacheOverlays[e.currentFloor]) {
            that.map.addOverlay(that.cacheOverlays[e.currentFloor]);
          } else if (that.editOutLine) {
            // 如果是编辑

            // 拿到已经绘制好轮廓的楼层
            var keys1 = Object.keys(that.floorData);

            // 循环楼层
            keys1.forEach((key) => {
              // 循环地图右侧楼层
              lis.forEach((item) => {
                const button = item.querySelector("button");
                const floor = button.getAttribute("data-floor");
                // 楼层比对
                if (floor === key) {
                  button.style.color = "red";
                }
              });
            });

            // 如果楼层数据中有当前楼层的数据，就绘制到地图上
            if (that.floorData[e.currentFloor]) {
              that.createPolygon(that.floorData[e.currentFloor]);
            }
          }
        }
      });
    },

    // 监听输入框值的变化
    searchValueChange(val) {
      var that = this;
      that.searchValue = val.target.value;

      // 如果选中的值和搜索框中的值是一样的，就不进行搜索
      if (that.clickedTitle === that.searchValue) {
        return;
      }
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
      function myFun() {
        var result = local.getResults();
        if (result) {
          if (Object.prototype.hasOwnProperty.call(result, "Qq")) {
            that.searchResult = result.Qq;
          } else {
            that.searchResult = [];
          }
        } else {
          that.searchResult = [];
        }
        if (that.searchResult.length === 0) {
          that.searchResultShow = false;
        } else {
          that.searchResultShow = true;
        }

        if (that.searchResult.length === 0 && that.searchValue !== "") {
          that.$Message.info("查询不到结果");
        }
      }
      local = new BMap.LocalSearch(map, {
        onSearchComplete: myFun
      });
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

      // 判断右侧楼层控件有没有出现
      var floorShow = document.querySelector(".floor-select-container");
      if (floorShow) {
        if (floorShow.style.right !== "20px") {
          this.$message({
            message: "请点击需要绘制的室内图",
            type: "warning"
          });
          return;
        }
      } else {
        that.$message({
          message: "请点击需要绘制的室内图",
          type: "warning"
        });
        return;
      }

      that.clearAll();
      that.map.clearOverlays();

      // 编辑时
      if (that.editOutLine) {
        var lis = document.querySelectorAll(".floor-select-container li");

        // 拿到已经绘制好轮廓的楼层
        var keys = Object.keys(that.floorData);

        // 循环楼层
        keys.forEach((key) => {
          // 循环地图右侧楼层
          lis.forEach((item) => {
            const button = item.querySelector("button");
            const floor = button.getAttribute("data-floor");

            // 楼层比对
            if (floor === key) {
              button.style.color = "red";
            }
          });
        });
      }

      // 获取当前楼层
      that.currentFloor = that.indoorManager.getFloor();

      // 绘制结束回调方法
      var overlaycomplete = (e) => {
        that.activeLonLatData = e.overlay.Tn;
        var currentFloor = that.indoorManager.getFloor();
        if (!currentFloor) {
          currentFloor = that.currentFloor;
        }
        that.cacheOverlays[currentFloor] = e.overlay;
        that.floorData[currentFloor] = e.overlay.Tn;
        that.isSave = false;
      };

      // 线的样式
      var styleOptions = {
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
      var kes = Object.keys(that.floorData);
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
      that.isSave = true;

      that.$emit("save", that.floorData);
    },

    // 退出操作
    quitClick() {
      var that = this;
      var floors = Object.keys(that.floorData);
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
  right: 30px;
}
</style>
