import {
  mapActions,
  mapGetters
} from "vuex";

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

      // 表格高度
      tableHeight: "",

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
      Taskcolumns: [{
        type: "selection",
        key: "id",
        width: 55,
        align: "center"
      },
      {
        title: "所属任务",
        key: "taskName"
      },
      {
        title: "楼宇名称",
        slot: "buildingName"
      },
      {
        title: "楼宇楼层",
        slot: "floor",
        width: 90
      },
      {
        title: "完成状态",
        slot: "progress",
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
        taskId: ""
      },

      // 完成状态列表
      finishStatusList: [{
        id: "",
        name: "全部"
      },
      {
        id: "1",
        name: "完成"
      },
      {
        id: "2",
        name: "未完成"
      }
      ],

      // 发布状态列表
      publishStatusList: [{
        id: "",
        name: "全部"
      },
      {
        id: "1",
        name: "发布"
      },
      {
        id: "2",
        name: "未发布"
      }
      ],

      // 省份列表
      provinceList: [],

      // 城市列表
      cityList: [],

      // 区域列表
      districtList: [],

      // 记录总条数
      total: 1,

      // 任务对象
      taskObj: ""
    };
  },
  mounted() {
    var that = this;

    /** 从缓存中获取任务对象，如果缓存中有这个对象，
     * 说明是点击某个任务进来的，如果没有就说明是查询所有的楼宇* */
    var taskObj = that.utils.localstorageGet("taskObj");
    that.taskObj = taskObj;
    if (taskObj) {
      that.Taskcolumns.splice(1, 1);
    }
    that.getAllTypes();
    that.searchClick();
    that.getAreasWithPid("", (data) => {
      that.provinceList = data;
    });

    // 清空缓存中的楼宇信息
    that.utils.localstorageSet("buildObj", "");
    that.tableHeight = window.innerHeight - 160;
    window.onresize = () => {
      that.tableHeight = window.innerHeight - 160;
    };
  },
  methods: {
    ...mapActions(["setTaskTypes"]),

    // 处理进度数据
    progressHandler(row) {
      var that = this;
      var num = 0;
      var totalFloor = +row.totalFloor;
      var finishedFloor = +row.finishedFloor;
      if (totalFloor === 0 || finishedFloor === 0) {
        num = 0;
        return num;
      }
      num = Math.round((finishedFloor / totalFloor) * 100);
      return num;
    },

    // 点击楼宇名称进入绘制页面
    goDrawMap(row) {
      var that = this;
      that.utils.localstorageSet("buildObj", row);
      that.$router.push({
        path: `/drawMap`
      });
    },

    // 监听城市变动
    cityChange(id) {
      var that = this;
      if (id) {
        that.getAreasWithPid(id, (data) => {
          that.districtList = data;
        });
        that.searchForm.district = "";
      }
    },

    // 监听省份变动
    provinceChange(id) {
      var that = this;
      if (id) {
        that.getAreasWithPid(id, (data) => {
          that.cityList = data;
        });
        that.searchForm.city = "";
        that.searchForm.district = "";
      }
    },

    // 根据上级id查询下级区域列表
    getAreasWithPid(pid, fn) {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getAreasWithPid,
          data: {
            pid
          }
        })
        .then((res) => {
          const {
            data
          } = res;
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
          const {
            data
          } = res;
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
          that.$router.push({
            path: "/taskManage"
          });
        }
      } else if (e === 1) {
        that.$router.push({
          path: "/taskManage"
        });
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
      if (that.taskObj) {
        param.taskId = that.taskObj.id;
      }
      that
        .ajax({
          method: "get",
          url: that.apis.buildingMgrList,
          data: param
        })
        .then((res) => {
          const {
            data
          } = res;
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
          message: "请先选择需要下架的楼宇"
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
        .$confirm("是否下架该楼宇?", "提示", {
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
          message: "请先选择需要发布的楼宇"
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
          message: "请先选择需要下载的楼宇"
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
          const {
            data
          } = res;
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
        that.$refs.createBuilding.init(that.taskObj);
      });
    }
  }
};
