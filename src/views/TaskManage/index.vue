<template>
  <div class="myProject">
    <!--------------------------- 顶部操作栏--start----------------------------------- -->
    <div class="handler">
      <div class="left">
        <el-select size="mini" class="leftSelect lf20" v-model="task" @change="taskChange">
          <el-option value="1" label="任务"></el-option>
          <el-option value="2" label="楼宇"></el-option>
        </el-select>
        <el-select v-model="searchForm.taskTypeId" size="mini" class="leftSelect lf20">
          <el-option value>任务类型</el-option>
          <el-option
            v-for="item in taskTypes"
            :value="item.id"
            :label="item.typeName"
            :key="item.id"
          ></el-option>
        </el-select>
        <el-select
          size="mini"
          v-model="searchForm.province"
          placeholder="省"
          class="areaSelect lf10"
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
          class="areaSelect lf10"
          @change="cityChange"
        >
          <el-option v-for="item in cityList" :value="item.id" :label="item.name" :key="item.id"></el-option>
        </el-select>
        <el-select
          size="mini"
          v-model="searchForm.district"
          placeholder="区"
          class="areaSelect lf10"
        >
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
          class="leftInput lf20"
          placeholder="按任务名称搜索"
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
        @on-selection-change="tableSelectionChange"
        size="small"
        ref="selection"
        border
        :columns="Taskcolumns"
        :data="Taskdata"
      >
        <!-- 列表进度条 -->
        <template slot="taskName" slot-scope="{row}">
          <el-link @click="goTaskBuilding(row)" type="primary">{{row.taskName}}</el-link>
        </template>
        <!-- 列表进度条 -->
        <template slot="progress" slot-scope="{row}">
          <el-progress :percentage="row.progress"></el-progress>
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
        @on-change="pageChange"
        @on-page-size-change="pageSizeChange"
      />
    </div>
    <!-- 弹窗区 -->
    <el-dialog :visible.sync="createTaskModal" title="创建任务">
      <CreateTask ref="createTask" @success="createTaskSuccess" @cancel="createTaskModal=false" />
    </el-dialog>

    <el-dialog :visible.sync="editTaskModal" title="修改任务">
      <EditTask ref="editTask" @success="updateTaskSuccess" @cancel="editTaskModal=false" />
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
    ...mapGetters(["userInfo", "taskTypes"])
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

      // 顶部 任务/楼宇 选择
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
          slot: "taskName"
        },
        {
          title: "任务类型",
          key: "taskTypeName",
          width: 100
        },
        {
          title: "所属区域",
          slot: "area"
        },
        {
          title: "任务描述",
          key: "comment",
          tooltip: true
        },
        {
          title: "任务进度",
          slot: "progress"
        },
        {
          title: "任务操作",
          slot: "action",
          width: 430
        }
      ],

      // 表格的数据
      Taskdata: [],

      // 搜索列表数据的参数对象
      searchForm: {
        city: "",
        current: 1,
        district: "",
        province: "",
        size: 10,
        taskName: "",
        taskTypeId: ""
      },

      // 返回的记录总条数
      total: 1,
      provinceList: [],
      cityList: [],
      districtList: []
    };
  },
  mounted() {
    var that = this;
    that.getAllTypes();
    that.searchClick();
    that.getAreasWithPid("", (data) => {
      that.provinceList = data;
    });

    // 每次进入到任务列表，先清空缓存任务对象，防止跳转到楼宇管理的时候，数据混乱
    that.utils.localstorageSet("taskObj", "");
  },
  methods: {
    ...mapActions(["setTaskTypes"]),

    // 跳转到任务下的楼宇，任务信息通过缓存传递
    goTaskBuilding(row) {
      var that = this;
      that.utils.localstorageSet("taskObj", row);
      that.$router.push({ path: `/buildingManage` });
    },

    // 监听城市变动
    cityChange(id) {
      var that = this;
      if (id) {
        that.getAreasWithPid(id, (data) => {
          that.districtList = data;
        });
        that.formValidate.district = "";
      }
    },

    // 监听省份变动
    provinceChange(id) {
      var that = this;
      if (id) {
        that.getAreasWithPid(id, (data) => {
          that.cityList = data;
        });
        that.formValidate.city = "";
        that.formValidate.district = "";
      }
    },

    // 根据区域id获取区域列表
    getAreasWithPid(pid, fn) {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getAreasWithPid,
          data: { pid }
        })
        .then((res) => {
          const { data } = res;
          if (data.code === 200) {
            fn(data.data);
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 获取任务类型放到vuex中
    getAllTypes() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getAllTypes,
          data: {}
        })
        .then((res) => {
          const { data } = res;
          if (data.code === 200) {
            that.taskTypeList = data.data;
            that.setTaskTypes(data.data);
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 创建任务成功后执行的操作
    createTaskSuccess() {
      var that = this;
      that.createTaskModal = false;
      that.search();
    },

    // 更新任务成功后执行的操作
    updateTaskSuccess() {
      var that = this;
      that.editTaskModal = false;
      that.search();
    },

    // 左上角 任务/楼宇 切换界面
    taskChange(e) {
      var that = this;
      that.utils.localstorageSet("taskObj", "");
      if (typeof e === "string") {
        if (e === "2") {
          that.$router.push({ path: "/buildingManage" });
        }
      } else if (e === 2) {
        that.$router.push({ path: "/buildingManage" });
      }
    },

    // 勾选表格下拉框事件
    tableSelectionChange(e) {
      var that = this;
      that.tableSelectionArr = e;
    },

    // 分页器-页码变动
    pageChange(num) {
      var that = this;
      that.searchForm.current = num;
      that.search();
    },

    // 分页器-展示记录数变动
    pageSizeChange(num) {
      var that = this;
      that.searchForm.size = num;
      that.search();
    },

    // 点击搜索按钮
    searchClick() {
      var that = this;
      that.searchForm.current = 1;
      that.search();
    },

    // 根据条件查询列表；
    search() {
      var that = this;
      var param = that.searchForm;
      that
        .ajax({
          method: "get",
          url: that.apis.taskMgrList,
          data: param
        })
        .then((res) => {
          const { data } = res;
          if (data.code === 200) {
            that.Taskdata = data.data.records;
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 顶部操作栏-按钮-下架--点击事件
    underCarriageBatchClick() {
      var that = this;
      if (that.tableSelectionArr.length === 0) {
        that.$message({
          type: "error",
          message: "请先选择需要下架的任务"
        });
        return;
      }
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
      if (that.tableSelectionArr.length === 0) {
        that.$message({
          type: "error",
          message: "请先选择需要发布的任务"
        });
        return;
      }
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
      if (that.tableSelectionArr.length === 0) {
        that.$message({
          type: "error",
          message: "请先选择需要下载的任务"
        });
        return;
      }
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
      // 判断有没有勾选

      if (that.tableSelectionArr.length === 0) {
        that.$message({
          type: "error",
          message: "请先选择需要删除的任务"
        });
        return;
      }
      let ids = "";
      const arr = [];
      that.tableSelectionArr.forEach((item) => {
        arr.push(item.id);
      });
      ids = arr.join(",");
      that
        .$confirm("是否批量删除?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.deleteTask(ids);
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },

    // 根据id删除任务
    deleteTask(id) {
      var that = this;
      var param = {
        id
      };
      that
        .ajax({
          method: "post",
          url: that.apis.taskMgrDelete,
          data: param
        })
        .then((res) => {
          const { data } = res;
          if (data.code === 200) {
            that.$message({
              type: "success",
              message: "删除成功!"
            });
            that.search();
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 表格操作栏-按钮-删除--点击事件
    deleteClick(row) {
      var that = this;
      that
        .$confirm("是否删除该文件?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.deleteTask(row.id);
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },

    // 表格操作栏-按钮-编辑--点击事件
    editTaskClick(row) {
      var that = this;
      that.editTaskModal = true;
      that.$nextTick(() => {
        that.$refs.editTask.init(row.id);
      });
    },

    // 顶部操作栏-按钮-创建任务--点击事件
    createTaskClick() {
      var that = this;
      that.createTaskModal = true;
      that.$nextTick(() => {
        that.$refs.createTask.init();
      });
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
