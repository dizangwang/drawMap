<template>
  <div class="task">
    <el-form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-width="0">
      <table class="wd100">
        <tr>
          <td class="required rightLebal">任务名称：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="taskName">
              <el-input
                size="small"
                v-model="formValidate.taskName"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>
          </td>
        </tr>
        <tr>
          <td class="rightLebal">任务类型：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="taskTypeId">
              <el-select
                clearable
                size="small"
                v-model="formValidate.taskTypeId"
                style="width:100%"
              >
                <el-option
                  v-for="item in taskTypes"
                  :value="item.id"
                  :label="item.typeName"
                  :key="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </td>
        </tr>
        <tr>
          <td class="required rightLebal">所属区域：</td>
          <td>
            <div class="area">
              <div class="areaSelect">
                <el-form-item size="mini" label-width="0" prop="provinceId">
                  <el-select
                    size="small"
                    clearable
                    v-model="formValidate.provinceId"
                    placeholder="省"
                    @clear="provinceChange"
                    @change="provinceChange"
                  >
                    <el-option
                      v-for="item in provinceList"
                      :value="item.id"
                      :label="item.name"
                      :key="item.id"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="areaSelect">
                <el-form-item size="mini" label-width="0" prop="cityId">
                  <el-select
                    size="small"
                    clearable
                    v-model="formValidate.cityId"
                    placeholder="市"
                    @clear="cityChange"
                    @change="cityChange"
                  >
                    <el-option
                      v-for="item in cityList"
                      :value="item.id"
                      :label="item.name"
                      :key="item.id"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="areaSelect">
                <el-form-item size="mini" label-width="0" prop="districtId">
                  <el-select
                    clearable
                    size="small"
                    v-model="formValidate.districtId"
                    placeholder="区"
                  >
                    <el-option
                      v-for="item in districtList"
                      :value="item.id"
                      :label="item.name"
                      :key="item.id"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="rightLebal">任务描述：</td>
          <td>
            <div class="line10"></div>
            <el-input
              size="small"
              maxlength="300"
              type="textarea"
              show-word-limit
              v-model="formValidate.comment"
            />
          </td>
        </tr>
      </table>
    </el-form>
    <div class="line20"></div>
    <div class="center">
      <el-button size="mini" @click="cancelClick">取消</el-button>
      <el-button size="mini" type="primary" @click="handleSubmit">确定</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "CreateTask",
  data() {
    return {
      // 表单字段对象
      formValidate: {
        // 任务名称
        taskName: "",
        // 省份id
        provinceId: "",
        // 城市id
        cityId: "",
        // 区县id
        districtId: "",
        // 备注
        comment: "",
        // 类型id
        taskTypeId: ""
      },

      // 省份列表
      provinceList: [],

      // 城市列表
      cityList: [],

      // 区域列表
      districtList: [],

      // 任务类型列表
      taskTypes: [],

      // 校验规则
      ruleValidate: {
        taskName: [
          { required: true, message: "请填写任务名称", trigger: "blur" }
        ],
        provinceId: [
          { required: true, message: "请选择省份", trigger: "change" }
        ],
        cityId: [{ required: true, message: "请选择城市", trigger: "change" }],
        districtId: [
          { required: true, message: "请选择所属区域", trigger: "change" }
        ]
      }
    };
  },
  methods: {
    // 初始化方法
    init() {
      var that = this;
      // 清空表单
      that.$refs.formValidate.resetFields();
      // 循环表单中的字段清空
      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
      });
      // 获取所有任务类型
      that.getAllTypes();
      // 获取省份
      that.getAreasWithPid("", (data) => {
        that.provinceList = data;
      });
    },

    // 取消事件
    cancelClick() {
      this.$emit("cancel");
    },
    // 获取任务类型
    getAllTypes() {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getAllTypes,
          data: {}
        })
        .then((res) => {
          const { data } = res;
          if (data.code === 200) {
            that.taskTypes = data.data;
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },

    // 监听城市变动
    cityChange(id) {
      var that = this;
      if (id) {
        // 获取区县列表
        that.getAreasWithPid(id, (data) => {
          that.districtList = data;
        });
        // 清空区县
        that.formValidate.districtId = "";
      } else {
        // 清空区县
        that.formValidate.districtId = "";
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
        // 清空城市
        that.formValidate.cityId = "";
        // 清空区县
        that.formValidate.districtId = "";
      } else {
        // 清空城市
        that.formValidate.cityId = "";
        // 清空区县
        that.formValidate.districtId = "";
      }
    },

    // 根据上级id获取下级列表
    getAreasWithPid(pid, fn) {
      var that = this;
      that
        .ajax({
          method: "get",
          url: that.apis.getAreasWithPid,
          data: { pid }
        })
        .then((res) => {
          const { data } = res;
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

    // 保存事件
    handleSubmit() {
      var that = this;

      // 校验规则
      that.$refs.formValidate.validate((valid) => {
        // 校验成功后
        if (valid) {
          that
            .ajax({
              method: "post",
              url: that.apis.taskSave,
              data: that.formValidate
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
.areaSelect {
  width: 30%;
  margin-left: 0px;
}
.rightLebal {
  width: 90px;
}
</style>
