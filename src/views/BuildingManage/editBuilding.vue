<template>
  <div class="task olme">
    <input style="height:0px;width:0px" type="file" id="file" />
    <el-form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-width="0">
      <table class="wd100">
        <tr>
          <td class="rightLebal">任务名称：</td>
          <td>{{detailFromPre.taskName}}</td>
        </tr>
        <tr>
          <td class="required rightLebal">楼宇名称：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="buildingName">
              <el-input
                size="small"
                v-model="formValidate.buildingName"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>
          </td>
        </tr>
        <tr>
          <td class="required rightLebal">地上楼层：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="overGroundFloor">
              <el-input-number v-model="formValidate.overGroundFloor" :min="0"></el-input-number>
            </el-form-item>
          </td>
        </tr>
        <tr>
          <td class="required rightLebal">地下楼层：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="overGroundFloor">
              <el-input-number v-model="formValidate.underGroundFloor" :max="0"></el-input-number>
            </el-form-item>
          </td>
        </tr>
        <tr>
          <td class="rightLebal">楼宇轮廓：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="lineData">
              <div class="centerStart">
                <el-button @click="uploadFile" size="mini" type="primary">
                  <i class="el-icon-upload"></i>点击上传
                </el-button>
                <a href="./template.geojson" download>
                  <el-popover placement="top-start" trigger="hover" content="下载示例，查看数据格式">
                    <i slot="reference" class="el-icon-download iconleft"></i>
                  </el-popover>
                </a>
                <el-popover placement="top-start" trigger="hover" content="绘制地图轮廓">
                  <i
                    slot="reference"
                    @click="mapOutLineClick"
                    class="el-icon-map-location iconleft"
                  ></i>
                </el-popover>
                <el-popover placement="top-start" trigger="hover" content="清空轮廓数据">
                  <i slot="reference" @click="clearOutLineData" class="el-icon-close iconleft"></i>
                </el-popover>
              </div>
            </el-form-item>
          </td>
        </tr>
      </table>
    </el-form>
    <div class="line20"></div>
    <div class="center">
      <el-button size="mini" @click="cancelClick">取消</el-button>
      <el-button size="mini" type="primary" @click="handleSubmit">确定</el-button>
    </div>

    <!-- 全屏对话框 -->

    <Modal
      v-model="fullScreenModal"
      footer-hide
      fullscreen
      :closable="false"
      :z-index="3022"
      title="地图轮廓"
    >
      <DrawProfile ref="drawProfile" @save="lineSave" @quit="lineQuit"></DrawProfile>
    </Modal>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

// 引入轮廓绘制插件
import DrawProfile from "../../components/DrawProfile.vue";

export default {
  name: "Header",
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: {
    DrawProfile
  },
  data() {
    // 校验楼层方法
    var validatefloor = (rule, value, callback) => {
      var that = this;
      if (
        that.formValidate.overGroundFloor - that.formValidate.underGroundFloor
        < 1
      ) {
        callback(new Error("总楼层数必须大于等于1"));
      }
      callback();
    };

    return {
      // 用于反显轮廓
      editOutLine: "",

      // 表单字段
      formValidate: {
        id: "",
        taskId: "",
        buildingName: "",
        overGroundFloor: "",
        underGroundFloor: "",
        lineData: ""
      },
      // 上级传过来的任务对象

      taskObj: {},

      // 全屏展示
      fullScreenModal: false,

      // 从列表中传过来的数据
      detailFromPre: {},

      // 校验规则
      ruleValidate: {
        buildingName: [
          { required: true, message: "请填写楼宇名称", trigger: "blur" }
        ],
        overGroundFloor: [
          {
            validator: validatefloor,
            message: "总楼层数必须大于等于1",
            trigger: "blur"
          }
        ],
        underGroundFloor: [
          {
            validator: validatefloor,
            message: "总楼层数必须大于等于1",
            trigger: "blur"
          }
        ]
      },

      // 任务对象
      taskData: {}
    };
  },
  mounted() {
    var that = this;

    // 上传geojson文件
    that.utils.parseGeson(that, "file").then((res) => {
      if (res.code === 200) {
        const { data } = res;
        let str = "";
        Object.keys(data).forEach((item, index) => {
          str += `floorOutline[${index}].floor=${item}&`;
          const coorArr = data[item].geometry.coordinates;
          const arr = [];
          coorArr.forEach((it) => {
            arr.push({ lng: it[0], lat: it[1] });
          });
          str += `floorOutline[${index}].outline=${JSON.stringify(arr)}&`;
        });
        that.formValidate.lineData = str;
      }
    });
  },
  methods: {
    // 点击上传文件
    uploadFile() {
      document.querySelector("#file").click();
    },
    // 清除轮廓信息
    clearOutLineData() {
      var that = this;
      if (that.formValidate.lineData === "") {
        return;
      }
      that
        .$confirm("是否确认清空轮廓数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          that.$message({
            type: "success",
            message: "轮廓数据已清空!"
          });
          that.formValidate.lineData = "";
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "已取消清空"
          });
        });
    },

    // 地图轮廓退出
    lineQuit() {
      var that = this;
      that.fullScreenModal = false;
    },

    // 地图轮廓保存
    lineSave(lineData) {
      var that = this;
      var str = "";
      Object.keys(lineData).forEach((item, index) => {
        var floorNum = "";
        if (item.indexOf("F") > -1) {
          floorNum = +item.replace("F", "");
        }
        if (item.indexOf("B") > -1) {
          floorNum = -+item.replace("B", "");
        }
        if (item.indexOf("M") > -1) {
          floorNum = -+item.replace("M", "");
        }
        str += `floorOutline[${index}].floor=${floorNum}&`;
        str += `floorOutline[${index}].outline=${JSON.stringify(
          lineData[item]
        )}&`;
      });
      that.formValidate.lineData = str;
    },

    // 点击创建轮廓
    mapOutLineClick() {
      var that = this;
      that.fullScreenModal = true;
      that.$refs.drawProfile.initData({
        address:
          that.taskData.provinceName
          + that.taskData.cityName
          + that.taskData.districtName,
        editOutLine: that.editOutLine
      });
    },

    // 根据楼宇id获取整个楼层的轮廓信息
    getFloorByBuildingId(id) {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getFloorOutlineByBuildingId + id,
          data: ""
        })
        .then((res) => {
          var { data } = res;
          if (data.code === 200) {
            const obj = data.data;
            let str = "";
            const newObj = {};
            Object.keys(obj).forEach((item, index) => {
              str += `floorOutline[${index}].floor=${item}&`;
              str += `floorOutline[${index}].outline=${obj[item]}&`;
              const key = +item;
              if (key > 0) {
                newObj[`F${key}`] = obj[item];
              } else {
                newObj[`B${-key}`] = obj[item];
              }
            });

            // 用于编辑图层反显
            that.editOutLine = newObj;

            // 回填 lineData
            that.formValidate.lineData = str;
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 被外部调用时初始化方法
    init(row) {
      var that = this;

      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
      });
      that.detailFromPre = row;
      that.$refs.formValidate.resetFields();
      that.getBuildingById(row.id);
      that.getTaskById(row.taskId);
      that.getFloorByBuildingId(row.id);
    },

    // 根据任务id获取详情
    getTaskById(id) {
      var that = this;
      var param = {};
      that
        .ajax({
          method: "get",
          url: that.apis.getTaskById + id,
          data: param
        })
        .then((res) => {
          const { data } = res;
          if (data.code === 200) {
            that.taskData = data.data;
          }
        });
    },

    // 根据任务id获取详情
    getBuildingById(id) {
      var that = this;
      var param = {};
      that
        .ajax({
          method: "get",
          url: that.apis.getBuildingById + id,
          data: param
        })
        .then((res) => {
          const { data } = res;
          if (data.code === 200) {
            const detailData = data.data;
            that.formValidate.id = detailData.id;
            that.formValidate.taskId = detailData.taskId;
            that.formValidate.buildingName = detailData.buildingName;
            that.formValidate.overGroundFloor = detailData.overGroundFloor;
            that.formValidate.underGroundFloor = detailData.underGroundFloor;
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 上传文件成功回调
    uploadSuccess() {
      // todo
    },

    // 点击取消事件
    cancelClick() {
      this.$emit("cancel");
    },

    // 提交表单事件
    handleSubmit() {
      var that = this;
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          const obj = {
            taskId: "",
            buildingName: "",
            overGroundFloor: "",
            underGroundFloor: ""
          };
          let str = "";
          Object.keys(obj).forEach((item) => {
            str += `${item}=${that.formValidate[item]}&`;
          });
          str += that.formValidate.lineData;
          that
            .ajax({
              method: "post",
              url: that.apis.buildingMgrUpdate + that.formValidate.id,
              data: str
            })
            .then((res) => {
              const { data } = res;
              if (data.code === 200) {
                that.$message({
                  message: "提交成功",
                  type: "success"
                });
                that.$emit("success");
              } else {
                that.$message({
                  message: data.msg,
                  type: "warning"
                });
              }
            });
        }
      });
    }
  }
};
</script>
<style scoped>
.area {
  display: flex;
  justify-content: space-between;
}
.centerStart {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.areaSelect {
  width: 180px;
}
.iconleft {
  margin-left: 15px;
  font-size: 20px;
  font-weight: bolder;
  cursor: pointer;
}
a {
  color: unset;
  display: block;
}
</style>
