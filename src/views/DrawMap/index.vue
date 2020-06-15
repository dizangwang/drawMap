<template>
  <div class="app">
    <!-- 操作栏 -->
    <div class="handlerFor">
      <el-button size="mini" class="lf10" type="primary" @click="themeClick">主题</el-button>
      <!-- <el-button size="mini" class="lf10" type="primary" @click="getAllData">获取数据</el-button> -->
      <!-- <el-button size="mini" class="lf10" type="primary" @click="canceldraw">取消绘制</el-button>-->
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
              <el-collapse class="taskDown" accordion>
                <el-collapse-item>
                  <template slot="title">
                    <div class="taskDownInfoCon" @click="selectElementClick">
                      <span>
                        <i class="iconCommon iconSelectElement bigSize"></i>选择元素
                      </span>
                      <span></span>
                    </div>
                  </template>
                  <div>
                    <el-card body-style="{border:0}" shadow="never">
                      <div v-show="!selectedElement.id">
                        <div class="center">请在底图上选择要编辑的元素</div>
                        <!-- <div class="center">（按住crtl键可以选择多个元素）</div> -->
                      </div>
                      <table class="formTable" v-show="selectedElement.id">
                        <tr>
                          <td>元素类型</td>
                          <td>
                            <el-input
                              class="leftInputWid"
                              :value="selectedElement.layername"
                              size="mini"
                              disabled
                              placeholder="请输入内容"
                            ></el-input>
                          </td>
                        </tr>
                        <tr>
                          <td>元素ID</td>
                          <td>
                            <el-input
                              class="leftInputWid"
                              :value="selectedElement.id"
                              size="mini"
                              disabled
                              placeholder="请输入内容"
                            ></el-input>
                          </td>
                        </tr>
                        <tr>
                          <td>类型ID</td>
                          <td>
                            <el-input
                              class="leftInputWid"
                              :value="selectedElement.value.typeID"
                              size="mini"
                              disabled
                              placeholder="请输入内容"
                            ></el-input>
                          </td>
                        </tr>
                        <tr>
                          <td>元素名称</td>
                          <td>
                            <el-input
                              class="leftInputWid"
                              v-model="selectedElement.value.name"
                              size="mini"
                              placeholder="请输入内容"
                              @input="drawSelectedNameInput"
                            ></el-input>
                          </td>
                        </tr>
                        <tr>
                          <td>元素样式</td>
                          <td>
                            <el-select
                              class="leftInputWid"
                              size="mini"
                              v-model="selectedElement.value.styleID"
                              placeholder="请选择"
                              @change="styleSelectChange"
                            >
                              <el-option
                                v-for="(item,index) in elementStyleList"
                                :key="index"
                                :label="item.name"
                                :value="index"
                              ></el-option>
                            </el-select>
                            <!-- <i class="el-icon-delete lf10"></i> -->
                          </td>
                        </tr>
                        <tr>
                          <td>填充颜色</td>
                          <td>
                            <el-color-picker
                              v-model="selectedElement.value.fillColor"
                              class="colorWidth"
                              @active-change="drawSelectedColorChange"
                            ></el-color-picker>
                          </td>
                        </tr>
                        <tr v-if="isPoiSelected">
                          <td>图标大小</td>
                          <td>
                            <el-input-number
                              size="small"
                              @change="poiSizeChange"
                              v-model="selectedElement.value.size"
                              :min="1"
                            ></el-input-number>
                          </td>
                        </tr>
                      </table>
                    </el-card>
                  </div>
                </el-collapse-item>
              </el-collapse>

              <el-collapse class="taskDown" accordion>
                <el-collapse-item>
                  <template slot="title">
                    <div class="taskDownInfoCon">
                      <span>
                        <i class="iconCommon iconIconMgr bigSize"></i>
                        图标管理
                      </span>
                      <span></span>
                    </div>
                  </template>
                  <div>
                    <el-card body-style="{border:0}" shadow="never">
                      <div class="iconMgrCon">
                        <span
                          @click="commonIconClick(item,index)"
                          class="iconMgrItem iconMgrItemHover"
                          :class="{iconMgrItemActive:iconActiveNum==(index+1)}"
                          v-for="(item,index) in allIconsArr"
                          :key="item.id"
                        >
                          <img
                            :alt="item.name"
                            :title="item.name"
                            :src="item.imgPath"
                            width="30px"
                            height="30px"
                          />
                        </span>

                        <span @click="addIconClick" class="iconMgrItem lastIconMgrItem">
                          <i class="el-icon-plus"></i>
                        </span>
                      </div>
                      <div class="iconMgrWord" v-if="iconName">{{iconName}}</div>
                    </el-card>
                  </div>
                </el-collapse-item>
              </el-collapse>

              <el-collapse class="taskDown" accordion>
                <el-collapse-item>
                  <template slot="title">
                    <div class="taskDownInfoCon">
                      <span>
                        <i class="iconCommon iconDrawElement bigSize"></i>
                        绘制元素
                      </span>
                      <span></span>
                    </div>
                  </template>
                  <div>
                    <el-card body-style="{border:0}" shadow="never">
                      <table class="formTable">
                        <tr>
                          <td>形状</td>
                          <td>
                            <!-- blackGd -->
                            <span
                              @click="drawRect"
                              class="iconMgrItem"
                              :class="{blackGd:drawActiveType==1}"
                            >
                              <i
                                class="iconDrawRect drawRectWH"
                                :class="{iconDrawRectActive:drawActiveType==1}"
                              ></i>
                            </span>
                            <span
                              @click="drawcircle"
                              class="iconMgrItem"
                              :class="{blackGd:drawActiveType==2}"
                            >
                              <i
                                class="iconDrawPie drawRectWH"
                                :class="{iconDrawPieActive:drawActiveType==2}"
                              ></i>
                            </span>
                            <span
                              class="iconMgrItem"
                              @click="drawpolygon"
                              :class="{blackGd:drawActiveType==3}"
                            >
                              <i
                                class="iconDrawPolygon drawRectWH"
                                :class="{iconDrawPolygonActive:drawActiveType==3}"
                              ></i>
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>元素样式</td>
                          <td>
                            <el-select
                              class="leftInputWid"
                              size="mini"
                              v-model="preDrawStyle"
                              placeholder="请选择"
                            >
                              <el-option
                                v-for="(item,index) in elementStyleList"
                                :key="index"
                                :label="item.name"
                                :value="index"
                              ></el-option>
                            </el-select>
                          </td>
                        </tr>
                        <tr>
                          <td>元素高度</td>
                          <td>
                            <el-input-number
                              v-model="elementHeight"
                              size="small"
                              :min="0"
                              :max="10"
                            />&nbsp;&nbsp;米(m)
                          </td>
                        </tr>
                        <!-- <tr>
                          <td>标注高度</td>
                          <td>
                            <el-input-number v-model="markHeight" size="small" :min="0" :max="10" />&nbsp;&nbsp;米(m)
                          </td>
                        </tr>-->
                      </table>
                    </el-card>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>

            <!-- 路径模块 -->
            <div v-show="tabNum==2">
              <el-collapse class="taskDown" accordion>
                <el-collapse-item>
                  <template slot="title">
                    <div class="taskDownInfoCon">
                      <span>
                        <i class="iconCommon iconSelectElement bigSize"></i>
                        选择元素
                      </span>
                      <span></span>
                    </div>
                  </template>
                  <div>
                    <el-card body-style="{border:0}" shadow="never">
                      <div v-show="!facilityTypeTarget.id">
                        <div class="center">请在底图上选择元素</div>
                        <!-- <div class="center">（按住crtl键可以选择多个元素）</div> -->
                      </div>
                      <table class="formTable" v-show="facilityTypeTarget.id">
                        <tr>
                          <td>设施类型</td>
                          <td>
                            <span class="iconMgrItem">
                              <img
                                :src="facilityTypeTarget.value.img"
                                width="30px"
                                height="30px"
                                alt
                              />
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>到达楼层</td>
                          <td>
                            <el-input
                              class="leftInputWid"
                              v-model="facilityToFloor"
                              size="mini"
                              placeholder="请输入内容"
                            ></el-input>
                          </td>
                        </tr>
                        <tr>
                          <td>分组名称</td>
                          <td>
                            <el-input
                              class="leftInputWid"
                              v-model="facilityGroup"
                              size="mini"
                              placeholder="请输入内容"
                            ></el-input>
                          </td>
                        </tr>
                      </table>
                    </el-card>
                  </div>
                </el-collapse-item>
              </el-collapse>

              <el-collapse class="taskDown" accordion>
                <el-collapse-item>
                  <template slot="title">
                    <div class="taskDownInfoCon">
                      <span>
                        <i class="iconCommon iconDrawElement bigSize"></i>
                        绘制元素
                      </span>
                      <span></span>
                    </div>
                  </template>
                  <div>
                    <el-card body-style="{border:0}" shadow="never">
                      <table class="formTable">
                        <tr>
                          <td>绘制路线</td>
                          <td>
                            <span
                              class="iconMgrItem"
                              :class="{blackGd:isDrawLine}"
                              @click="drawLine"
                            >
                              <i class="route drawRectWH" :class="{routeActive:isDrawLine}"></i>
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>设施类型</td>
                          <td>
                            <span
                              class="iconMgrItem"
                              @click="verticalFloorClick"
                              :class="{blackGd:drawActiveLine==1}"
                            >
                              <i
                                class="verticalFloor drawRectWH"
                                :class="{verticalFloorActive:drawActiveLine==1}"
                              ></i>
                            </span>
                            <span
                              class="iconMgrItem"
                              @click="holdFloorClick"
                              :class="{blackGd:drawActiveLine==2}"
                            >
                              <i
                                class="holdFloor drawRectWH"
                                :class="{holdFloorActive:drawActiveLine==2}"
                              ></i>
                            </span>
                            <span
                              class="iconMgrItem"
                              @click="commonFloorClick"
                              :class="{blackGd:drawActiveLine==3}"
                            >
                              <i
                                class="commonFloor drawRectWH"
                                :class="{floorActive:drawActiveLine==3}"
                              ></i>
                            </span>
                          </td>
                        </tr>
                      </table>
                    </el-card>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </div>
      <div class="rightHandlerCon" :style="{ height: height }">
        <div
          v-show="!hasUnderPainting"
          class="noUnderPaint center"
          :style="{ height: height }"
        >当前楼层未设置底图，不可绘制。请点击设置楼层信息按钮，录入底图等信息</div>
        <div :style="{ height: height }" id="mapInDoor"></div>
      </div>
    </div>
    <!-- 设置楼层信息 -->
    <el-dialog :visible.sync="setFloorInfoModal" width="500px" title="设置楼层信息">
      <SetFloorInfo
        ref="setFloorInfo"
        @success="setFloorInfoSuccess"
        @cancel="setFloorInfoModal=false"
      />
    </el-dialog>

    <!-- 到达楼层信息 -->
    <el-dialog :visible.sync="goFloorNumModal" width="500px" :title="floorNumTitle">
      <el-checkbox v-model="goFloorNumCheckAll" @change="goFloorNumAllChange">全选</el-checkbox>
      <el-checkbox-group v-model="goFloorArr" size="medium">
        <el-checkbox-button
          v-for="(item) in floorArr"
          :label="item.value"
          :key="item.label"
        >{{item.label}}</el-checkbox-button>
      </el-checkbox-group>
    </el-dialog>

    <!-- 所有图标 -->
    <el-dialog :visible.sync="allIconModal" width="500px" title="所有图标">
      <div style="overflow:hidden" v-if="iconPreview">
        <div class="iconMgrItem" style="width:70px;height:70px;float:right">
          <img
            :alt="iconPreview.name"
            :title="iconPreview.name"
            :src="iconPreview.imgPath"
            width="60px"
            height="60px"
          />
        </div>
      </div>

      <div class="iconMgrCon">
        <span
          @mouseover="iconItemHover(item)"
          @click="iconItemClick(item)"
          class="iconMgrItem iconMgrItemHover"
          v-for="(item) in allIconsArr"
          :key="item.id"
        >
          <img :alt="item.name" :title="item.name" :src="item.imgPath" width="30px" height="30px" />
        </span>
      </div>
    </el-dialog>

    <!-- 新建样式 -->
    <el-dialog :visible.sync="createStyleModal" width="500px" title="新建样式">
      <CreateStyle ref="createStyle" @success="createStyleSuccess" @cancel="createStyleModal=false"></CreateStyle>
    </el-dialog>
    <!-- 编辑样式 -->
    <el-dialog :visible.sync="editStyleModal" width="500px" title="编辑样式">
      <EditStyle ref="editStyle" @success="createStyleSuccess" @cancel="editStyleModal=false"></EditStyle>
    </el-dialog>
    <!-- 编辑主题样式 -->
    <el-dialog :visible.sync="editElementStyleModal" width="500px" title="编辑主题样式">
      <table class="wd100">
        <tr>
          <td class="rightLebal">元素样式：</td>
          <td>
            <div class="center">
              <el-input
                size="small"
                v-model="searchStyleWord"
                @input="searchStyleWordChange"
                placeholder
                show-word-limit
              />
              <i class="el-icon-plus lf10 cursor" @click="createStyleClick"></i>
              <i class="el-icon-edit lf10 cursor" @click="editStyleClick"></i>
              <i class="el-icon-delete lf10 cursor" @click="deleteStyleClick"></i>
            </div>
          </td>
        </tr>
      </table>
      <div class="editElementStyle">
        <Table
          @on-selection-change="styleTableSelectChange"
          :columns="elementStyleColumn"
          :data="elementStyleListCopy"
        >
          <template slot="borderColor" slot-scope="{row}">
            <div class="colorOutline center">
              <div :style="{ background: row.borderColor}"></div>
            </div>
          </template>
          <template slot="color" slot-scope="{row}">
            <div class="colorOutline center">
              <div :style="{ background: row.fillColor}"></div>
            </div>
          </template>
        </Table>
      </div>
    </el-dialog>

    <!-- 数据图表信息 -->
    <el-dialog :visible.sync="dataChartInfoModal" width="700px" title="数据图表信息">
      <div class="center">
        <el-select size="small" v-model="layerType" placeholder="图面层">
          <el-option value="1" label="图面层"></el-option>
          <el-option value="2" label="POI层"></el-option>
        </el-select>
        <el-input class="lf10" size="small" placeholder="搜索" show-word-limit />
        <i class="el-icon-delete lf10"></i>
      </div>

      <div class="editElementStyle">
        <Table :columns="dataChartColumn" :data="dataChartData"></Table>
      </div>
    </el-dialog>

    <!-- 底部操作栏 -->
    <div class="mapFooterHandler">
      <!-- <el-button type="primary" plain>20M</el-button> -->
      <div class="zoomSelect">
        <i class="el-icon-zoom-in lf10" @click="mapBiggerClick"></i>
        <i class="vline lf10"></i>
        <i class="el-icon-zoom-out lf10" @click="mapLittleClick"></i>
        <i class="vline lf10"></i>
        <i class="iconCommon iconBlackBuild lf10 iconSize"></i>

        <span class="floorWord">楼层：</span>
        <el-select
          @change="floorChange"
          class="floorSelect"
          size="mini"
          v-model="activeFloor"
          placeholder="楼层"
        >
          <el-option
            v-for="(item,index) in floorArr"
            :key="index"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>
<script>
import Entity from "./indexJs";

export default Entity;
</script>
<style scoped>
@import url("./indexCss.css");
</style>

