import {
  mapActions,
  mapGetters
} from "vuex";

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
      // 下载任务弹窗
      downTaskModal: false,
      // 表格高度
      tableHeight: "",
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
      radioBatchPublish: "geojson",
      // 表格-发布-数据类型
      radioPublish: "geojson",
      // 表格-下载-数据类型
      radioDown: "geojson",
      // 顶部-下载-数据类型
      radioBatchDown: "geojson",
      // 顶部 任务/楼宇 选择
      task: "1",
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
        title: "任务名称",
        slot: "taskName"
      },
      {
        title: "任务类型",
        key: "taskTypeName"
      },
      {
        title: "所属区域",
        slot: "area"
      },
      {
        title: "任务描述",
        slot: "comment",
        tooltip: true
      },
      {
        title: "任务进度",
        slot: "progress"
      },
      {
        title: "任务操作",
        slot: "action",
        width: 280,
        align: "center"
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
      // 省份列表
      provinceList: [],
      // 城市列表
      cityList: [],
      // 区域列表
      districtList: [],
      // 发布任务id
      publishId: "",
      // 下载的记录id
      downloadTaskObjArr: [],
      // 下载默认展示窗口
      collapseActiveName: "1",
      // 任务下载楼宇接口
      downloadBuildingArrs: [],
      // 下载标记
      downloadFlag: "",
      // 渲染任务下载数据
      downloadTaskObjArrCopy: [],
      // 渲染任务下载数据时loading
      downloadLoading: false,
      // 需要被下载的楼层
      floorForDownloadArr: [],
      // 是否请求超时
      isTimeout: false,
      // 左下角下载按钮展示
      leftBottomTaskDownShow: false

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
    that.utils.localstorageSet("buildObj", "");
    // 动态调整容器长度
    that.tableHeight = window.innerHeight - 135;
    window.onresize = () => {
      that.tableHeight = window.innerHeight - 135;
    };
  },
  filters: {
    // 针对任务描述超过20个字进行处理
    commentFilter(value) {
      var val = `${value}`;
      if (val.length > 20) {
        val = `${val.substring(0, 20)}...`;
      }
      return val;
    },
    // 格式化楼层
    formatFloorFilter(value) {
      var val = +value;
      if (val > 0) {
        return `F${val}`;
      }
      if (val < 0) {
        return `B${-val}`;
      }
      return value;
    },
    // 格式化非值
    formatNullValue(value) {
      var val = +value;
      if (val) {
        return val;
      }
      return 0;
    }
  },
  methods: {
    ...mapActions(["setTaskTypes"]),
    // 取消任务下载
    taskDownloadCancle() {
      var that = this;
      that.downTaskModal = false;
      that.leftBottomTaskDownShow = false;
    },
    // 任务下载窗口关闭事件
    taskDownloadClose(done) {
      var that = this;
      if (that.isTimeout) {
        that.leftBottomTaskDownShow = true;
        that.getFloorMgrPrepareDownload();
      }
      done();
    },
    // 任务下载接口
    floorMgrFinishDownload(id) {
      var that = this;
      that
        .ajax({
          method: "post",
          url: that.apis.floorMgrFinishDownload,
          data: {
            flag: that.downloadFlag,
            type: that.radioDown,
            taskId: id
          }
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code !== 200) {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 下载点击事件
    downFloorClick() {
      var that = this;
      var taskIds = [];
      that.downloadTaskObjArr.forEach((item) => {
        taskIds.push(item.id);
      });
      that.leftBottomTaskDownShow = false;
      that.utils.postDownload({
        url: window.location.origin + that.apis.floorMgrFinishDownload,
        data: {
          flag: that.downloadFlag,
          taskId: taskIds.join(","),
          type: that.radioDown
        }
      });
      that.downTaskModal = false;
    },
    // 获取下载数据处理情况
    getFloorMgrPrepareDownload() {
      var that = this;
      window.timer = setInterval(() => {
        that
          .ajax({
            method: "timeoutPost",
            url: that.apis.floorMgrPrepareDownload,
            data: {
              flag: that.downloadFlag,
              id: that.floorForDownloadArr.join(","),
              type: that.radioDown
            }
          })
          .then((res) => {
            const {
              data
            } = res;
            if (data.code === 200) {
              that.$message({
                message: "下载数据已处理完成，可查看处理情况及下载",
                type: "success"
              });
              window.clearInterval(window.timer);
              window.timer = "";
            }
          });
      }, 3000);
    },
    // 单楼层下载准备接口
    floorMgrPrepareDownload(id) {
      var that = this;
      that.isTimeout = false;
      that.leftBottomTaskDownShow = false;
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
            const result = data.data;
            that.downloadLoading = false;
            that.downloadTaskObjArrCopy = JSON.parse(JSON.stringify(that.downloadTaskObjArr));
            if (result) {
              that.downloadTaskObjArrCopy.forEach((element, num) => {
                let taskRedNum = 0;
                let taskGreenNum = 0;
                that.downloadTaskObjArrCopy[num].downloadBuildingArrs.forEach((item, ind) => {
                  const itemCopy = JSON.parse(JSON.stringify(item));
                  const {
                    floors
                  } = itemCopy;
                  let redNum = 0;
                  let greenNum = 0;
                  floors.forEach((it, index) => {
                    if (result[it.id]) {
                      itemCopy.floors[index].isRed = true;
                      redNum += 1;
                      taskRedNum += 1;
                    } else {
                      itemCopy.floors[index].isGreen = true;
                      greenNum += 1;
                      taskGreenNum += 1;
                    }
                  });

                  itemCopy.redNum = redNum;
                  itemCopy.greenNum = greenNum;
                  that.downloadTaskObjArrCopy[num].downloadBuildingArrs[ind] = itemCopy;
                });
                that.downloadTaskObjArrCopy[num].redNum = taskRedNum;
                that.downloadTaskObjArrCopy[num].greenNum = taskGreenNum;
              });
            } else {
              that.downloadTaskObjArrCopy.forEach((element, num) => {
                const taskRedNum = 0;
                let taskGreenNum = 0;
                if (that.downloadTaskObjArrCopy[num].downloadBuildingArrs && that
                  .downloadTaskObjArrCopy[num].downloadBuildingArrs.length > 0) {
                  that.downloadTaskObjArrCopy[num].downloadBuildingArrs.forEach((item,
                    ind) => {
                    const itemCopy = JSON.parse(JSON.stringify(item));
                    const {
                      floors
                    } = itemCopy;
                    const redNum = 0;
                    let greenNum = 0;
                    if (floors && floors.length > 0) {
                      floors.forEach((it, index) => {
                        greenNum += 1;
                        taskGreenNum += 1;
                        itemCopy.floors[index].isGreen = true;
                      });
                    }

                    itemCopy.redNum = redNum;
                    itemCopy.greenNum = greenNum;
                    that.downloadTaskObjArrCopy[num].downloadBuildingArrs[ind] = itemCopy;
                  });
                }

                that.downloadTaskObjArrCopy[num].redNum = taskRedNum;
                that.downloadTaskObjArrCopy[num].greenNum = taskGreenNum;
              });
            }
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
            that.downTaskModal = false;
          }
        })
        .catch((error) => {
          if (/timeout/gi.test(error)) {
            that.isTimeout = true;
            that.$message({
              message: "后台正在处理下载数据，请稍后",
              type: "warning"
            });
          }
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
            var arr = [];
            // 循环任务对象列表 包括单个和列表勾选的
            that.downloadTaskObjArr.forEach((element, num) => {
              if (that.downloadTaskObjArr[num].downloadBuildingArrs) {
                that.downloadTaskObjArr[num].downloadBuildingArrs.forEach((item) => {
                  const {
                    floors
                  } = item;
                  if (floors) {
                    floors.forEach((it) => {
                      arr.push(it.id);
                    });
                  }
                });
              }
            });
            that.floorForDownloadArr = arr;
            if (arr.length > 0) {
              that.floorMgrPrepareDownload(arr.join(","));
            } else {
              that.downloadLoading = false;
              that.floorForDownloadArr = [];
              that.downloadTaskObjArrCopy = JSON.parse(JSON.stringify(that.downloadTaskObjArr));
            }
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
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
    // 根据任务id查询楼宇列表；
    getBuildingByTaskId1() {
      var that = this;
      that.downloadLoading = true;
      that.collapseActiveName = "1";
      that.downloadTaskObjArrCopy = [];
      that.downloadTaskObjArr.forEach((itm, indexNum) => {
        const param = {};
        param.taskId = itm.id;
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
              // 组装数据 给任务挂载楼宇列表 给楼宇挂载楼层列表
              const {
                records
              } = data.data;
              // console.log(itm.id,records)
              if (records.length !== 0) {
                const promiseArr = [];
                // 循环任务下的楼宇
                records.forEach((item, index) => {
                  const promise = new Promise((resolve) => {
                    // 根据楼宇id获取
                    that.getFloorOutlineByBuildingId(item.id, (resultData) => {
                      // console.log("####",resultData);
                      records[index].floors = resultData;
                      that.downloadTaskObjArr[indexNum].downloadBuildingArrs = records;
                      // const obj = {};
                      // obj.index = indexNum;
                      // obj.data = resultData;
                      // resolve(obj);
                      resolve();
                    });
                  });
                  promiseArr.push(promise);
                });
                // console.log(indexNum + 1, that.downloadTaskObjArr.length)
                // 执行所有promise
                Promise.all(promiseArr).then((result) => {
                  // 当执行到最后一个时执行floorMgrGetDownloadFlag方法

                  if ((indexNum + 1) === that.downloadTaskObjArr.length) {
                    // console.log("&&&&", indexNum + 1)
                    that.floorMgrGetDownloadFlag();
                  }
                }).catch((error) => {
                  // todo
                  // console.log(error)
                });
              } else if (that.downloadTaskObjArr.length === 1) {
                // 如果没有楼层且任务数量为一个时，直接进行展示
                that.downloadLoading = false;
                that.floorForDownloadArr = [];
                that.downloadTaskObjArrCopy = JSON.parse(JSON.stringify(that
                  .downloadTaskObjArr));
              }
            } else {
              that.$message({
                message: data.msg,
                type: "warning"
              });
            }
          });
      });
    },
    // 根据任务id查询楼宇列表；
    getBuildingByTaskId() {
      var that = this;
      that.downloadLoading = true;
      that.collapseActiveName = "1";
      that.downloadTaskObjArrCopy = [];
      var promiseObjArr = [];
      that.downloadTaskObjArr.forEach((itm, indexNum) => {
        const promiseObj = new Promise(((relve) => {
          const param = {};
          param.taskId = itm.id;
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
                // 组装数据 给任务挂载楼宇列表 给楼宇挂载楼层列表
                const {
                  records
                } = data.data;
                if (records.length !== 0) {
                  const promiseArr = [];
                  // 循环任务下的楼宇
                  records.forEach((item, index) => {
                    const promise = new Promise((resolve) => {
                      // 根据楼宇id获取
                      that.getFloorOutlineByBuildingId(item.id, (resultData) => {
                        records[index].floors = resultData;
                        that.downloadTaskObjArr[indexNum]
                          .downloadBuildingArrs = records;
                        resolve();
                      });
                    });
                    promiseArr.push(promise);
                  });

                  // 执行所有promise
                  Promise.all(promiseArr).then((result) => {
                    // 当执行到最后一个时执行floorMgrGetDownloadFlag方法
                    relve(11);
                  }).catch((error) => {
                    // console.log(error)
                  });
                }
                if (records.length === 0 && that.downloadTaskObjArr.length === 1) {
                  // 如果没有楼层且任务数量为一个时，直接进行展示
                  that.downloadLoading = false;
                  that.floorForDownloadArr = [];
                  that.downloadTaskObjArrCopy = JSON.parse(JSON.stringify(that
                    .downloadTaskObjArr));
                  relve(11);
                }
                if (records.length === 0 && that.downloadTaskObjArr.length !== 1) {
                  relve(11);
                }
              } else {
                that.$message({
                  message: data.msg,
                  type: "warning"
                });
              }
            });
        }));
        promiseObjArr.push(promiseObj);
      });
      Promise.all(promiseObjArr).then((result) => {
        that.floorMgrGetDownloadFlag();
      });
    },
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
    // 判断任务描述是否超出20个字
    commentOverFilter(value) {
      var val = `${value}`;
      if (val.length > 20) {
        return true;
      }
      return false;
    },
    // 跳转到任务下的楼宇，任务信息通过缓存传递
    goTaskBuilding(row) {
      var that = this;
      that.utils.localstorageSet("taskObj", row);
      that.$router.push({
        path: `/buildingManage/${row.id}`
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
      } else {
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
      } else {
        that.searchForm.city = "";
        that.searchForm.district = "";
      }
    },
    // 根据区域id获取区域列表
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
          that.$router.push({
            path: "/buildingManage"
          });
        }
      } else if (e === 2) {
        that.$router.push({
          path: "/buildingManage"
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
      that
        .ajax({
          method: "get",
          url: that.apis.taskMgrList,
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
          message: "请先选择需要下架的任务"
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
        .$confirm("是否批量下架该?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.unpublishTask(ids);
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
        .$confirm("是否下架该文件?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.unpublishTask(row.id);
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
      let ids = "";
      const arr = [];
      that.tableSelectionArr.forEach((item) => {
        arr.push(item.id);
      });
      ids = arr.join(",");
      that.publishTask(ids, that.radioBatchPublish);
    },
    // 表格操作栏-按钮-下载-弹窗-确定--点击事件
    downOkClick() {
      var that = this;
      that.formatModal = false;
      that.downTaskModal = true;
      that.getBuildingByTaskId();
    },
    // 表格操作栏-按钮-下载--点击事件
    downloadClick(row) {
      var that = this;
      that.formatModal = true;
      that.downloadTaskObjArr = [row];
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
      that.downloadTaskObjArr = that.tableSelectionArr;
      //  that.getBuildingByTaskId();
      that.formatModal = true;
    },
    // 表格操作栏-按钮-发布--点击事件
    publishClick(row) {
      var that = this;
      that.publishId = row.id;
      that.dataTypeModal = true;
    },
    // 表格操作栏-按钮-发布-弹窗-确定-点击事件
    publishOkClick() {
      var that = this;
      that.dataTypeModal = false;
      that.publishTask(that.publishId, that.radioPublish);
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
    // 单个或批量下架
    unpublishTask(id) {
      var that = this;
      var param = {
        id
      };
      that
        .ajax({
          method: "post",
          url: that.apis.taskMgrUnPublish,
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
            that.search();
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 单个或批量发布
    publishTask(id, type) {
      var that = this;
      var param = {
        id,
        type
      };
      that
        .ajax({
          method: "post",
          url: that.apis.taskMgrPublish,
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
            that.search();
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
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
