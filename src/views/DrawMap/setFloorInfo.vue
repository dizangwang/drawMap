<template>
  <div class="task olme">
    <input style="height:0px;width:0px" type="file" id="file" />
    <el-form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-width="0">
      <table class="wd100">
        <tr>
          <td class="rightLebal">楼层轮廓：</td>

          <td>
            <el-form-item size="mini" label-width="0">
              <div class="centerStart">
                <el-button @click="uploadFile" size="mini" type="primary">
                  <i class="el-icon-upload"></i>点击上传
                </el-button>

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
            <el-form-item size="mini" label-width="0" prop="planarGraph">
              <div class="centerStart">
                <el-upload
                  class="upload-demo"
                  :action="uploadUrl"
                  :on-success="uploadSuccess"
                  :on-error="uploadError"
                  :before-upload="beforeAvatarUpload"
                  :show-file-list="false"
                >
                  <el-button v-if="!formValidate.planarGraph" size="mini" type="primary">
                    <i class="el-icon-upload"></i>点击上传
                  </el-button>

                  <img
                    v-if="formValidate.planarGraph"
                    width="100px"
                    height="auto"
                    style="min-height:30px;display:block"
                    :src="'/files/img/'+formValidate.planarGraph"
                    alt
                  />
                </el-upload>
                <el-popover placement="top-start" trigger="click" content="底图支持最大像素为5700*5700">
                  <i slot="reference" class="el-icon-question" style="margin-left:15px"></i>
                </el-popover>
              </div>
            </el-form-item>
          </td>
        </tr>

        <tr>
          <td class="rightLebal">左上角经纬度：</td>
          <td>
            <div class="centerStart">
              <el-form-item size="mini" label-width="0" prop="upperLeftCornerLongitude">
                <el-input
                  class="inputWidth"
                  size="small"
                  placeholder="左上角经度"
                  v-model="formValidate.upperLeftCornerLongitude"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item class="lf20" size="mini" label-width="0" prop="upperLeftCornerLatitude">
                <el-input
                  size="small"
                  placeholder="左上角纬度"
                  class="inputWidth"
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
              <el-form-item size="mini" label-width="0" prop="lowerRightCornerLongitude">
                <el-input
                  class="inputWidth"
                  size="small"
                  placeholder="右下角经度"
                  v-model="formValidate.lowerRightCornerLongitude"
                  show-word-limit
                />
              </el-form-item>&nbsp;&nbsp;&nbsp;&nbsp;
              <el-form-item
                class="lf20"
                size="mini"
                label-width="0"
                prop="lowerRightCornerLatitude"
              >
                <el-input
                  size="small"
                  class="inputWidth"
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
      style="min-width:1000px"
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
  name: "SetFloorInfo",
  components: {
    DrawProfile
  },
  data() {
    // 校验轮廓数据
    var validateUnderPicId = (rule, value, callback) => {
      var that = this;
      if (!that.formValidate.planarGraph) {
        callback(new Error("请上传平面图"));
      }
      callback();
    };
    // 校验对角线
    var validateLngLat1 = (rule, value, callback) => {
      var that = this;
      if (
        that.formValidate.upperLeftCornerLongitude
        || that.formValidate.upperLeftCornerLatitude
        || that.formValidate.lowerRightCornerLongitude
        || that.formValidate.lowerRightCornerLatitude
      ) {
        if (!that.formValidate.upperLeftCornerLongitude) {
          callback(new Error("请补全对角线经纬度"));
        }
      }
      callback();
    };
    // 校验对角线
    var validateLngLat2 = (rule, value, callback) => {
      var that = this;
      if (
        that.formValidate.upperLeftCornerLongitude
        || that.formValidate.upperLeftCornerLatitude
        || that.formValidate.lowerRightCornerLongitude
        || that.formValidate.lowerRightCornerLatitude
      ) {
        if (!that.formValidate.upperLeftCornerLatitude) {
          callback(new Error("请补全对角线经纬度"));
        }
      }
      callback();
    };
    // 校验对角线
    var validateLngLat3 = (rule, value, callback) => {
      var that = this;
      if (
        that.formValidate.upperLeftCornerLongitude
        || that.formValidate.upperLeftCornerLatitude
        || that.formValidate.lowerRightCornerLongitude
        || that.formValidate.lowerRightCornerLatitude
      ) {
        if (!that.formValidate.lowerRightCornerLongitude) {
          callback(new Error("请补全对角线经纬度"));
        }
      }
      callback();
    };
    // 校验对角线
    var validateLngLat4 = (rule, value, callback) => {
      var that = this;
      if (
        that.formValidate.upperLeftCornerLongitude
        || that.formValidate.upperLeftCornerLatitude
        || that.formValidate.lowerRightCornerLongitude
        || that.formValidate.lowerRightCornerLatitude
      ) {
        if (!that.formValidate.lowerRightCornerLatitude) {
          callback(new Error("请补全对角线经纬度"));
        }
      }
      callback();
    };
    return {
      // 楼层
      floorNum: "",
      // 用于回显画轮廓
      drawLineObj: "",
      // 楼宇所在的位置
      location: "",
      // 上传的url
      uploadUrl: "",
      // 表单字段
      formValidate: {
        // 轮廓信息
        lineData: "",
        // 楼宇id
        id: "",
        // 图片id
        planarGraph: "",
        // 左上角经度
        upperLeftCornerLongitude: "",
        // 左上角纬度
        upperLeftCornerLatitude: "",
        // 右下角经度
        lowerRightCornerLongitude: "",
        // 右下角纬度
        lowerRightCornerLatitude: ""
      },
      // 上级传过来的任务对象
      taskObj: {},
      // 全屏展示
      fullScreenModal: false,
      // 校验规则
      ruleValidate: {
        planarGraph: [
          {
            validator: validateUnderPicId,
            message: "请上传平面图",
            trigger: "change"
          }
        ],
        upperLeftCornerLongitude: [
          {
            validator: validateLngLat1,
            message: "请补全左上角经度",
            trigger: "change"
          }
        ],
        upperLeftCornerLatitude: [
          {
            validator: validateLngLat2,
            message: "请补全左上角纬度",
            trigger: "change"
          }
        ],
        lowerRightCornerLongitude: [
          {
            validator: validateLngLat3,
            message: "请补全右下角经度",
            trigger: "change"
          }
        ],
        lowerRightCornerLatitude: [
          {
            validator: validateLngLat4,
            message: "请补全右下角纬度",
            trigger: "change"
          }
        ]
      }
    };
  },
  mounted() {
    var that = this;
    that.uploadUrl = that.uploadApis.uploadFiles;
    // 上传geojson文件
    that.utils.parseGeson(that, "file").then((res) => {
      if (res.code === 200) {
        const { data } = res;
        // 组装数据
        let str = "";
        Object.keys(data).forEach((item, index) => {
          str += `floorOutline[${index}].floor=${item}&`;
          const coorArr = data[item].geometry.coordinates;
          const arr = [];
          coorArr.forEach((it) => {
            arr.push({ lng: it[0], lat: it[1] });
          });
          str += `floorOutline=${JSON.stringify(arr)}&`;
        });
        // 赋值
        that.formValidate.lineData = str;
      }
    });
  },
  methods: {
    // 上传文件之前
    beforeAvatarUpload(file) {
      var that = this;
      const { type } = file;
      // 检查文件格式
      if (!/image/.test(type)) {
        that.$message({
          type: "warning",
          message: "请上传图片文件"
        });
        return false;
      }
      // 检查文件分辨率
      const isSize = new Promise((resolve, reject) => {
        const url = window.URL || window.webkitURL;
        const img = new Image();
        img.onload = () => {
          const ji = img.width * img.height;
          if (ji > 32490000) {
            reject();
          } else {
            resolve();
          }
        };
        img.src = url.createObjectURL(file);
      }).then(
        () => file,
        () => {
          that.$message({
            type: "warning",
            message: "请上传像素在5700*5700以内的底图"
          });
          return Promise.reject();
        }
      );
      return isSize;
    },
    // 点击上传文件
    uploadFile() {
      document.querySelector("#file").click();
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
            // 拼装地点
            that.location = data.data.provinceName
              + data.data.cityName
              + data.data.districtName;
          }
        });
    },
    // 清除轮廓信息
    clearOutLineData() {
      var that = this;
      // 如果轮廓数据是空的停止程序
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
          // 清空轮廓数据
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
      that.drawLineObj = {};
      Object.keys(lineData).forEach((item, index) => {
        that.drawLineObj[item] = JSON.stringify(lineData[item]);
        let floorNum = "";
        // 对数值进行转化
        if (item.indexOf("F") > -1) {
          floorNum = +item.replace("F", "");
        }
        if (item.indexOf("B") > -1) {
          floorNum = -+item.replace("B", "");
        }
        str += `floorOutline=${JSON.stringify(lineData[item])}&`;
      });
      // 赋值
      that.formValidate.lineData = str;
    },

    // 点击创建轮廓
    mapOutLineClick() {
      var that = this;
      that.fullScreenModal = true;
      // 赋值位置
      const address = that.location;
      const floorArr = [];
      // 对数值进行转化
      if (that.floorNum > 0) {
        floorArr.push(`F${that.floorNum}`);
      }
      if (that.floorNum < 0) {
        floorArr.push(`B${-that.floorNum}`);
      }
      if (that.drawLineObj) {
        // 调用绘制轮廓插件
        that.$refs.drawProfile.initData({
          address,
          editOutLine: that.drawLineObj,
          fromSet: true,
          floorArr
        });
      } else {
        // 调用绘制轮廓插件
        that.$refs.drawProfile.initData({
          address,
          fromSet: true,
          floorArr
        });
      }
    },

    // 被外部调用时初始化方法
    init(obj) {
      var that = this;
      // 清空表单数据
      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
      });
      that.drawLineObj = "";
      // 清空表单
      that.$refs.formValidate.resetFields();
      that.formValidate.id = obj.id;
      // 获取楼层信息
      that.getFloorInfoById(obj.id).then((res) => {
        // 获取任务信息
        that.getTaskById(res.taskId);
        that.floorNum = res.floorNum;
        that.formValidate.lineData = res.floorOutline;
        that.drawLineObj = "";
        if (res.floorOutline) {
          const newObj = {};
          if (res.floorNum > 0) {
            newObj[`F${res.floorNum}`] = res.floorOutline;
          } else {
            newObj[`B${-res.floorNum}`] = res.floorOutline;
          }
          that.drawLineObj = newObj;
        }
        that.formValidate.planarGraph = res.planarGraph;
        that.formValidate.upperLeftCornerLongitude = res.upperLeftCornerLongitude === null
          ? ""
          : res.upperLeftCornerLongitude;
        that.formValidate.upperLeftCornerLatitude = res.upperLeftCornerLatitude === null
          ? ""
          : res.upperLeftCornerLatitude;
        that.formValidate.lowerRightCornerLongitude = res.lowerRightCornerLongitude === null
          ? ""
          : res.lowerRightCornerLongitude;
        that.formValidate.lowerRightCornerLatitude = res.lowerRightCornerLatitude === null
          ? ""
          : res.lowerRightCornerLatitude;
      });
    },

    // 根据楼层id获取楼层信息
    getFloorInfoById(id) {
      var that = this;
      return new Promise((resolve) => {
        that
          .ajax({
            method: "get",
            url: that.apis.getFloorInfoById + id,
            data: ""
          })
          .then((res) => {
            const { data } = res;
            if (data.code === 200) {
              resolve(data.data);
            } else {
              that.$message({
                message: data.msg,
                type: "warning"
              });
            }
          });
      });
    },

    // 上传文件成功回调
    uploadSuccess(data) {
      var that = this;
      if (data.code === 200) {
        that.formValidate.planarGraph = data.data.id;
        this.$message({
          message: "文件上传成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "文件上传失败",
          type: "warning"
        });
      }
    },

    // 上传失败
    uploadError() {
      this.$message({
        message: "文件上传失败",
        type: "warning"
      });
    },

    // 点击取消事件
    cancelClick() {
      // 向父组件传值
      this.$emit("cancel");
    },

    // 提交表单事件
    handleSubmit() {
      var that = this;
      // 校验表单
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          // 拼装请求参数
          const obj = {
            planarGraph: "",
            upperLeftCornerLongitude: "",
            upperLeftCornerLatitude: "",
            lowerRightCornerLongitude: "",
            lowerRightCornerLatitude: ""
          };
          let str = "";
          Object.keys(obj).forEach((item) => {
            if (that.formValidate[item]) {
              str += `${item}=${that.formValidate[item]}&`;
            }
          });
          str += that.formValidate.lineData;
          that
            .ajax({
              method: "post",
              url: that.apis.floorMgrUpdateSettings + that.formValidate.id,
              data: str
            })
            .then((res) => {
              const { data } = res;
              if (data.code === 200) {
                that.$message({
                  message: "提交成功",
                  type: "success"
                });
                // 把数据传给父组件
                that.$emit("success", that.formValidate.id);
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
img {
  background: url("../../assets/images/common/loading.gif") no-repeat center;
}
</style>
