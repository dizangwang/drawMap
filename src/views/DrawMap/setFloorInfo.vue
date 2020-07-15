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
                  :show-file-list="false"
                >
                  <el-button v-if="!formValidate.planarGraph" size="mini" type="primary">
                    <i class="el-icon-upload"></i>点击上传
                  </el-button>
                  <img
                    v-if="formValidate.planarGraph"
                    width="100px"
                    height="auto"
                    style="min-height:30px"
                    :src="'/files/img/'+formValidate.planarGraph"
                    alt
                  />
                </el-upload>
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
    var validateUnderPicId = (rule, value, callback) => {
      var that = this;
      if (!that.formValidate.planarGraph) {
        callback(new Error("请上传平面图"));
      }
      callback();
    };
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
      // 用于回显画轮廓
      drawLineObj: "",
      // 楼宇所在的位置
      location: "",
      // 上传的url
      uploadUrl: "",
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
        that.formValidate.lineData = str;
      }
    });
  },
  methods: {
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
            that.location = data.data.provinceName
              + data.data.cityName
              + data.data.districtName;
          }
        });
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
      //  console.log(lineData)
      that.drawLineObj = {};
      Object.keys(lineData).forEach((item, index) => {
        that.drawLineObj[item] = JSON.stringify(lineData[item]);
        let floorNum = "";
        if (item.indexOf("F") > -1) {
          floorNum = +item.replace("F", "");
        }
        if (item.indexOf("B") > -1) {
          floorNum = -+item.replace("B", "");
        }
        if (item.indexOf("M") > -1) {
          floorNum = -+item.replace("M", "");
        }

        //   const lngArr = [];
        //   const latArr = [];
        //   lineData[item].forEach((item) => {
        //     lngArr.push(+item.lng);
        //     latArr.push(+item.lat);
        //   });

        //   // 获取最大经纬度   最小经纬度
        //   const bigLng = Math.max(...lngArr);
        //   const bigLat = Math.max(...latArr);
        //   const smallLng = Math.min(...lngArr);
        //   const smallLat = Math.min(...latArr);
        //   console.log(bigLng,bigLat,smallLng,smallLat)

        // that.formValidate.upperLeftCornerLongitude=smallLng;
        // that.formValidate.upperLeftCornerLatitude=bigLat;
        // that.formValidate.lowerRightCornerLongitude=bigLng;
        // that.formValidate.lowerRightCornerLatitude=smallLat;

        str += `floorOutline=${JSON.stringify(lineData[item])}&`;
      });
      that.formValidate.lineData = str;
    },

    // 点击创建轮廓
    mapOutLineClick() {
      var that = this;
      that.fullScreenModal = true;
      const address = that.location;
      if (that.drawLineObj) {
        that.$refs.drawProfile.initData({
          address,
          editOutLine: that.drawLineObj,
          fromSet: true
        });
      } else {
        that.$refs.drawProfile.initData({
          address,
          fromSet: true
        });
      }
    },

    // 被外部调用时初始化方法
    init(obj) {
      var that = this;

      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
      });
      that.drawLineObj = "";
      that.$refs.formValidate.resetFields();
      that.formValidate.id = obj.id;
      that.getFloorInfoById(obj.id).then((res) => {
        that.getTaskById(res.taskId);
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
        // console.log(" res.planarGraph", res.planarGraph);
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
    uploadError() {
      this.$message({
        message: "文件上传失败",
        type: "warning"
      });
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
          // console.log("999",str)
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
</style>
