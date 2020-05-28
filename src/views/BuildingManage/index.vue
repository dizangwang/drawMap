<template>
  <div class="myProject">
    <div class="handler">
      <div class="left">
        <el-select size="mini" class="leftSelect lf20" v-model="task" @change="taskChange">
          <el-option value="1" label="任务"></el-option>
          <el-option value="2" label="楼宇"></el-option>
        </el-select>
        <el-select
          v-model="searchForm.publishStatus"
          placeholder="发布状态"
          size="mini"
          class="leftSelect lf10"
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
          <el-option
            v-for="item in cityList"
            :value="item.id"
            :label="item.name"
            :key="item.id"
          ></el-option>
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
          v-model="searchForm.buildingName"
          size="mini"
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
        <el-button class="lf10" size="mini" type="primary" @click="createBuildingClick">
          <i class="iconCommon iconAdd"></i>创建楼宇
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
        <template slot="progress" slot-scope="{row}">
          <el-progress :percentage="row.progress"></el-progress>
        </template>
        <template slot="floor" slot-scope="{row}">{{+row.overGroundFloor-row.underGroundFloor}}</template>

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
      <Page
        :total="total"
        :page-size="searchForm.size"
        show-elevator
        show-total
        @on-change="pageChange"
        @on-page-size-change="pageSizeChange"
      />
    </div>

    <el-dialog :visible.sync="createBuildingModal" width="30%" title="创建楼宇">
      <CreateBuilding ref="createTask" @success="createBuildingSuccess" @cancel="createBuildingModal=false" />
    </el-dialog>
    <el-dialog :visible.sync="editBuildingModal" title="修改任务">
      <EditBuilding ref="editTask" @success="updateTaskSuccess" @cancel="editBuildingModal=false" />
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
import CreateBuilding from "./createBuilding.vue";
// 编辑任务组件
import EditBuilding from "./editBuilding.vue";

export default {
  name: "Login",
  computed: {
    ...mapGetters(["userInfo", "taskTypes"])
  },
  components: {
    CreateBuilding,
    EditBuilding
  },
  data() {
    return {
      // 创建楼宇弹窗展示
      createBuildingModal: false,
      // 编辑任务弹窗展示
      editBuildingModal: false,
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
      task: "2",
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
          title: "所属任务",
          key: "taskName"
        },
        {
          title: "楼宇名称",
          key: "buildingName",
          width: 100
        },
        {
          title: "楼宇楼层",
          slot: "floor"
        },
        {
          title: "完成状态",
          key: "comment",
          tooltip: true
        },

        {
          title: "楼宇操作",
          slot: "action",
          width: 430
        }
      ],
      // 表格的数据
      Taskdata: [],
      // 搜索表单
      searchForm: {
        city: "",
        current: 1,
        district: "",
        province: "",
        size: 10,
        buildingName: "",
        finishStatus: "",
        publishStatus: "",
        taskId: ""
      },
      finishStatusList: [
        { id: "", name: "全部" },
        { id: "1", name: "完成" },
        { id: "2", name: "未完成" }
      ],
      publishStatusList: [
        { id: "", name: "全部" },
        { id: "1", name: "发布" },
        { id: "2", name: "未发布" }
      ],
      provinceList: [],
      cityList: [],
      districtList: [],
      total: 1
    };
  },
  mounted() {
    var that = this;
    that.getAllTypes();
    that.searchClick();
    that.getAreasWithPid("", (data) => {
      that.provinceList = data;
    });
  },
  methods: {
    ...mapActions(["setTaskTypes"]),
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
    // 根据上级id查询下级区域列表
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
    // 创建楼宇成功回调
    createBuildingSuccess() {
      var that = this;
      that.createBuildingModal = false;
      that.search();
    },
    // 创建楼宇成功回调
    updateTaskSuccess() {
      var that = this;
      that.editBuildingModal = false;
      that.search();
    },
    // 左上角 任务/楼宇 切换界面
    taskChange(e) {
      var that = this;
      if (typeof e === "string") {
        if (e === "1") {
          that.$router.push({ path: "/taskManage" });
        }
      } else if (e === 1) {
        that.$router.push({ path: "/taskManage" });
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
          url: that.apis.buildingMgrList,
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
      // 判断有没有勾选

      if (that.tableSelectionArr.length === 0) {
        that.$message({
          type: "error",
          message: "请勾选需要删除的数据"
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
    // 删除方法
    deleteTask(id) {
      var that = this;
      var param = {
        id
      };
      that
        .ajax({
          method: "post",
          url: that.apis.deleteBuildingById,
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
      that.editBuildingModal = true;
      that.$nextTick(() => {
        that.$refs.editTask.init(row);
      });
    },

    // 顶部操作栏-按钮-创建任务--点击事件
    createBuildingClick() {
      var that = this;
      that.createBuildingModal = true;
      that.$nextTick(() => {
        that.$refs.createTask.init({ id: 16, taskName: "1d" });
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
  width: 80px;
}
.leftInput {
  width: 150px;
}
.right {
  margin-right: 20px;
}
.areaSelect {
  width: 90px;
  margin-left: 10px;
}
</style>
