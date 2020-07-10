<template>
  <div class="myProject">
    <div class="handler">
      <div class="left">
        <el-select
          v-if="!taskObj"
          size="mini"
          class="leftSelect lf20"
          style="width:100px"
          v-model="task"
          @change="taskChange"
        >
          <el-option value="1" label="任务"></el-option>
          <el-option value="2" label="楼宇"></el-option>
        </el-select>
        <span>
         <el-popover  v-if="taskObj"  placement="bottom-start" content="返回上一页" trigger="hover">
          <i
           v-if="taskObj"
            slot="reference"
            onclick="window.history.back()"
            class="iconCommon historybackIcon historyBack lf20"
            style="vertical-align:-0.5em;margin-right:0"
          ></i>
        </el-popover>
        </span>
        <span v-if="taskObj" class="lf10">{{taskObj.taskName}}</span>
        <!-- <el-select
          v-model="searchForm.publishStatus"
          placeholder="发布状态"
          size="mini"
          class="leftSelect lf20"
        >
          <el-option
            v-for="item in publishStatusList"
            :value="item.id"
            :label="item.name"
            :key="item.id"
          ></el-option>
        </el-select>
        <el-select
          v-model="searchForm.finishStatus"
          placeholder="完成状态"
          size="mini"
          class="leftSelect lf10"
        >
          <el-option
            v-for="item in finishStatusList"
            :value="item.id"
            :label="item.name"
            :key="item.id"
          ></el-option>
        </el-select>-->
        <span v-if="!taskObj" class="lf15">楼宇区域</span>
        <el-select
          v-if="!taskObj"
          size="mini"
          clearable
          v-model="searchForm.province"
          placeholder="省"
          class="leftSelect lf10"
          @clear="provinceChange"
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
          v-if="!taskObj"
          clearable
          size="mini"
          v-model="searchForm.city"
          placeholder="市"
          class="leftSelect lf10"
          @clear="cityChange"
          @change="cityChange"
        >
          <el-option v-for="item in cityList" :value="item.id" :label="item.name" :key="item.id"></el-option>
        </el-select>
        <el-select
          v-if="!taskObj"
          size="mini"
          clearable
          v-model="searchForm.district"
          placeholder="区"
          class="leftSelect lf10"
        >
          <el-option
            v-for="item in districtList"
            :value="item.id"
            :label="item.name"
            :key="item.id"
          ></el-option>
        </el-select>

        <el-input
          v-model="searchForm.buildingName"
          size="mini"
          class="leftInput lf10"
          style="width:135px"
          maxlength="20"
          placeholder="请输入楼宇名称"
        />
        <el-button @click="searchClick" size="mini" class="lf15" type="primary">确定</el-button>
      </div>
      <div class="right">
        <el-button size="mini" class="lf10" type="primary" @click="publishBatchClick">发布</el-button>
        <el-button size="mini" class="lf10" type="primary" @click="underCarriageBatchClick">下架</el-button>
        <el-button size="mini" class="lf10" type="primary" @click="downBatchloadClick">下载</el-button>
        <el-button size="mini" class="lf10" @click="deleteBatchClick">删除</el-button>
        <el-button
          v-if="taskObj"
          class="lf10"
          size="mini"
          type="success"
          @click="createBuildingClick"
        >
          <i class="iconCommon iconAdd"></i>创建楼宇
        </el-button>
      </div>
    </div>

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
        <template slot="buildingName" slot-scope="{row}">
          <el-link @click="goDrawMap(row)" type="primary">{{row.buildingName}}</el-link>
        </template>
        <template slot="progress" slot-scope="{row}">
          <el-progress :percentage="progressHandler(row)"></el-progress>
        </template>
        <template slot="floor" slot-scope="{row}">{{+row.overGroundFloor-row.underGroundFloor}}</template>

        <template slot="action" slot-scope="{row}">
          <el-button size="small" class="buttonHover" type="text" @click="publishClick(row)">发布</el-button>
          <el-button
            size="small"
            class="buttonHover"
            type="text"
            @click="underCarriageClick(row)"
          >下架</el-button>
          <el-button size="small" class="buttonHover" type="text" @click="downloadClick(row)">下载</el-button>
          <el-button size="small" class="buttonHover" type="text" @click="editTaskClick(row)">编辑</el-button>
          <el-button size="small" class="buttonHover" type="text" @click="deleteClick(row)">删除</el-button>
        </template>
      </Table>
      <div class="line10"></div>
      <div class="pageCon">
        <Page
          :current="searchForm.current"
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

    <el-dialog  :close-on-click-modal=false :visible.sync="createBuildingModal" width="400px" title="创建楼宇">
      <CreateBuilding
        ref="createBuilding"
        @success="createBuildingSuccess"
        @cancel="createBuildingModal=false"
      />
    </el-dialog>
    <el-dialog :visible.sync="editBuildingModal" width="400px" title="修改楼宇">
      <EditBuilding ref="editTask" @success="updateTaskSuccess" @cancel="editBuildingModal=false" />
    </el-dialog>

    <el-dialog title="请选择数据类型" :visible.sync="dataTypeBatchModal" width="30%">
      <el-radio v-model="radioBatchPublish" label="geojson">geojson</el-radio>
      <el-radio v-model="radioBatchPublish" label="shp">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dataTypeBatchModal=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="publishBatchOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择数据类型" :visible.sync="dataTypeModal" width="30%">
      <el-radio v-model="radioPublish" label="geojson">geojson</el-radio>
      <el-radio v-model="radioPublish" label="shp">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dataTypeModal=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="publishOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择下载格式" :visible.sync="formatModal" width="30%">
      <el-radio v-model="radioDown" label="geojson">geojson</el-radio>
      <el-radio v-model="radioDown" label="shp">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="formatModal=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="downOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择下载格式" :visible.sync="formatBatchModal" width="30%">
      <el-radio v-model="radioBatchDown" label="geojson">geojson</el-radio>
      <el-radio v-model="radioBatchDown" label="shp">shp</el-radio>
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
