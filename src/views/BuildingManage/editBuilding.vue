<template>
  <div class="task olme">
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
                <el-upload
                  class="upload-demo"
                  action="https://jsonplaceholder.typicode.com/posts/"
                  @on-success="uploadSuccess"
                >
                  <el-button size="mini" type="primary">
                    <i class="el-icon-upload"></i>点击上传
                  </el-button>
                </el-upload>
                <el-popover placement="top-start" trigger="hover" content="下载示例，查看数据格式">
                  <i slot="reference" class="el-icon-download iconleft"></i>
                </el-popover>
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
      :z-index="2002"
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
        ],
        lineData: [
          {
            validator: validatefloorData,
            message: "轮廓数据不能为空"
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
        str += `floorOutline[${index}].floor="${item}"&`;
        str += `floorOutline[${index}].outline="${JSON.stringify(
          lineData[item]
        )}"&`;
      });
      that.formValidate.lineData = str;
    },
    // 点击创建轮廓
    mapOutLineClick() {
      var that = this;
      that.fullScreenModal = true;
      that.$refs.drawProfile.initData("北京市丰台区");
    },
    // 被外部调用时初始化方法
    init(row) {
      var that = this;

      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
      });
      that.detailFromPre = row;
      that.$refs.formValidate.resetFields();
      that.getTaskById(row.id);
    },
    // 根据任务id获取详情
    getTaskById(id) {
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
              url: that.apis.buildingMgrSave + str,
              data: {}
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
</style>
