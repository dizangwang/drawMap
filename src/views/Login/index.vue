<template>
  <div class="about">
    <h1>登录页面</h1>
    <h3>{{userInfo.name}}</h3>
    <Button @click="goMyproject">登录</Button>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Login",
  computed: {
    ...mapGetters(["userInfo"])
  },
  data() {
    return {};
  },
  mounted() {
    window.setTimeout(() => {
      this.setUserInfo({ name: "绘制" });
    }, 2000);
  },
  methods: {
    ...mapActions(["setUserInfo"]),
    goMyproject() {
      var that = this;
      that.$router.push({ path: "/myProject" });
    }
  }
};
</script>
<style scoped>
</style>

