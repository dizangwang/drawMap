<template>
  <div class="myProject">
    <el-popover placement="top-start" trigger="hover" content="点击查看后台数据处理进度">
      <el-button
        slot="reference"
        @click="downOkClick"
        v-show="leftBottomTaskDownShow"
        type="info"
        size="mini"
        class="downloadTem"
      >
        <i class="el-icon-download"></i>
      </el-button>
    </el-popover>

    <!--------------------------- 顶部操作栏--start----------------------------------- -->
    <div class="handler">
      <div class="left">
        <el-select size="mini" class="leftSelect lf20" v-model="task" @change="taskChange">
          <el-option value="1" label="任务"></el-option>
          <el-option value="2" label="楼宇"></el-option>
        </el-select>
        <span class="lf5">任务类型</span>
        <el-select v-model="searchForm.taskTypeId" size="mini" class="leftSelect lf5">
          <el-option value>全部</el-option>
          <el-option
            v-for="item in taskTypes"
            :value="item.id"
            :label="item.typeName"
            :key="item.id"
          ></el-option>
        </el-select>
        <span class="lf5">任务区域</span>
        <el-select
          size="mini"
          v-model="searchForm.province"
          placeholder="省"
          class="leftSelect lf5"
          @change="provinceChange"
        >
          <el-option
            v-for="item in provinceList"
            :value="item.id"
            :label="item.name"
            :key="item.id"
          ></el-option>
        </el-select>
        <el-select
          size="mini"
          v-model="searchForm.city"
          placeholder="市"
          class="leftSelect lf5"
          @change="cityChange"
        >
          <el-option v-for="item in cityList" :value="item.id" :label="item.name" :key="item.id"></el-option>
        </el-select>
        <el-select size="mini" v-model="searchForm.district" placeholder="区" class="leftSelect lf5">
          <el-option
            v-for="item in districtList"
            :value="item.id"
            :label="item.name"
            :key="item.id"
          ></el-option>
        </el-select>
        <el-input
          v-model="searchForm.taskName"
          size="mini"
          maxlength="20"
          class="leftInput lf5"
          placeholder="请输入任务名称"
        />
        <el-button @click="searchClick" size="mini" class="lf20" type="primary">确定</el-button>
      </div>
      <div class="right">
        <el-button size="mini" class="lf10" type="primary" @click="publishBatchClick">
          <i class="iconCommon iconPublish"></i>发布
        </el-button>
        <el-button size="mini" class="lf10" type="primary" @click="underCarriageBatchClick">
          <i class="iconCommon iconUndercarriage"></i>下架
        </el-button>
        <el-button size="mini" class="lf10" type="primary" @click="downBatchloadClick">
          <i class="iconCommon iconDownload"></i>下载
        </el-button>
        <el-button size="mini" class="lf10" type="primary" @click="deleteBatchClick">
          <i class="iconCommon iconDelete"></i>删除
        </el-button>
        <el-button class="lf10" size="mini" type="primary" @click="createTaskClick">
          <i class="iconCommon iconAdd"></i>创建任务
        </el-button>
      </div>
    </div>
    <!--------------------------- 列表--start----------------------------------------- -->
    <div class="tableCon">
      <Table
        :height="tableHeight"
        @on-selection-change="tableSelectionChange"
        size="small"
        ref="selection"
        border
        :columns="Taskcolumns"
        :data="Taskdata"
        tooltip-theme="light"
      >
        <template slot="comment" slot-scope="{row}">
          <span v-if="!commentOverFilter(row.comment)">{{row.comment}}</span>
          <Poptip
            title="任务描述"
            v-if="commentOverFilter(row.comment)"
            word-wrap
            width="130"
            theme="light"
            :content="row.comment"
            placement="right-start"
          >{{row.comment | commentFilter}}</Poptip>
        </template>

        <template slot="taskName" slot-scope="{row}">
          <el-link @click="goTaskBuilding(row)" type="primary">{{row.taskName}}</el-link>
        </template>
        <!-- 列表进度条 -->
        <template slot="progress" slot-scope="{row}">
          <el-progress :percentage="progressHandler(row)"></el-progress>
        </template>
        <template
          slot="area"
          slot-scope="{row}"
        >{{row.provinceName}}{{row.cityName}}{{row.districtName}}</template>
        <!-- 列表的操作栏 -->
        <template slot="action" slot-scope="{row}">
          <el-button size="mini" type="primary" @click="publishClick(row)">
            <i class="iconCommon iconPublish"></i>发布
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="underCarriageClick(row)">
            <i class="iconCommon iconUndercarriage"></i>下架
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="downloadClick(row)">
            <i class="iconCommon iconDownload"></i>下载
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="editTaskClick(row)">
            <i class="iconCommon iconEdit"></i>编辑
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="deleteClick(row)">
            <i class="iconCommon iconDelete"></i>删除
          </el-button>
          <!-- <el-link size="mini" type="primary" @click="publishClick">
            发布
          </el-link>
          <el-link size="mini" class="lf10" type="primary" @click="underCarriageClick">
            下架
          </el-link>
          <el-link size="mini" class="lf10" type="primary" @click="downloadClick">
            下载
          </el-link>
          <el-link size="mini" class="lf10" type="primary" @click="editTaskClick(row)">
            编辑
          </el-link>
          <el-link size="mini" class="lf10" type="primary" @click="deleteClick(row)">
            删除
          </el-link>-->
        </template>
      </Table>
      <div class="line10"></div>
      <!-- 分页器 -->
      <div class="pageCon">
        <Page
          :total="total"
          :page-size="searchForm.size"
          show-elevator
          show-total
          show-sizer
          @on-change="pageChange"
          @on-page-size-change="pageSizeChange"
        />
      </div>
    </div>
    <!-- 弹窗区 -->
    <el-dialog :visible.sync="createTaskModal" width="500px" title="创建任务">
      <CreateTask ref="createTask" @success="createTaskSuccess" @cancel="createTaskModal=false" />
    </el-dialog>

    <el-dialog :visible.sync="editTaskModal" width="500px" title="修改任务">
      <EditTask ref="editTask" @success="updateTaskSuccess" @cancel="editTaskModal=false" />
    </el-dialog>
    <el-dialog
      :before-close="taskDownloadClose"
      :visible.sync="downTaskModal"
      width="480px"
      title="任务下载"
    >
      <div v-loading="downloadLoading" style="min-height:200px" element-loading-text="数据加载中...">
        <el-collapse
          v-if="downloadTaskObjArrCopy.length>0"
          class="taskDown"
          accordion
          v-model="collapseActiveName"
        >
          <el-collapse-item
            :name="index+1+''"
            v-for="(downloadTaskObj,index) in downloadTaskObjArrCopy"
            :key="downloadTaskObj.id"
          >
            <template slot="title">
              <div class="taskDownInfoCon">
                <span>{{downloadTaskObj.taskName}}</span>
                <span>
                  {{downloadTaskObj.totalFloor}}
                  ({{downloadTaskObj.greenNum | formatNullValue}}
                  /{{downloadTaskObj.redNum | formatNullValue}})
                </span>
              </div>
            </template>
            <div class="taskDownBody">
              <el-card
                v-for="item in downloadTaskObj.downloadBuildingArrs"
                :key="item.id"
                body-style="{border:0}"
                shadow="never"
              >
                <div slot="header" style="height:30px" class="clearfix">
                  <span>{{item.buildingName}}</span>
                  <span
                    style="float: right;"
                  >{{item.totalFloor}}({{item.greenNum | formatNullValue}}/{{item.redNum | formatNullValue}})</span>
                </div>
                <div class="floorItemCon">
                  <div
                    class="floorItem"
                    :class="{floorItemGreen:it.isGreen,floorItemRed:it.isRed}"
                    v-for="it in item.floors"
                    :key="it.id"
                  >{{it.floorNum | formatFloorFilter}}</div>
                </div>
              </el-card>
            </div>
          </el-collapse-item>
        </el-collapse>
        <div
          style="min-height:200px"
          v-show="downloadTaskObjArrCopy.length==0&&!downloadLoading"
          class="center"
        >暂无楼层信息</div>
      </div>
      <div slot="footer">
        <div class="center">
          <el-button size="mini" @click="taskDownloadCancle">取消</el-button>
          <el-button
            type="primary"
            v-show="floorForDownloadArr.length!=0"
            size="mini"
            @click="downFloorClick"
          >下载</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="请选择数据类型" :visible.sync="dataTypeBatchModal" width="30%">
      <el-radio v-model="radioBatchPublish" label="geojson">geojson</el-radio>
      <el-radio v-model="radioBatchPublish" label="shp" disabled>shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dataTypeBatchModal=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="publishBatchOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择数据类型" :visible.sync="dataTypeModal" width="30%">
      <el-radio v-model="radioPublish" label="geojson">geojson</el-radio>
      <el-radio v-model="radioPublish" label="shp" disabled>shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dataTypeModal=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="publishOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择下载格式" :visible.sync="formatModal" width="30%">
      <el-radio v-model="radioDown" label="geojson">geojson</el-radio>
      <el-radio v-model="radioDown" label="shp" disabled>shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="formatModal=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="downOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择下载格式" :visible.sync="formatBatchModal" width="30%">
      <el-radio v-model="radioBatchDown" label="geojson">geojson</el-radio>
      <el-radio v-model="radioBatchDown" label="shp" disabled>shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="formatBatchModal=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="downBatchOkClick">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Entity from "./indexJs";

export default Entity;
</script>
<style scoped>
@import url("./indexCss.css");
</style>
