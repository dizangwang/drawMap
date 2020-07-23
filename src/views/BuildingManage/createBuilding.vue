<template>
  <div class="task olme">
    <input style="height:0px;width:0px" type="file" id="file" />
    <el-form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-width="0">
      <table class="wd100">
        <tr>
          <td class="rightLebal">任务名称：</td>
          <td>{{taskObj.taskName}}</td>
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
// 引入地图轮廓信息
import DrawProfile from "../../components/DrawProfile.vue";

export default {
  name: "CreateBuilding",
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
      // 用于回显的轮廓
      editOutLine: "",

      // 上传文件id
      uploadFileId: "",

      // 表单字段
      formValidate: {
        // 任务id
        taskId: "",
        // 楼宇名称
        buildingName: "",
        // 地上楼层
        overGroundFloor: "",
        // 地下楼层
        underGroundFloor: "",
        // 楼层轮廓
        lineData: ""
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
      }
    };
  },
  mounted() {
    var that = this;
    // 上传geojson文件
    that.utils.parseGeson(that, "file").then((res) => {
      if (res.code === 200) {
        const { data } = res;
        let str = "";
        // 拿到值之后进行组装
        Object.keys(data).forEach((item, index) => {
          str += `floorOutline[${index}].floor=${item}&`;
          const coorArr = data[item].geometry.coordinates;
          const arr = [];
          // 统一与绘制的轮廓返回值格式
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
      that.editOutLine = {};
      Object.keys(lineData).forEach((item, index) => {
        that.editOutLine[item] = JSON.stringify(lineData[item]);
        let floorNum = item;
        if (item.indexOf("F") > -1) {
          floorNum = +item.replace("F", "");
        }
        if (item.indexOf("B") > -1) {
          floorNum = -+item.replace("B", "");
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
      // 判断楼层总数是否为空
      if (
        that.formValidate.overGroundFloor - that.formValidate.underGroundFloor
        < 1
      ) {
        that.$message({
          message: "请先填写楼层",
          type: "warning"
        });
        return;
      }
      // 获取地上楼层、地下楼层
      const { overGroundFloor } = that.formValidate;
      const { underGroundFloor } = that.formValidate;
      // 根据两个数字求出其中间的数字
      function returnMiddle(first, second) {
        const a = first;
        let b = second;
        const att = [];
        // 循环只要a不等于b
        while (a !== b) {
          if (b) {
            // 如果b不等于0，就放入att数组中
            att.push(b);
          }
          // b每次都加1
          b += 1;
        }
        if (a) {
          att.push(a);
        }
        // 进行楼层转化
        att.forEach((item, index) => {
          if (item > 0) {
            att[index] = `F${item}`;
          }
          if (item < 0) {
            att[index] = `B${-item}`;
          }
        });
        return att;
      }
      // 是否全屏
      that.fullScreenModal = true;
      that.$nextTick(() => {
        // 拼装地址
        const address = that.taskObj.provinceName
          + that.taskObj.cityName
          + that.taskObj.districtName;
        if (that.editOutLine) {
          // 初始化绘制轮廓插件
          that.$refs.drawProfile.initData({
            address,
            editOutLine: that.editOutLine,
            fromSet: false,
            floorArr: returnMiddle(overGroundFloor, underGroundFloor)
          });
        } else {
          // 初始化绘制轮廓插件
          that.$refs.drawProfile.initData({
            address,
            fromSet: false
          });
        }
      });
    },

    // 被外部调用时初始化方法
    init(taskObj) {
      var that = this;
      // 循环表单字段，清空
      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
      });
      // 清空表单
      that.$refs.formValidate.resetFields();
      // 赋值任务对象
      that.taskObj = taskObj;
      // 赋值任务id
      that.formValidate.taskId = taskObj.id;
      // 清空编辑时轮廓信息
      that.editOutLine = {};
    },

    // 点击取消事件
    cancelClick() {
      this.$emit("cancel");
    },

    // 提交表单事件
    handleSubmit() {
      var that = this;
      // 校验表单
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          // 拼装参数&
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
              url: that.apis.buildingMgrSave,
              data: str
            })
            .then((res) => {
              const { data } = res;
              if (data.code === 200) {
                that.$message({
                  message: "提交成功",
                  type: "success"
                });
                // 传值
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
