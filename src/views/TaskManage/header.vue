<template>
  <div class="header">
    <span>
      <el-select class="select" v-model="type">
        <el-option value="1">任务</el-option>
        <el-option value="1">楼宇</el-option>
      </el-select>
    </span>
    <div class="headerRight">
      <img class="userIcon" src="../../assets/images/common/icon_userCenter.png" alt />
      <span class="userCenterWord">个人中心</span>
      <Icon type="ios-log-out" class="logout" style="color:white;font-size:25px;" />
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
      type: "1"
    };
  },
  mounted() {},
  methods: {
    goChartShowControl() {
      var that = this;
      that.$router.push({ path: "/chartShowControl" });
    }
  }
};
</script>
<style scoped>
.header {
  display: block;
  height: 60px;
  background: #223f5c;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.userIcon {
  width: 40px;
  height: 40px;
}
.userCenterWord {
  font-size: 14px;
  color: white;
  margin-left: 20px;
}
.logout {
  color: white;
  font-size: 25px;
  margin-left: 20px;
  margin-right: 20px;
}
.select {
  width: 100px;
  margin-left: 20px;
  background: #223f5c;
}
.headerRight {
  display: flex;
  align-items: center;
}
</style>
