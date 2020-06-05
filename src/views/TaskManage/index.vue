<template>
  <div class="myProject">
    <!--------------------------- 顶部操作栏--start----------------------------------- -->
    <div class="handler">
      <div class="left">
        <el-select size="mini" class="leftSelect lf20" v-model="task" @change="taskChange">
          <el-option value="1" label="任务"></el-option>
          <el-option value="2" label="楼宇"></el-option>
        </el-select>
        <span class="lf5">任务类型</span>
        <el-select v-model="searchForm.taskTypeId" size="mini" class="leftSelect lf5">
          <el-option value>任务类型</el-option>
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
          <el-button size="mini" type="primary" @click="publishClick">
            <i class="iconCommon iconPublish"></i>发布
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="underCarriageClick">
            <i class="iconCommon iconUndercarriage"></i>下架
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="downloadClick">
            <i class="iconCommon iconDownload"></i>下载
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="editTaskClick(row)">
            <i class="iconCommon iconEdit"></i>编辑
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="deleteClick(row)">
            <i class="iconCommon iconDelete"></i>删除
          </el-button>
        </template>
      </Table>
      <div class="line10"></div>
      <!-- 分页器 -->
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
    <!-- 弹窗区 -->
    <el-dialog :visible.sync="createTaskModal" width="500px" title="创建任务">
      <CreateTask ref="createTask" @success="createTaskSuccess" @cancel="createTaskModal=false" />
    </el-dialog>

    <el-dialog :visible.sync="editTaskModal" width="500px" title="修改任务">
      <EditTask ref="editTask" @success="updateTaskSuccess" @cancel="editTaskModal=false" />
    </el-dialog>
    <el-dialog :visible.sync="downTaskModal" width="480px" title="任务下载">
      <el-collapse class="taskDown" accordion>
        <el-collapse-item>
          <template slot="title">
            <div class="taskDownInfoCon">
              <span>任务1（下载中）</span>
              <span>26(18/4)</span>
            </div>
          </template>
          <div class="taskDownBody">
            <el-card body-style="{border:0}" shadow="never">
              <div slot="header" style="height:30px" class="clearfix">
                <span>楼宇1（下载中）</span>
                <span style="float: right;">10(3/5)</span>
              </div>
              <div class="floorItemCon">
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>
                <div class="floorItem floorItemRed">6F</div>
                <div class="floorItem floorItemRed">7F</div>
                <div class="floorItem floorItemRed">8F</div>
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
              </div>
            </el-card>
            <el-card body-style="{border:0}" shadow="never">
              <div slot="header" style="height:30px" class="clearfix">
                <span>楼宇1（下载中）</span>
                <span style="float: right;">10(3/5)</span>
              </div>
              <div class="floorItemCon">
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>
                <div class="floorItem floorItemRed">6F</div>
                <div class="floorItem floorItemRed">7F</div>
                <div class="floorItem floorItemRed">8F</div>
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
              </div>
            </el-card>
            <el-card body-style="{border:0}" shadow="never">
              <div slot="header" style="height:30px" class="clearfix">
                <span>楼宇1（下载中）</span>
                <span style="float: right;">10(3/5)</span>
              </div>
              <div class="floorItemCon">
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>

                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>
                <div class="floorItem floorItemRed">6F</div>
                <div class="floorItem floorItemRed">7F</div>
                <div class="floorItem floorItemRed">8F</div>
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
              </div>
            </el-card>
          </div>
        </el-collapse-item>
        <el-collapse-item>
          <template slot="title">
            <div class="taskDownInfoCon">
              <span>任务1（下载中）</span>
              <span>26(18/4)</span>
            </div>
          </template>
          <div class="taskDownBody">
            <el-card body-style="{border:0}" shadow="never">
              <div slot="header" style="height:30px" class="clearfix">
                <span>楼宇1（下载中）</span>
                <span style="float: right;">10(3/5)</span>
              </div>
              <div class="floorItemCon">
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>
                <div class="floorItem floorItemRed">6F</div>
                <div class="floorItem floorItemRed">7F</div>
                <div class="floorItem floorItemRed">8F</div>
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
              </div>
            </el-card>
            <el-card body-style="{border:0}" shadow="never">
              <div slot="header" style="height:30px" class="clearfix">
                <span>楼宇1（下载中）</span>
                <span style="float: right;">10(3/5)</span>
              </div>
              <div class="floorItemCon">
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>
                <div class="floorItem floorItemRed">6F</div>
                <div class="floorItem floorItemRed">7F</div>
                <div class="floorItem floorItemRed">8F</div>
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
              </div>
            </el-card>
            <el-card body-style="{border:0}" shadow="never">
              <div slot="header" style="height:30px" class="clearfix">
                <span>楼宇1（下载中）</span>
                <span style="float: right;">10(3/5)</span>
              </div>
              <div class="floorItemCon">
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>

                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>
                <div class="floorItem floorItemRed">6F</div>
                <div class="floorItem floorItemRed">7F</div>
                <div class="floorItem floorItemRed">8F</div>
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
              </div>
            </el-card>
          </div>
        </el-collapse-item>
        <el-collapse-item>
          <template slot="title">
            <div class="taskDownInfoCon">
              <span>任务1（下载中）</span>
              <span>26(18/4)</span>
            </div>
          </template>
          <div class="taskDownBody">
            <el-card body-style="{border:0}" shadow="never">
              <div slot="header" style="height:30px" class="clearfix">
                <span>楼宇1（下载中）</span>
                <span style="float: right;">10(3/5)</span>
              </div>
              <div class="floorItemCon">
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>
                <div class="floorItem floorItemRed">6F</div>
                <div class="floorItem floorItemRed">7F</div>
                <div class="floorItem floorItemRed">8F</div>
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
              </div>
            </el-card>
            <el-card body-style="{border:0}" shadow="never">
              <div slot="header" style="height:30px" class="clearfix">
                <span>楼宇1（下载中）</span>
                <span style="float: right;">10(3/5)</span>
              </div>
              <div class="floorItemCon">
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>
                <div class="floorItem floorItemRed">6F</div>
                <div class="floorItem floorItemRed">7F</div>
                <div class="floorItem floorItemRed">8F</div>
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
              </div>
            </el-card>
            <el-card body-style="{border:0}" shadow="never">
              <div slot="header" style="height:30px" class="clearfix">
                <span>楼宇1（下载中）</span>
                <span style="float: right;">10(3/5)</span>
              </div>
              <div class="floorItemCon">
                <div class="floorItem floorItemGreen">1F</div>
                <div class="floorItem floorItemGreen">2F</div>
                <div class="floorItem floorItemGreen">3F</div>
                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>

                <div class="floorItem floorItemGreen">4F</div>
                <div class="floorItem floorItemGreen">5F</div>
                <div class="floorItem floorItemRed">6F</div>
                <div class="floorItem floorItemRed">7F</div>
                <div class="floorItem floorItemRed">8F</div>
                <div class="floorItem">9F</div>
                <div class="floorItem">10F</div>
              </div>
            </el-card>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div slot="footer">
        <div class="center">
          <el-button size="mini" @click="downTaskModal=false">取消</el-button>
          <el-button type="primary" size="mini">下载</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="请选择数据类型" :visible.sync="dataTypeBatchModal" width="30%">
      <el-radio v-model="radioBatchPublish" label="1">geoJson</el-radio>
      <el-radio v-model="radioBatchPublish" label="2">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dataTypeBatchModal=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="publishBatchOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择数据类型" :visible.sync="dataTypeModal" width="30%">
      <el-radio v-model="radioPublish" label="1">geoJson</el-radio>
      <el-radio v-model="radioPublish" label="2">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dataTypeModal=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="publishOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择下载格式" :visible.sync="formatModal" width="30%">
      <el-radio v-model="radioDown" label="1">geoJson</el-radio>
      <el-radio v-model="radioDown" label="2">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="formatModal=false">取 消</el-button>
        <el-button size="mini" type="primary" @click="downOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择下载格式" :visible.sync="formatBatchModal" width="30%">
      <el-radio v-model="radioBatchDown" label="1">geoJson</el-radio>
      <el-radio v-model="radioBatchDown" label="2">shp</el-radio>
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
