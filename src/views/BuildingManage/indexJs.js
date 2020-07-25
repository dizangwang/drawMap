// 创建任务组件
import CreateBuilding from "./createBuilding.vue";

// 编辑任务组件
import EditBuilding from "./editBuilding.vue";

export default {
  name: "Login",
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
      radioBatchPublish: "geojson",

      // 表格-发布-数据类型
      radioPublish: "geojson",

      // 表格-下载-数据类型
      radioDown: "geojson",

      // 顶部-下载-数据类型
      radioBatchDown: "geojson",

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
        slot: "floor"
      },
      {
        title: "完成状态",
        slot: "progress",
        tooltip: true
      },
      {
        title: "楼宇操作",
        slot: "action",
        width: 280,
        align: "center"
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
      taskObj: "",

      // 发布id
      publishId: "",

      // 需要下载的楼宇
      buildingForDownloadArr: [],

      // 下载标记
      downloadFlag: "",

      // 任务id
      taskId: ""
    };
  },
  mounted() {
    var that = this;
    // 获取任务id
    that.taskId = that.$route.params.id;
    if (that.taskId) {
      // 修改列值
      that.Taskcolumns.splice(1, 1);
      // 获取任务详情
      that.getTaskById(that.taskId, (taskObj) => {
        that.taskObj = taskObj;
        // 查询
        that.searchClick();
      });
    } else {
      // 查询
      that.searchClick();
    }
    // 获取省份
    that.getAreasWithPid("", (data) => {
      that.provinceList = data;
    });

    // 清空缓存中的楼宇信息
    that.utils.localstorageSet("buildObj", "");
    // 表格高度
    that.tableHeight = window.innerHeight - 135;
    // 动态设置表格高度
    window.onresize = () => {
      that.tableHeight = window.innerHeight - 135;
    };
  },
  methods: {

    // 根据任务id获取详情
    getTaskById(id, fn) {
      var that = this;
      var param = {};
      that
        .ajax({
          method: "get",
          url: that.apis.getTaskById + id,
          data: param
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // 赋值任务详情
            const detailData = data.data;
            fn(detailData);
          }
        });
    },

    // 处理进度数据
    progressHandler(row) {
      var that = this;
      var num = 0;
      var totalFloor = +row.totalFloor;
      var finishedFloor = +row.finishedFloor;
      // 如果楼层总数或者完成的楼层数为0则返回值为0
      if (totalFloor === 0 || finishedFloor === 0) {
        num = 0;
        return num;
      }
      // 完成的楼层除以总楼层数乘以100
      num = Math.round((finishedFloor / totalFloor) * 100);
      return num;
    },

    // 点击楼宇名称进入绘制页面
    goDrawMap(row) {
      var that = this;
      that.utils.localstorageSet("buildObj", row);
      // 跳转
      that.$router.push({
        path: `/drawMap/${row.id}`
      });
    },

    // 监听城市变动
    cityChange(id) {
      var that = this;
      if (id) {
        // 获取城市列表
        that.getAreasWithPid(id, (data) => {
          that.districtList = data;
        });
        // 清空区域列表
        that.searchForm.district = "";
      } else {
        // 清空区域列表
        that.searchForm.district = "";
      }
    },

    // 监听省份变动
    provinceChange(id) {
      var that = this;
      if (id) {
        // 获取城市列表
        that.getAreasWithPid(id, (data) => {
          that.cityList = data;
        });
        // 清空城市列表
        that.searchForm.city = "";
        // 清空区县列表
        that.searchForm.district = "";
      } else {
        // 清空城市列表
        that.searchForm.city = "";
        // 清空区县列表
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
            // 回调函数
            fn(data.data);
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
      // 执行搜索
      that.search();
    },

    // 创建楼宇成功回调
    updateTaskSuccess() {
      var that = this;
      that.editBuildingModal = false;
      // 执行搜索
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
      // 赋值
      that.tableSelectionArr = e;
    },

    // 分页器-页码变动
    pageChange(num) {
      var that = this;
      // 赋值当前页码
      that.searchForm.current = num;
      // 搜索
      that.search();
    },

    // 分页器-展示记录数变动
    pageSizeChange(num) {
      var that = this;
      // 展示记录数变动赋值
      that.searchForm.size = num;
      // 执行搜索
      that.search();
    },

    // 点击搜索按钮
    searchClick() {
      var that = this;
      // 重置当前页码为1
      that.searchForm.current = 1;
      // 执行搜索
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
            that.total = data.data.total;
            that.Taskdata = data.data.records;
            that.tableSelectionArr = [];
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
        .$confirm("是否批量下架?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          let ids = "";
          const arr = [];
          that.tableSelectionArr.forEach((item) => {
            arr.push(item.id);
          });
          ids = arr.join(",");
          // 执行下架
          that.buildingMgrUnPublish(ids);
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消下架"
          });
        });
    },

    // 表格操作栏-按钮-下架--点击事件
    underCarriageClick(row) {
      var that = this;
      that
        .$confirm("是否下架该楼宇?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          // 执行下架
          that.buildingMgrUnPublish(row.id);
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
      // 判断有没有勾选楼宇
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
      let ids = "";
      const arr = [];
      // 拼装ids
      that.tableSelectionArr.forEach((item) => {
        arr.push(item.id);
      });
      ids = arr.join(",");
      // 执行发布
      that.publishBuilding(ids, that.radioBatchPublish);
    },

    // 表格操作栏-按钮-下载-弹窗-确定--点击事件
    downOkClick() {
      var that = this;
      // 声明promise数组
      var promiseArr = [];
      that.formatModal = false;
      // 循环需要下载的楼宇
      that.buildingForDownloadArr.forEach((item, index) => {
        const promise = new Promise(((resolve) => {
          that.getFloorOutlineByBuildingId(item.id, (data) => {
            if (data) {
              // 拼装楼宇下的楼层
              that.buildingForDownloadArr[index].floors = data;
            }
            resolve(data);
          });
        }));
        promiseArr.push(promise);
      });

      // 执行所有promise
      Promise.all(promiseArr).then((result) => {
        // 执行单层下载准备接口
        that.floorMgrGetDownloadFlag();
      });
    },

    // 单楼层下载准备接口
    floorMgrGetDownloadFlag() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.floorMgrGetDownloadFlag,
          data: {}
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // 获取flag
            that.downloadFlag = data.msg;
            const arr = [];
            // 获取楼层id
            that.buildingForDownloadArr.forEach((item, index) => {
              if (item.floors) {
                item.floors.forEach((it, ind) => {
                  arr.push(it.id);
                });
              }
            });
            if (arr.length > 0) {
              that.floorMgrPrepareDownload(arr.join(","));
            } else {
              that.$message({
                message: "暂无楼层信息",
                type: "warning"
              });
            }
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 楼层准备下载
    floorMgrPrepareDownload(id) {
      var that = this;
      that
        .ajax({
          method: "timeoutPost",
          url: that.apis.floorMgrPrepareDownload,
          data: {
            flag: that.downloadFlag,
            id,
            type: that.radioDown
          }
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // 下载楼宇
            that.downFloorClick();
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        })
        .catch((error) => {
          if (/timeout/gi.test(error)) {
            that.isTimeout = true;
            that.$message({
              message: "请求超时",
              type: "warning"
            });
          }
        });
    },

    // 下载点击事件
    downFloorClick() {
      var that = this;
      var buildIds = [];
      // 拼装楼宇id
      that.buildingForDownloadArr.forEach((item) => {
        buildIds.push(item.id);
      });
      that.leftBottomTaskDownShow = false;
      // 执行下载方法
      that.utils.postDownload({
        url: window.location.origin + that.apis.floorMgrFinishDownload,
        data: {
          flag: that.downloadFlag,
          buildingId: buildIds.join(","),
          type: that.radioDown
        }
      });
    },

    // 根据楼宇id获取整个楼层的信息
    getFloorOutlineByBuildingId(id, fn) {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getFloorInfoByBuildingId,
          data: {
            buildingId: id
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

    // 表格操作栏-按钮-下载--点击事件
    downloadClick(row) {
      var that = this;
      // that.formatModal = true;
      // 单个下载的楼宇
      that.buildingForDownloadArr = [row];
      that.downOkClick();
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
      // 需要下载的楼宇
      that.buildingForDownloadArr = that.tableSelectionArr;
      // that.formatModal = true;
      that.downOkClick();
    },

    // 表格操作栏-按钮-发布--点击事件
    publishClick(row) {
      var that = this;
      // 赋值楼宇id
      that.publishId = row.id;
      that.dataTypeModal = true;
    },

    // 表格操作栏-按钮-发布-弹窗-确定-点击事件
    publishOkClick() {
      var that = this;
      that.dataTypeModal = false;
      // 发布楼宇
      that.publishBuilding(that.publishId, that.radioPublish);
    },

    // 顶部操作栏-按钮-删除--点击事件
    deleteBatchClick() {
      var that = this;

      // 判断有没有勾选
      if (that.tableSelectionArr.length === 0) {
        that.$message({
          type: "error",
          message: "请先选择需要删除的楼宇"
        });
        return;
      }
      let ids = "";
      const arr = [];
      // 拼装参数
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
          // 批量删除
          that.deleteTask(ids);
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },

    // 发布
    publishBuilding(id, type) {
      var that = this;
      var param = {
        id,
        type
      };
      that
        .ajax({
          method: "post",
          url: that.apis.buildingMgrPublish,
          data: param
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            that.$message({
              type: "success",
              message: "发布成功!"
            });
            // 搜索
            that.search();
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 下架
    buildingMgrUnPublish(id) {
      var that = this;
      var param = {
        id
      };
      that
        .ajax({
          method: "post",
          url: that.apis.buildingMgrUnPublish,
          data: param
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            that.$message({
              type: "success",
              message: "下架成功!"
            });
            // 搜索
            that.search();
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
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
            // 搜索
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
        .$confirm("是否删除该楼宇?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          // 删除任务
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
        // 调用编辑楼宇组件的初始化方法
        that.$refs.editTask.init(row);
      });
    },

    // 顶部操作栏-按钮-创建任务--点击事件
    createBuildingClick() {
      var that = this;
      that.createBuildingModal = true;
      that.$nextTick(() => {
        // 调用创建楼宇组件的初始化方法
        that.$refs.createBuilding.init(that.taskObj);
      });
    }
  }
};
