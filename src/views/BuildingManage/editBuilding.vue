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
// 引入轮廓绘制插件
import DrawProfile from "../../components/DrawProfile.vue";

export default {
  name: "EditBuilding",
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
        // 楼宇id
        id: "",
        // 任务id
        taskId: "",
        // 楼宇名称
        buildingName: "",
        // 地上楼层
        overGroundFloor: "",
        // 地下楼层
        underGroundFloor: "",
        // 轮廓信息
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
      // 如果没有轮廓信息
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
          // 点击了  确定
          that.$message({
            type: "success",
            message: "轮廓数据已清空!"
          });
          that.formValidate.lineData = "";
        })
        .catch(() => {
          // 点击了 取消
          that.$message({
            type: "info",
            message: "已取消清空"
          });
        });
    },

    // 地图轮廓退出
    lineQuit() {
      var that = this;
      // 设置fullScreenModal为false
      that.fullScreenModal = false;
    },

    // 地图轮廓保存
    lineSave(lineData) {
      var that = this;
      var str = "";
      // 设置编辑楼层为空对象
      that.editOutLine = {};
      Object.keys(lineData).forEach((item, index) => {
        that.editOutLine[item] = JSON.stringify(lineData[item]);
        let floorNum = "";
        // 楼层转换
        if (item.indexOf("F") > -1) {
          floorNum = +item.replace("F", "");
        }
        if (item.indexOf("B") > -1) {
          floorNum = -+item.replace("B", "");
        }
        // 拼装参数
        str += `floorOutline[${index}].floor=${floorNum}&`;
        str += `floorOutline[${index}].outline=${JSON.stringify(
          lineData[item]
        )}&`;
      });
      // 赋值
      that.formValidate.lineData = str;
    },

    // 点击创建轮廓
    mapOutLineClick() {
      var that = this;
      // 判断地上楼层与地下楼层之和是否为0
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
        if (that.editOutLine) {
          // 初始化绘制轮廓插件
          that.$refs.drawProfile.initData({
            address:
              that.taskData.provinceName
              + that.taskData.cityName
              + that.taskData.districtName,
            editOutLine: that.editOutLine,
            fromSet: false,
            floorArr: returnMiddle(overGroundFloor, underGroundFloor)
          });
        } else {
          // 初始化绘制轮廓插件
          that.$refs.drawProfile.initData({
            address:
              that.taskData.provinceName
              + that.taskData.cityName
              + that.taskData.districtName,
            fromSet: false
          });
        }
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
      // 循环表单字段，清空
      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
      });
      // 赋值详情
      that.detailFromPre = row;
      // 清空表单
      that.$refs.formValidate.resetFields();
      // 根据楼宇id获取详情
      that.getBuildingById(row.id);
      // 根据任务id获取任务对象
      that.getTaskById(row.taskId);
      // 根据楼宇id获取轮廓信息
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
            // 对表单信息进行赋值
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

    // 点击取消事件
    cancelClick() {
      // 给父组件传值
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
