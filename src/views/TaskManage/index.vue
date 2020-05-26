<template>
  <div class="myProject">
    <div class="handler">
      <div class="left">
        <el-select size="mini" class="leftSelect lf20" v-model="task" @change="taskChange">
          <el-option value="1" label="任务"></el-option>
          <el-option value="2" label="楼宇"></el-option>
        </el-select>
        <el-select v-model="type" size="mini" class="leftSelect lf20">
          <el-option value="1" label="任务类型1"></el-option>
          <el-option value="2" label="任务类型2"></el-option>
        </el-select>
        <el-input size="mini" class="leftInput lf20" placeholder="按任务名称搜索" />
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

    <div class="tableCon">
      <Table
        @on-selection-change="tableSelectionChange"
        size="small"
        ref="selection"
        border
        :columns="Taskcolumns"
        :data="Taskdata"
      >
        <template slot="progress">
          <el-progress :percentage="50"></el-progress>
        </template>
        <template slot="action">
          <el-button size="mini" type="primary" @click="publishClick">
            <i class="iconCommon iconPublish"></i>发布
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="underCarriageClick">
            <i class="iconCommon iconUndercarriage"></i>下架
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="downloadClick">
            <i class="iconCommon iconDownload"></i>下载
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="editTaskClick">
            <i class="iconCommon iconEdit"></i>编辑
          </el-button>
          <el-button size="mini" class="lf10" type="primary" @click="deleteClick">
            <i class="iconCommon iconDelete"></i>删除
          </el-button>
        </template>
      </Table>

      <div class="line10"></div>
      <Page :total="100" show-sizer />
    </div>
    <el-dialog :visible.sync="createTaskModal" title="创建任务">
      <CreateTask />
    </el-dialog>
    <el-dialog :visible.sync="editTaskModal" title="修改任务">
      <EditTask />
    </el-dialog>

    <el-dialog title="请选择数据类型" :visible.sync="dataTypeBatchModal" width="30%">
      <el-radio v-model="radioBatchPublish" label="1">geoJson</el-radio>
      <el-radio v-model="radioBatchPublish" label="2">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini">取 消</el-button>
        <el-button size="mini" type="primary" @click="publishBatchOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择数据类型" :visible.sync="dataTypeModal" width="30%">
      <el-radio v-model="radioPublish" label="1">geoJson</el-radio>
      <el-radio v-model="radioPublish" label="2">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini">取 消</el-button>
        <el-button size="mini" type="primary" @click="publishOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择下载格式" :visible.sync="formatModal" width="30%">
      <el-radio v-model="radioDown" label="1">geoJson</el-radio>
      <el-radio v-model="radioDown" label="2">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini">取 消</el-button>
        <el-button size="mini" type="primary" @click="downOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择下载格式" :visible.sync="formatBatchModal" width="30%">
      <el-radio v-model="radioBatchDown" label="1">geoJson</el-radio>
      <el-radio v-model="radioBatchDown" label="2">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini">取 消</el-button>
        <el-button size="mini" type="primary" @click="downBatchOkClick">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
// 创建任务组件
import CreateTask from "./createTask.vue";
// 编辑任务组件
import EditTask from "./editTask.vue";

export default {
  name: "Login",
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: {
    CreateTask,
    EditTask
  },
  data() {
    return {
      // 创建任务弹窗展示
      createTaskModal: false,
      // 编辑任务弹窗展示
      editTaskModal: false,
      // 表格-发布-数据类型弹窗-展示
      dataTypeModal: false,
      // 表格-下载-数据类型弹窗-展示
      formatModal: false,
      // 顶部-发布-数据类型弹窗-展示
      dataTypeBatchModal: false,
      // 顶部-下载-数据类型弹窗-展示
      formatBatchModal: false,
      // 顶部-发布-数据类型
      radioBatchPublish: "",
      // 表格-发布-数据类型
      radioPublish: "",
      // 表格-下载-数据类型
      radioDown: "",
      // 顶部-下载-数据类型
      radioBatchDown: "",
      // 顶部任务/楼宇选择
      task: "1",
      // 任务类型
      type: "",
      // 选中的表格数据
      tableSelectionArr: [],
      // 表格的列数据
      Taskcolumns: [
        {
          type: "selection",
          key: "id",
          width: 50
        },
        {
          title: "任务名称",
          key: "id"
        },
        {
          title: "任务类型",
          key: "taskType",
          width: 100
        },
        {
          title: "所属区域",
          key: "id"
        },
        {
          title: "任务描述",
          key: "id",
          width: 280
        },
        {
          title: "任务进度",
          slot: "progress"
        },
        {
          title: "任务操作",
          slot: "action",
          width: 440
        }
      ],
      // 表格的数据
      Taskdata: [
        {
          id: "John Brown",
          taskType: "类型"
        }
      ]
    };
  },
  mounted() {},
  methods: {
    taskChange(e) {
      var that = this;
      if (typeof e === "string") {
        if (e === "2") {
          that.$router.push({ path: "/chartShowControl" });
        }
      } else if (e === 2) {
        that.$router.push({ path: "/chartShowControl" });
      }
    },
    // 勾选表格下拉框事件
    tableSelectionChange(e) {
      var that = this;
      that.tableSelectionArr = e;
    },
    // 根据条件查询
    searchClick() {},
    // 顶部操作栏-按钮-下架--点击事件
    underCarriageBatchClick() {
      var that = this;
      that
        .$confirm("是否批量下架该?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.$message({
            type: "success",
            message: "下架成功!"
          });
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消下架"
          });
        });
    },
    // 表格操作栏-按钮-下架--点击事件
    underCarriageClick() {
      var that = this;
      that
        .$confirm("是否下架该文件?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.$message({
            type: "success",
            message: "下架成功!"
          });
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消下架"
          });
        });
    },
    // 顶部操作栏-按钮-发布--点击事件
    publishBatchClick() {
      var that = this;
      that.dataTypeBatchModal = true;
    },
    // 表格操作栏-按钮-发布--点击事件
    publishBatchOkClick() {
      var that = this;
      that.dataTypeBatchModal = false;
      that.$message({
        type: "success",
        message: "发布成功!"
      });
    },
    // 表格操作栏-按钮-下载-弹窗-确定--点击事件
    downOkClick() {
      var that = this;
      that.formatModal = false;
      that.$message({
        type: "success",
        message: "下载成功!"
      });
    },
    // 表格操作栏-按钮-下载--点击事件
    downloadClick() {
      var that = this;
      that.formatModal = true;
    },
    // 顶部操作栏-按钮-下载-弹窗-确定--点击事件
    downBatchOkClick() {
      var that = this;
      that.formatBatchModal = false;
      that.$message({
        type: "success",
        message: "下载成功!"
      });
    },
    // 顶部操作栏-按钮-下载--点击事件
    downBatchloadClick() {
      var that = this;
      that.formatBatchModal = true;
    },
    // 表格操作栏-按钮-发布--点击事件
    publishClick() {
      var that = this;
      that.dataTypeModal = true;
    },
    // 表格操作栏-按钮-发布-弹窗-确定-点击事件
    publishOkClick() {
      var that = this;
      that.dataTypeModal = false;
      that.$message({
        type: "success",
        message: "发布成功!"
      });
    },
    // 顶部操作栏-按钮-删除--点击事件
    deleteBatchClick() {
      var that = this;
      that
        .$confirm("是否批量删除?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.$message({
            type: "success",
            message: "删除成功!"
          });
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 表格操作栏-按钮-删除--点击事件
    deleteClick() {
      var that = this;
      that
        .$confirm("是否删除该文件?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.$message({
            type: "success",
            message: "删除成功!"
          });
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 表格操作栏-按钮-编辑--点击事件
    editTaskClick() {
      var that = this;
      that.editTaskModal = true;
    },
    // 顶部操作栏-按钮-创建任务--点击事件
    createTaskClick() {
      var that = this;
      that.createTaskModal = true;
    }
  }
};
</script>
<style scoped>
.tableCon {
  padding: 20px;
}
.area {
  display: flex;
  justify-content: space-between;
}
.areaSelect {
  width: 120px;
}
.handler {
  display: block;
  height: 50px;
  background: #eafef7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.leftSelect {
  width: 100px;
}
.leftInput {
  width: 150px;
}
.right {
  margin-right: 20px;
}
</style>
