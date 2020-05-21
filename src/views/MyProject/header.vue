<template>
  <div class="header">
    <div class="mainCenter">
      <img class="userIcon" src="../../assets/images/common/icon_userCenter.png" alt />
      <span class="userCenterWord">个人中心</span>
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
    return {};
  },
  mounted() {},
  methods: {
    goChartShowControl() {
      var that = this;
      that.$router.push({ path: `/chartShowControl` });
    }
  }
};
</script>
<style scoped>
.header {
  display: block;
  height: 60px;
  background: #223f5c;
}
.mainCenter {
  width: 800px;
  height: 60px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
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
</style>
