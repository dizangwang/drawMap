<template>
  <div class="task">
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
        <tr>
          <td class="rightLebal">类型ID：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="typeId">
              <el-select size="small" v-model="formValidate.typeId" style="width:100%">
                <el-option value="1">样式类型1</el-option>
                <el-option value="2">样式类型2</el-option>
              </el-select>
            </el-form-item>
          </td>
        </tr>
        <tr>
          <td class="required rightLebal">填充颜色：</td>
          <td>
            <el-form-item size="mini" label-width="0" prop="color">
              <el-color-picker size="medium " v-model="formValidate.color"></el-color-picker>
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
        taskName: "",
        typeId: "",
        color: ""
      },
      // 校验规则
      ruleValidate: {
        name: [
          { required: true, message: "请填写样式名称", trigger: "change" }
        ],
        typeId: [{ required: true, message: "请选择类型", trigger: "change" }],
        color: [{ required: true, message: "请选择颜色", trigger: "change" }]
      }
    };
  },
  mounted() {},
  methods: {
    // 初始化方法
    init() {
      var that = this;
      that.$refs.formValidate.resetFields();
      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
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
}
.rightLebal {
  width: 90px;
}
</style>
