<template>
  <div class="draw">
    <div id="map" :style="mapStyle"></div>
    <div class="rightTopButtonCon">
      <Poptip title trigger="hover" content="单击开始，双击结束" placement="bottom">
        <Button class="button" @click="drawClick" type="primary">绘制</Button>
      </Poptip>
      <Button class="button" @click="saveClick" type="primary">保存</Button>
      <Button class="button" @click="quitClick" type="primary">退出</Button>
    </div>
    <div id="r-result">
      <Input
        v-model="searchValue"
        search
        enter-button
        placeholder
        @on-search="search"
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
      currentFloor: ""
    };
  },
  mounted() {
    // 初始化地图
    this.init();
  },
  methods: {
    initData() {
      var that = this;
      that.searchValue = "";
      that.searchResult = [];
      that.searchResultShow = false;
      that.map = "";
      that.cacheOverlays = {};
      that.indoorManager = "";
      that.floorData = {};
      that.currentFloor = "";
      that.init();
    },
    // 初始化地图
    init() {
      var that = this;
      // 初始化地图宽高
      var width = window.innerWidth;
      var height = window.innerHeight;
      that.mapStyle.width = `${width - 35}px`;
      that.mapStyle.height = `${height - 85}px`;

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

      // 初始化地图,设置中心点坐标和地图级别
      map.centerAndZoom(new BMap.Point(116.340739, 40.03592), 19);

      // 开启鼠标滚轮缩放
      map.enableScrollWheelZoom(true);

      // 创建室内图实例
      that.indoorManager = new BMapLib.IndoorManager(map, {
        // 切换楼层事件
        afterChangeFloor(e) {
          // 切换时清除所有覆盖物
          that.clearAll();

          // 指定当前楼层
          that.currentFloor = e.currentFloor;
          var lis = document.querySelectorAll(".floor-select-container li");
          var keys = Object.keys(that.cacheOverlays);
          keys.forEach((key) => {
            lis.forEach((item) => {
              const button = item.querySelector("button");
              const floor = button.getAttribute("data-floor");
              if (floor === key) {
                button.style.color = "red";
              }
            });
          });
          // 如果图层缓存对象中有当前楼层的数据，就渲染到地图上
          if (that.cacheOverlays[e.currentFloor]) {
            that.map.addOverlay(that.cacheOverlays[e.currentFloor]);
          }
        }
      });
      setTimeout(() => {
        // 启用室内地图
        that.indoorManager.enableIndoor();

        // 显示室内地图楼层控制器
        that.indoorManager.showIndoorControl();
      }, 1500);
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
          if (Object.prototype.hasOwnProperty.call(result, "Pq")) {
            that.searchResult = result.Pq;
            // var pp = local.getResults().getPoi(0).point;
            // map.centerAndZoom(pp, 18);
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
      that.clearAll();
      that.currentFloor = that.indoorManager.getFloor();

      var overlaycomplete = (e) => {
        that.activeLonLatData = e.overlay.Sn;
        var currentFloor = that.indoorManager.getFloor();
        if (!currentFloor) {
          currentFloor = that.currentFloor;
        }
        that.cacheOverlays[currentFloor] = e.overlay;
        that.floorData[currentFloor] = e.overlay.Sn;
      };

      // 线的样式
      var styleOptions = {
        strokeColor: "red",
        fillColor: "red",
        strokeWeight: 2,
        strokeOpacity: 0.9,
        fillOpacity: 0.9,
        strokeStyle: "solid"
      };

      // 实例化鼠标绘制工具
      var drawingManager = new BMapLib.DrawingManager(this.map, {
        isOpen: true,
        enableDrawingTool: false,
        polylineOptions: styleOptions
      });

      // 指定画的类型--折线
      drawingManager.setDrawingMode(BMAP_DRAWING_POLYLINE);

      // 添加鼠标绘制工具监听事件，用于获取绘制结果
      drawingManager.addEventListener("overlaycomplete", overlaycomplete);
    },
    // 保存事件
    saveClick() {
      var that = this;
      var kes = Object.keys(that.floorData);
      if (kes.length === 0) {
        that.$Modal.warning({
          title: "请先绘制轮廓"
        });
        return;
      }
      that.$Modal.info({
        title: "保存数据",
        width: 500,
        content: JSON.stringify(that.floorData)
      });
      that.$emit("save", that.floorData);
    },
    quitClick() {
      var that = this;
      that.$emit("quit");
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
