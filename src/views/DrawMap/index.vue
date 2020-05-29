<template>
  <div class="app">
    <!-- 操作栏 -->
    <div class="handler">
      <el-button size="mini" class="lf10" type="primary">调整平面图</el-button>
      <el-button size="mini" class="lf10" type="primary">完成</el-button>
      <el-button size="mini" class="lf10" type="primary">
        <i class="iconCommon iconEye"></i>预览
      </el-button>
      <el-button size="mini" class="lf10" type="primary">
        <i class="iconCommon iconSave"></i>保存
      </el-button>
      <el-button size="mini" class="lf10" type="primary">
        <i class="iconCommon iconPublish"></i>发布
      </el-button>
      <el-button size="mini" class="lf10" type="primary">
        <i class="iconCommon iconBuilding"></i>设置楼层信息
      </el-button>
      <el-input size="mini" class="lf10 searchInput" placeholder="请输入内容">
        <el-button class="searchButton" slot="append" icon="el-icon-search"></el-button>
      </el-input>
    </div>

    <!-- 主体内容 -->
    <div class="container">
      <!-- 左侧工具栏部分 -->
      <div class="leftHandlerCon" :style="{ height: height }">
        <!-- 顶部tab -->
        <div class="tabCon">
          <div class="tabItem" @click="tabNum=1" :class="{ tabItemActive: tabNum==1 }">
            <div>
              <i class="iconCommon iconDraw bigSize"></i>
              <div class="line5"></div>绘制
            </div>
          </div>
          <div class="tabItem" @click="tabNum=2" :class="{ tabItemActive: tabNum==2 }">
            <div>
              <i class="iconCommon iconLine bigSize"></i>
              <div class="line5"></div>路径
            </div>
          </div>
          <div class="tabItem" @click="tabNum=3" :class="{ tabItemActive: tabNum==3 }">
            <div>
              <i class="iconCommon iconSet bigSize"></i>
              <div class="line5"></div>设置
            </div>
          </div>
        </div>

        <!-- 绘制模块 -->
        <div v-show="tabNum==1">
          <!-- 选择元素部分 -->
          <div
            class="menuItem"
            @click="menuSelectElement==1?menuSelectElement=2:menuSelectElement=1"
          >
            <span>
              <i class="iconCommon iconSelectElement bigSize"></i>
              选择元素
            </span>
            <span>
              <i class="el-icon-arrow-up" v-if="menuSelectElement==2"></i>
              <i class="el-icon-arrow-down" v-if="menuSelectElement==1"></i>
            </span>
          </div>

          <div v-show="menuSelectElement==2">
            <table class="formTable">
              <tr>
                <td>元素类型</td>
                <td>
                  <el-input size="mini" disabled placeholder="请输入内容"></el-input>
                </td>
              </tr>
              <tr>
                <td>元素ID</td>
                <td>
                  <el-input size="mini" disabled placeholder="请输入内容"></el-input>
                </td>
              </tr>
              <tr>
                <td>类型ID</td>
                <td>
                  <el-input size="mini" disabled placeholder="请输入内容"></el-input>
                </td>
              </tr>
              <tr>
                <td>元素名称</td>
                <td>
                  <el-input size="mini" placeholder="请输入内容"></el-input>
                </td>
              </tr>
              <tr>
                <td>元素样式</td>
                <td>
                  <el-select size="mini" v-model="elementStyle" placeholder="请选择">
                    <el-option label="dddd" value="dddd"></el-option>
                    <el-option label="eeee" value="eeeee"></el-option>
                  </el-select>
                  <i class="el-icon-delete lf10"></i>
                </td>
              </tr>
              <tr>
                <td>填充颜色</td>
                <td>
                  <el-color-picker class="colorWidth"></el-color-picker>
                </td>
              </tr>
            </table>
          </div>

          <!-- 图标管理部分 -->
          <div class="menuItem" @click="menuIconMgr==1?menuIconMgr=2:menuIconMgr=1">
            <span>
              <i class="iconCommon iconIconMgr bigSize"></i>
              图标管理
            </span>
            <span>
              <i class="el-icon-arrow-up" v-if="menuIconMgr==2"></i>
              <i class="el-icon-arrow-down" v-if="menuIconMgr==1"></i>
            </span>
          </div>

          <div v-show="menuIconMgr==2">
            <div class="iconMgrCon">
              <span class="iconMgrItem"></span>
              <span class="iconMgrItem"></span>
              <span class="iconMgrItem"></span>
              <span class="iconMgrItem"></span>
              <span class="iconMgrItem"></span>
              <span class="iconMgrItem lastIconMgrItem">
                <i class="el-icon-plus"></i>
              </span>
            </div>
            <div class="iconMgrWord">洗手间</div>
          </div>

          <!-- 绘制元素部分 -->
          <div class="menuItem" @click="menuDrawElement==1?menuDrawElement=2:menuDrawElement=1">
            <span>
              <i class="iconCommon iconDrawElement bigSize"></i>
              绘制元素
            </span>
            <span>
              <i class="el-icon-arrow-up" v-if="menuDrawElement==2"></i>
              <i class="el-icon-arrow-down" v-if="menuDrawElement==1"></i>
            </span>
          </div>

          <div v-show="menuDrawElement==2">
            <table class="formTable">
              <tr>
                <td>形状</td>
                <td>
                  <span class="iconMgrItem blackGd" style="background:#223f5c">
                    <i class="iconDrawRect drawRectWH"></i>
                  </span>
                  <span class="iconMgrItem">
                    <i class="iconDrawPie drawRectWH"></i>
                  </span>
                  <span class="iconMgrItem">
                    <i class="iconDrawPolygon drawRectWH"></i>
                  </span>
                </td>
              </tr>
              <tr>
                <td>元素样式</td>
                <td>
                  <el-select size="mini" v-model="elementStyle" placeholder="请选择">
                    <el-option label="dddd" value="dddd"></el-option>
                    <el-option label="eeee" value="eeeee"></el-option>
                  </el-select>
                </td>
              </tr>
              <tr>
                <td>元素高度</td>
                <td>
                  <el-input-number v-model="elementHeight" size="small" :min="0" :max="10" />&nbsp;&nbsp;米(m)
                </td>
              </tr>
              <tr>
                <td>标注高度</td>
                <td>
                  <el-input-number v-model="markHeight" size="small" :min="0" :max="10" />&nbsp;&nbsp;米(m)
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- 路径模块 -->
        <div v-show="tabNum==2">
          <!-- 选择元素部分 -->
          <div
            class="menuItem"
            @click="menuSelectElementLine==1?menuSelectElementLine=2:menuSelectElementLine=1"
          >
            <span>
              <i class="iconCommon iconSelectElement bigSize"></i>
              选择元素
            </span>
            <span>
              <i class="el-icon-arrow-up" v-if="menuSelectElementLine==2"></i>
              <i class="el-icon-arrow-down" v-if="menuSelectElementLine==1"></i>
            </span>
          </div>

          <div v-show="menuSelectElementLine==2">
            <table class="formTable">
              <tr>
                <td>设施类型</td>
                <td>
                  <span class="iconMgrItem"></span>
                  <span class="iconMgrItem"></span>
                  <span class="iconMgrItem"></span>
                </td>
              </tr>
              <tr>
                <td>到达楼层</td>
                <td>
                  <el-input size="mini" placeholder="请输入内容"></el-input>
                </td>
              </tr>
              <tr>
                <td>分组名称</td>
                <td>
                  <el-input size="mini" placeholder="请输入内容"></el-input>
                </td>
              </tr>
            </table>
          </div>

          <!-- 绘制元素部分 -->
          <div
            class="menuItem"
            @click="menuDrawElementLine==1?menuDrawElementLine=2:menuDrawElementLine=1"
          >
            <span>
              <i class="iconCommon iconDrawElement bigSize"></i>
              绘制元素
            </span>
            <span>
              <i class="el-icon-arrow-up" v-if="menuDrawElementLine==2"></i>
              <i class="el-icon-arrow-down" v-if="menuDrawElementLine==1"></i>
            </span>
          </div>

          <div v-show="menuDrawElementLine==2">
            <table class="formTable">
              <tr>
                <td>绘制路线</td>
                <td>
                  <span class="iconMgrItem"></span>
                </td>
              </tr>
              <tr>
                <td>设施类型</td>
                <td>
                  <span class="iconMgrItem"></span>
                  <span class="iconMgrItem"></span>
                  <span class="iconMgrItem"></span>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <div class="rightHandlerCon" :style="{ height: height }"></div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "ChartShowControl",
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: {},
  data() {
    return {
      tabNum: 1,
      menuSelectElement: 1,
      menuSelectElementLine: 1,
      menuDrawElementLine: 1,
      menuIconMgr: 1,
      menuDrawElement: 1,
      elementHeight: 0,
      markHeight: 0,
      elementStyle: "",
      height: ""
    };
  },
  mounted() {
    var that = this;
    that.height = `${window.innerHeight - 80}px`;
  },
  methods: {}
};
</script>
<style scoped>
.drawRectWH {
  width: 30px;
  height: 30px;
  display: block;
}
.blackGd {
  background: #223f5c;
}
.container {
  width: 100%;
  position: relative;
  display: flex;
}
.leftHandlerCon {
  width: 25%;
  overflow: auto;
}
.rightHandlerCon {
  flex: 1;
  overflow: auto;
  background: yellow;
}
.handler {
  display: flex;
  justify-content: flex-end;
  height: 60px;
  align-items: center;
}
.searchInput {
  width: 200px;
}
.tabCon {
  display: flex;
  background: #081e33;
  height: 80px;
  color: white;
}
.tabItem {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
}
.bigSize {
  width: 16px;
  height: 16px;
  margin-right: 0px;
}
.tabItemActive {
  background: #223f5c;
}
.menuItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 55px;
  padding: 0 20px 0 20px;
  background: #f0f4f7;
  font-size: 16px;
  font-weight: bolder;
  color: #081e33;
  cursor: pointer;
}
.formTable {
  width: 100%;
}

.formTable td {
  padding: 10px;
}
.formTable tr td:first-child {
  text-align: right;
}
.colorWidth {
  width: 80px;
}
.iconMgrCon {
  overflow: hidden;
  padding: 10px;
}
.iconMgrItem {
  width: 40px;
  height: 40px;
  float: left;
  border-radius: 5px;
  border: 1px solid #e7e7e7;
  margin-right: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.lastIconMgrItem {
  background: #223f5c;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.iconMgrWord {
  border-top: 1px solid #e7e7e7;
  text-align: center;
  margin: 0 10px 10px 10px;
  padding-top: 10px;
}
</style>

