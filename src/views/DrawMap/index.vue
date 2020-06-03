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
      <el-button size="mini" class="lf10" type="primary" @click="setFloorInfoClick">
        <i class="iconCommon iconBuilding"></i>设置楼层信息
      </el-button>
      <el-input size="mini" class="lf10 searchInput" placeholder="请输入内容">
        <el-button class="searchButton" slot="append" icon="el-icon-search"></el-button>
      </el-input>
    </div>

    <!-- 底部操作栏 -->

    <div class="mapFooterHandler">
      <el-button type="primary" plain>20M</el-button>
      <div class="zoomSelect">
        <i class="el-icon-zoom-in lf10"></i>
        <i class="vline lf10"></i>
        <i class="el-icon-zoom-out lf10"></i>
        <i class="vline lf10"></i>
        <i class="iconCommon iconBlackBuild lf10 iconSize"></i>

        <span class="floorWord">楼层：</span>
        <el-select class="floorSelect" size="mini" v-model="floor" placeholder="楼层">
          <el-option label="F5" value="5"></el-option>
          <el-option label="F4" value="4"></el-option>
          <el-option label="F3" value="3"></el-option>
          <el-option label="F2" value="2"></el-option>
          <el-option label="F1" value="1"></el-option>
        </el-select>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="container">
      <!-- 左侧工具栏部分 -->
      <div class="leftHandlerCon">
        <div class="flexColumn" :style="{ height: height }">
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
          <div style="flex:1;overflow:auto">
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
        </div>
      </div>
      <div class="rightHandlerCon" :style="{ height: height }"></div>
    </div>
    <!-- 设置楼层信息 -->
    <el-dialog :visible.sync="setFloorInfoModal" width="500px" title="设置楼层信息">
      <SetFloorInfo
        ref="setFloorInfo"
        @success="setFloorInfoSuccess"
        @cancel="setFloorInfoModal=false"
      />
    </el-dialog>

    <!-- 编辑主题样式 -->
    <el-dialog :visible.sync="editElementStyleModal" width="500px" title="编辑主题样式">
      <table class="wd100">
        <tr>
          <td class="rightLebal">元素样式：</td>

          <td>
            <div class="center">
              <el-input size="small" placeholder show-word-limit />
              <i class="el-icon-plus lf10"></i>
              <i class="el-icon-delete lf10"></i>
            </div>
          </td>
        </tr>
      </table>
      <div class="editElementStyle">
        <Table :columns="elementStyleColumn" :data="elementStyleData">
          <template slot="color" slot-scope="{row}">
            <div class="colorOutline center">
              <div :style="{ background: row.color}"></div>
            </div>
          </template>
        </Table>
      </div>
    </el-dialog>

    <!-- 数据图表信息 -->
    <el-dialog :visible.sync="dataChartInfoModal" width="700px" title="数据图表信息">
      <div class="center">
        <el-select size="small" placeholder="图面层">
          <el-option value="1" label="图面层"></el-option>
        </el-select>
        <el-input class="lf10" size="small" placeholder="搜索" show-word-limit />

        <i class="el-icon-delete lf10"></i>
      </div>

      <div class="editElementStyle">
        <Table :columns="dataChartColumn" :data="dataChartData">
          <template slot="color" slot-scope="{row}">
            <div class="colorOutline center">
              <div :style="{ background: row.color}"></div>
            </div>
          </template>
        </Table>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import SetFloorInfo from "./setFloorInfo.vue";

export default {
  name: "ChartShowControl",
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: { SetFloorInfo },
  data() {
    return {
      // 数据图表数据
      dataChartData: [{ id: 22 }],
      // 数据图表列值
      dataChartColumn: [
        {
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
      elementStyleColumn: [
        {
          title: "选择",
          type: "selection",
          width: 80
        },
        {
          title: "样式名称",
          key: "name"
        },
        {
          title: "类型ID",
          key: "typeId"
        },
        {
          title: "填充颜色",
          slot: "color"
        }
      ],
      // 元素样式数据
      elementStyleData: [
        { name: "样式1", typeId: 555, color: "red" },
        { name: "样式1", typeId: 555, color: "yellow" }
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
        buildingName: [
          { required: true, message: "请填写楼宇名称", trigger: "blur" }
        ]
      },
      // 设置楼层信息
      setFloorInfoModal: false,
      // 左侧-顶部-tab栏
      tabNum: 1,
      // 左侧-顶部-绘制模块
      menuSelectElement: 2,
      // 左侧-顶部-路径模块
      menuSelectElementLine: 1,
      // 左侧-顶部-绘制路线
      menuDrawElementLine: 1,
      // //左侧-顶部-图标管理
      menuIconMgr: 1,
      // 左侧-顶部-绘制元素
      menuDrawElement: 1,
      // 元素高度
      elementHeight: 0,
      // 标注高度
      markHeight: 0,
      // 元素样式
      elementStyle: "",
      // 右侧地图高度
      height: "",
      // 楼宇信息
      buildObj: {}
    };
  },
  mounted() {
    var that = this;
    that.height = `${window.innerHeight - 80}px`;
    that.buildObj = that.utils.localstorageGet("buildObj");
    that.getFloorByBuildingId();
  },
  methods: {
    // 设置楼层信息
    setFloorInfoClick() {
      var that = this;
      that.setFloorInfoModal = true;
    },
    // 保存楼层信息成功
    setFloorInfoSuccess() {},
    // 根据楼宇id获取整个楼层的信息
    getFloorByBuildingId() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getFloorByBuildingId + that.buildObj.id,
          data: ""
        })
        .then((res) => {
          const { data } = res;
          if (data.code === 200) {
            that.$message({
              message: data.msg,
              type: "success"
            });
          }
          that.$message({
            message: data.msg,
            type: "warning"
          });
        });
    }
  }
};
</script>
<style scoped>
.colorOutline {
  height: 30px;
  width: 70px;
  border: 1px solid #e3e3e3;
  border-radius: 5px;
  box-sizing: border-box;
}
.colorOutline > div {
  height: 20px;
  width: 60px;

  box-sizing: border-box;
}
.floorWord {
  font-size: 14px;
}
.floorSelect {
  width: 76px;
  border: 0;
}

.iconSize {
  width: 20px;
  height: 20px;
}
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
  width: 340px;
}
.rightHandlerCon {
  flex: 1;
  overflow: auto;
  background: #f8f8f8;
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
.zoomSelect {
  margin-left: 30px;
  width: 250px;
  height: 40px;
  font-size: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: white;
  box-shadow: 2px 2px 10px #c7c5c5;
  border-radius: 5px;
  cursor: pointer;
}
.mapFooterHandler {
  display: flex;
  justify-content: flex-start;
  height: 40px;
  position: absolute;
  bottom: 40px;
  right: 40px;
  z-index: 1000;
}
.vline {
  display: inline-block;
  height: 18px;
  border-left: 1px solid #e6e6e6;
}
.flexColumn {
  display: flex;
  flex-direction: column;
}
</style>

