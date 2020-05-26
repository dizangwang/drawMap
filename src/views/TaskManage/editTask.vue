<template>
  <div class="task olme">
    <el-form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-width="0">
      <table class="wd100">
        <tr>
          <td class="required rightLebal">任务名称：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="name">
              <el-input size="small" v-model="formValidate.name" maxlength="20" show-word-limit/>
            </el-form-item>
          </td>
        </tr>
        <tr>
          <td class="required rightLebal">任务类型：</td>
          <td>

            <el-form-item size="mini" label-width="0" prop="taskType">
              <el-select size="small" v-model="formValidate.taskType" style="width:100%">
                <el-option value>请选择</el-option>
                <el-option value="1" label="学校"></el-option>
                <el-option value="2" label="商场"></el-option>
                <el-option value="3" label="公园"></el-option>
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
                >
                  <el-option value>请选择</el-option>
                  <el-option value="1" label="授江西"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item size="mini" label-width="0" prop="city">
                <el-select
                  size="small"
                  v-model="formValidate.city"
                  placeholder="市"
                  class="areaSelect"
                >
                  <el-option value>请选择</el-option>
                  <el-option value="1" label="授江西"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item size="mini" label-width="0" prop="area">
                <el-select
                  size="small"
                  v-model="formValidate.area"
                  placeholder="区"
                  class="areaSelect"
                >
                  <el-option value>请选择</el-option>
                  <el-option value="1" label="授江西"></el-option>
                </el-select>
              </el-form-item>
            </div>
          </td>
        </tr>
        <tr>
          <td class="rightLebal">任务描述：</td>
          <td >
            <div class="line10"></div>
            <el-input size="small" maxlength="300" type="textarea" show-word-limit v-model="formValidate.description" />
          </td>
        </tr>
      </table>
    </el-form>
    <div class="line20"></div>
    <div class="center">
      <el-button size="mini">取消</el-button>
      <el-button size="mini" type="primary" @click="handleSubmit">确定</el-button>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Header",
  computed: {
    ...mapGetters(["userInfo"])
  },
  data() {
    return {
      formValidate: {
        name: "",
        name2: "",
        name3: "",
        province: "",
        city: "",
        area: ""
      },
      ruleValidate: {
        name: [{ required: true, message: "请填写任务名称", trigger: "blur" }],
        taskType: [
          { required: true, message: "请选择任务类型", trigger: "change" }
        ],
        name3: [
          { required: false, message: "请填写任务描述", trigger: "change" }
        ],
        province: [
          { required: true, message: "请选择省份", trigger: "change" }
        ],
        city: [{ required: true, message: "请选择城市", trigger: "change" }],
        area: [{ required: true, message: "请选择所属区域", trigger: "change" }]
      }
    };
  },
  mounted() {},
  methods: {
    handleSubmit() {
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          this.$Message.success("Success!");
        } else {
          this.$Message.error("Fail!");
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
  width: 120px;
}
</style>
