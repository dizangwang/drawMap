import {
  mapActions,
  mapGetters
} from "vuex";
import SetFloorInfo from "./setFloorInfo.vue";

export default {
  name: "ChartShowControl",
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: {
    SetFloorInfo
  },
  data() {
    return {
      // 数据图表数据
      dataChartData: [{
        id: 22
      }],
      // 数据图表列值
      dataChartColumn: [{
        title: "选择",
        type: "selection",
        width: 80
      },
      {
        title: "序号",
        key: "id"
      },
      {
        title: "FID",
        key: "id"
      },
      {
        title: "类型ID",
        key: "id"
      },
      {
        title: "高度",
        key: "id"
      },
      {
        title: "名称",
        key: "id"
      }
      ],
      // 数据图表信息弹窗
      dataChartInfoModal: false,
      // 元素样式列数据
      elementStyleColumn: [{
        title: "选择",
        type: "selection",
        width: 80
      },
      {
        title: "样式名称",
        key: "name"
      },
      {
        title: "类型ID",
        key: "typeId"
      },
      {
        title: "填充颜色",
        slot: "color"
      }
      ],
      // 元素样式数据
      elementStyleData: [{
        name: "样式1",
        typeId: 555,
        color: "red"
      },
      {
        name: "样式1",
        typeId: 555,
        color: "yellow"
      }
      ],
      // 编辑主题样式展示
      editElementStyleModal: false,
      // 楼层
      floor: "",
      // 表单字段
      formValidate: {
        taskId: "",
        buildingName: "",
        overGroundFloor: "",
        underGroundFloor: "",
        lineData: ""
      },
      // 校验规则
      ruleValidate: {
        buildingName: [{
          required: true,
          message: "请填写楼宇名称",
          trigger: "blur"
        }]
      },
      // 设置楼层信息
      setFloorInfoModal: false,
      // 左侧-顶部-tab栏
      tabNum: 1,

      // 元素高度
      elementHeight: 0,
      // 标注高度
      markHeight: 0,
      // 元素样式
      elementStyle: "",
      // 右侧地图高度
      height: "",
      // 楼宇信息
      buildObj: {}
    };
  },
  mounted() {
    var that = this;
    that.height = `${window.innerHeight - 80}px`;
    window.onresize = () => {
      that.height = `${window.innerHeight - 80}px`;
    };
    that.buildObj = that.utils.localstorageGet("buildObj");
    that.getFloorOutlineByBuildingId();
    that.loadFloor();
    that.getFloorInfoById(78);
    that.getIcons();
    that.getElementStyles();
    that.getLabelStyles();
  },
  methods: {
    // 设置楼层信息
    setFloorInfoClick() {
      var that = this;
      that.setFloorInfoModal = true;
    },
    // 保存楼层信息成功
    setFloorInfoSuccess() {},
    // 获得所有的标注样式
    getLabelStyles() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getLabelStyles,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 获取所有元素样式
    getElementStyles() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getElementStyles,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 获取所有图标
    getIcons() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getIcons,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 加载楼层信息
    loadFloor() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.loadFloor + that.buildObj.id,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 设置楼层完成
    floorFinishById(id) {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.floorFinishById + id,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 根据楼层id获取楼层信息
    getFloorInfoById(id) {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getFloorInfoById + id,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    // 根据楼宇id获取整个楼层的信息
    getFloorOutlineByBuildingId() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getFloorOutlineByBuildingId + that.buildObj.id,
          data: ""
        })
        .then((res) => {
          const {
            data
          } = res;
          if (data.code === 200) {
            // todo
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    }
  }
};
