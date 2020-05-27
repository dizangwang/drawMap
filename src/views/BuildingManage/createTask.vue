<template>
  <div class="task olme">
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
              <el-select size="small" v-model="formValidate.taskTypeId" style="width:100%">
                <el-option value>任务类型</el-option>
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
              <el-form-item size="mini" label-width="0" prop="province">
                <el-select
                  size="small"
                  v-model="formValidate.province"
                  placeholder="省"
                  class="areaSelect"
                  @change="provinceChange"
                >
                  <el-option
                    v-for="item in provinceList"
                    :value="item.id"
                    :label="item.fullName"
                    :key="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item size="mini" label-width="0" prop="city">
                <el-select
                  size="small"
                  v-model="formValidate.city"
                  placeholder="市"
                  class="areaSelect"
                  @change="cityChange"
                >
                  <el-option
                    v-for="item in cityList"
                    :value="item.id"
                    :label="item.shortName"
                    :key="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item size="mini" label-width="0" prop="district">
                <el-select
                  size="small"
                  v-model="formValidate.district"
                  placeholder="区"
                  class="areaSelect"
                >
                  <el-option
                    v-for="item in districtList"
                    :value="item.id"
                    :label="item.shortName"
                    :key="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
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
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Header",
  computed: {
    ...mapGetters(["userInfo", "taskTypes"])
  },

  data() {
    return {
      formValidate: {
        taskName: "",
        province: "",
        city: "",
        district: "",
        // 任务描述
        comment: "",
        taskTypeId: ""
      },
      provinceList: [],
      cityList: [],
      districtList: [],
      taskTypeList: [],
      ruleValidate: {
        taskName: [
          { required: true, message: "请填写任务名称", trigger: "blur" }
        ],
        province: [
          { required: true, message: "请选择省份", trigger: "change" }
        ],
        city: [{ required: true, message: "请选择城市", trigger: "change" }],
        district: [
          { required: true, message: "请选择所属区域", trigger: "change" }
        ]
      }
    };
  },
  mounted() {},
  methods: {
    init() {
      var that = this;
      that.$refs.formValidate.resetFields();
      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
      });

      that.getAreasWithPid("", (data) => {
        that.provinceList = data;
      });
    },
    cancelClick() {
      this.$emit("cancel");
    },
    cityChange(id) {
      var that = this;
      if (id) {
        that.getAreasWithPid(id, (data) => {
          that.districtList = data;
        });
        that.formValidate.district = "";
      }
    },
    provinceChange(id) {
      var that = this;
      if (id) {
        that.getAreasWithPid(id, (data) => {
          that.cityList = data;
        });
        that.formValidate.city = "";
        that.formValidate.district = "";
      }
    },
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

    handleSubmit() {
      var that = this;
      this.$refs.formValidate.validate((valid) => {
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
    },
    createTaskClick() {
      var that = this;
      that.createTaskModal = true;
      that.$refs.formValidate.resetFields();
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
  width: 180px;
}
</style>
