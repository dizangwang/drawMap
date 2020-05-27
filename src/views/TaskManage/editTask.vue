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
              <el-form-item size="mini" label-width="0" prop="provinceId">
                <el-select
                  size="small"
                  v-model="formValidate.provinceId"
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
              <el-form-item size="mini" label-width="0" prop="cityId">
                <el-select
                  size="small"
                  v-model="formValidate.cityId"
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
              <el-form-item size="mini" label-width="0" prop="districtId">
                <el-select
                  size="small"
                  v-model="formValidate.districtId"
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
        provinceId: "",
        cityId: "",
        districtId: "",
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
        provinceId: [
          { required: true, message: "请选择省份", trigger: "change" }
        ],
        cityId: [{ required: true, message: "请选择城市", trigger: "change" }],
        districtId: [
          { required: true, message: "请选择所属区域", trigger: "change" }
        ]
      },
      id: "",
      detailData: {}
    };
  },
  mounted() {},
  methods: {
    init(id) {
      var that = this;
      that.id = id;
      that.$refs.formValidate.resetFields();
      Object.keys(that.formValidate).forEach((key) => {
        that.formValidate[key] = "";
      });
      that.getAreasWithPid("", (data) => {
        that.provinceList = data;
        that.$nextTick(() => {
          that.getTaskById(id);
        });
      });
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
            const detailData = data.data;
            that.detailData = detailData;
            that.formValidate.taskName = detailData.taskName;
            that.formValidate.comment = detailData.comment;
            that.formValidate.taskTypeId = detailData.taskTypeId;
            that.formValidate.provinceId = detailData.provinceId;

            // 渲染省市区三级联动
            // 根据省ID获取城市列表
            that.getAreasWithPid(detailData.provinceId, (citys) => {
              that.cityList = citys;
              that.$nextTick(() => {
                // 给城市下拉框赋值
                that.formValidate.cityId = detailData.cityId;

                // 根据城市ID获取区域列表
                that.getAreasWithPid(detailData.cityId, (districts) => {
                  that.districtList = districts;
                  that.$nextTick(() => {
                    // 给区域下拉框赋值
                    that.formValidate.districtId = detailData.districtId;
                  });
                });
              });
            });
          } else {
            that.$message({
              message: data.msg,
              type: "warning"
            });
          }
        });
    },
    cancelClick() {
      this.$emit("cancel");
    },

    // 监听城市变动
    cityChange(id) {
      var that = this;
      if (id) {
        that.getAreasWithPid(id, (data) => {
          that.districtList = data;
        });
        that.formValidate.district = "";
      }
    },

    // 监听省份变动
    provinceChange(id) {
      var that = this;
      if (id) {
        that.formValidate.city = "";
        that.formValidate.district = "";
        that.getAreasWithPid(id, (data) => {
          that.cityList = data;
          that.city = that.detailData.cityId;
        });
      }
    },

    // 根据上级区域id获取下级区域列表
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

    // 提交
    handleSubmit() {
      var that = this;
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          that
            .ajax({
              method: "post",
              url: that.apis.updateTaskById + that.id,
              data: that.formValidate
            })
            .then((res) => {
              const { data } = res;
              if (data.code === 200) {
                that.$message({
                  message: "更新成功",
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
  width: 180px;
}
</style>
