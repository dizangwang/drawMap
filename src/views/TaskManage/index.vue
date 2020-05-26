<template>
  <div class="myProject">
    <div class="handler">
      <div class="left">
        <el-select size="mini" class="leftSelect lf20" v-model="task">
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
        <el-button size="mini" class="lf10" type="primary">
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
    <el-dialog title="请选择数据类型" :visible.sync="dataTypeModal" width="30%">
      <el-radio v-model="radio" label="1">geoJson</el-radio>
      <el-radio v-model="radio" label="2">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini">取 消</el-button>
        <el-button size="mini" type="primary" @click="publishOkClick">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="请选择下载格式" :visible.sync="formatModal" width="30%">
      <el-radio v-model="radio" label="1">geoJson</el-radio>
      <el-radio v-model="radio" label="2">shp</el-radio>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini">取 消</el-button>
        <el-button size="mini" type="primary" @click="downOkClick">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

import CreateTask from "./createTask.vue";
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
      radio: "",
      projectType: "",
      fullScreenModal: false,
      createTaskModal: false,
      editTaskModal: false,
      dataTypeModal: false,
      formatModal: false,
      lineData: "",
      task: "",
      type: "",
      tableSelectionArr: [],
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
    tableSelectionChange(e) {
      var that = this;
      that.tableSelectionArr = e;
    },
    // 根据条件查询
    searchClick() {},
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
    publishBatchClick() {
      var that = this;
      that
        .$confirm("是否批量发布?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.$message({
            type: "success",
            message: "发布成功!"
          });
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消发布"
          });
        });
    },
    downOkClick() {
      var that = this;
      that.formatModal = false;
      that.$message({
        type: "success",
        message: "下载成功!"
      });
    },
    downloadClick() {
      var that = this;
      that.formatModal = true;
    },
    publishClick() {
      var that = this;
      that.dataTypeModal = true;
    },
    publishOkClick() {
      var that = this;
      that.dataTypeModal = false;
      that.$message({
        type: "success",
        message: "发布成功!"
      });
    },
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
    editTaskClick() {
      var that = this;
      that.editTaskModal = true;
    },
    createTaskClick() {
      var that = this;
      that.createTaskModal = true;
    },
    // 地图轮廓退出
    lineQuit() {
      var that = this;
      that.fullScreenModal = false;
    },

    // 地图轮廓保存
    lineSave(data) {
      var that = this;
      that.lineData = data;
    },

    // 点击创建轮廓
    mapOutLineClick() {
      var that = this;
      that.fullScreenModal = true;
      that.$refs.drawProfile.initData();
    },
    goChartShowControl() {
      var that = this;
      that.$router.push({ path: "/chartShowControl" });
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
