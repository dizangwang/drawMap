<template>
  <div class="task olme">
    <el-form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-width="0">
      <table class="wd100">
        <tr>
          <td class="rightLebal">楼层轮廓：</td>

          <td>
            <el-form-item size="mini" label-width="0">
              <div class="centerStart">
                <el-upload
                  class="upload-demo"
                  action="https://jsonplaceholder.typicode.com/posts/"
                  @on-success="uploadSuccess"
                >
                  <el-button size="mini" type="primary">
                    <i class="el-icon-upload"></i>点击上传
                  </el-button>
                </el-upload>

                <el-popover placement="top-start" trigger="hover" content="绘制地图轮廓">
                  <i
                    slot="reference"
                    @click="mapOutLineClick"
                    class="el-icon-map-location iconleft"
                  ></i>
                </el-popover>
              </div>
            </el-form-item>
          </td>
        </tr>
        <tr>
          <td class="required rightLebal">上传平面图：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="lineData">
              <div class="centerStart">
                <el-upload
                  class="upload-demo"
                  action="https://jsonplaceholder.typicode.com/posts/"
                  @on-success="uploadSuccess"
                >
                  <el-button size="mini" type="primary">
                    <i class="el-icon-upload"></i>点击上传
                  </el-button>
                </el-upload>
              </div>
            </el-form-item>
          </td>
        </tr>

        <tr>
          <td class="rightLebal">左上角经纬度：</td>
          <td>
            <div class="centerStart">
              <el-form-item size="mini" label-width="0">
                <el-input
                  class="inputWidth"
                  size="small"
                  placeholder="左上角经度"
                  v-model="formValidate.upperLeftCornerLongitude"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item size="mini" label-width="0">
                <el-input
                  size="small"
                  placeholder="左上角纬度"
                  class="inputWidth lf20"
                  v-model="formValidate.upperLeftCornerLatitude"
                  show-word-limit
                />
              </el-form-item>
            </div>
          </td>
        </tr>
        <tr>
          <td class="rightLebal">右下角经纬度：</td>
          <td>
            <div class="centerStart">
              <el-form-item size="mini" label-width="0">
                <el-input
                  class="inputWidth"
                  size="small"
                  placeholder="右下角经度"
                  v-model="formValidate.lowerRightCornerLongitude"
                  show-word-limit
                />
              </el-form-item>&nbsp;&nbsp;&nbsp;&nbsp;
              <el-form-item size="mini" label-width="0">
                <el-input
                  size="small"
                  class="inputWidth lf20"
                  placeholder="右下角纬度"
                  v-model="formValidate.lowerRightCornerLatitude"
                  show-word-limit
                />
              </el-form-item>
            </div>
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
// 引入地图轮廓信息
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
    // 校验轮廓数据
    var validatefloorData = (rule, value, callback) => {
      var that = this;
      if (that.formValidate.lineData === "") {
        callback(new Error("轮廓数据不能为空"));
      }
      callback();
    };
    return {
      // 表单字段
      formValidate: {
        lineData: "",
        id: "",
        planarGraph: "",
        upperLeftCornerLongitude: "",
        upperLeftCornerLatitude: "",
        lowerRightCornerLongitude: "",
        lowerRightCornerLatitude: ""
      },
      // 上级传过来的任务对象
      taskObj: {},
      // 全屏展示
      fullScreenModal: false,
      // 校验规则
      ruleValidate: {
        buildingName: [
          { required: true, message: "请填写楼宇名称", trigger: "blur" }
        ],

        lineData: [
          {
            validator: validatefloorData,
            message: "请上传平面图"
          }
        ]
      }
    };
  },
  mounted() {},
  methods: {
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
      const address = that.taskObj.provinceName
        + that.taskObj.cityName
        + that.taskObj.districtName;
      that.$refs.drawProfile.initData(address);
    },

    // 被外部调用时初始化方法
    init(taskObj) {
      var that = this;

      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
      });
      that.$refs.formValidate.resetFields();
      that.taskObj = taskObj;
      that.formValidate.taskId = taskObj.id;
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
              url: that.apis.saveFloor,
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
.inputWidth {
  width: 150px;
}
.iconleft {
  margin-left: 15px;
  font-size: 20px;
  font-weight: bolder;
  cursor: pointer;
}
</style>
