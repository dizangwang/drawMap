<template>
  <div class="header">
    <el-button class="el-button" type="primary" > 预览</el-button>
    <el-button class="el-button" type="primary" >保存</el-button>
    <el-button class="el-button" type="primary" >发布</el-button>
    <el-button class="el-button" type="primary" >设置楼层信息</el-button>
    <Input suffix="ios-search" class="search" placeholder="Enter text"  />
    <img class="userIcon" src="../../assets/images/common/icon_userCenter2.png" alt />
    <span class="userCenterWord">个人中心</span>
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
      const that = this;
      that.$router.push({ path: `/chartShowControl` });
    }
  }
};
</script>
<style scoped>
.header {
  display: block;
  background: white;
  height: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 1px 1px 5px gray;
  padding-right: 20px;
}

.userIcon {
  width: 40px;
  height: 40px;
}
.userCenterWord {
  font-size: 14px;
  color: black;
  margin-left: 20px;
}
.el-button{
  margin-right:15px;
}
.search{
  width:150px;
  margin-right:30px;
}
</style>
