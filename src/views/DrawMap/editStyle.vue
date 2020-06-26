<template>
  <div class="styleHandler">
    <el-form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-width="0">
      <table class="wd100">
        <tr>
          <td class="required rightLebal">样式名称：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="name">
              <el-input size="small" v-model="formValidate.name" maxlength="20" show-word-limit />
            </el-form-item>
          </td>
        </tr>
        <!-- <tr>
          <td class="required rightLebal">边框宽度：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="borderWidth">
              <el-input-number v-model="formValidate.borderWidth" size="small" :min="0" :max="100" />
            </el-form-item>
          </td>
        </tr>
        <tr>
          <td class="required rightLebal">边框颜色：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="borderColor">
              <el-color-picker  show-alpha size="medium " v-model="formValidate.borderColor"></el-color-picker>
            </el-form-item>
          </td>
        </tr> -->

        <tr>
          <td class="required rightLebal">填充颜色：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="fillColor">
              <el-color-picker  show-alpha size="medium " v-model="formValidate.fillColor"></el-color-picker>
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
      // 表单字段对象
      formValidate: {
        id: "",
        name: "",
        borderColor: "",
        borderWidth: 0,
        fillColor: ""
      },
      // 校验规则
      ruleValidate: {
        name: [
          { required: true, message: "请填写样式名称", trigger: "change" }
        ],
        // borderWidth: [
        //   { required: true, message: "请填写边框宽度", trigger: "change" }
        // ],
        // borderColor: [
        //   { required: true, message: "请选择边框颜色", trigger: "change" }
        // ],
        fillColor: [
          { required: true, message: "请选择填充颜色", trigger: "change" }
        ]
      }
    };
  },
  mounted() {},
  methods: {
    // 初始化方法
    init(obj) {
      var that = this;
      that.$refs.formValidate.resetFields();
      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = obj[key];
      });
    },

    // 取消事件
    cancelClick() {
      this.$emit("cancel");
    },

    // 保存事件
    handleSubmit() {
      var that = this;

      // 校验规则
      that.$refs.formValidate.validate((valid) => {
        if (valid) {
          that.formValidate.borderWidth = 1;
          that.formValidate.borderColor = that.formValidate.fillColor;
          that
            .ajax({
              method: "post",
              url: that.apis.elementStyleMgrUpdate + that.formValidate.id,
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
}
.rightLebal {
  width: 90px;
}
</style>
