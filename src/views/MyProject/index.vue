<template>
  <div class="about">
    <h1>我的工程页面</h1>
    <Button @click="goChartShowControl">跳转到矢量图显示控制平台</Button>
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
    return {
    
    };
  },
  mounted() {
  
  },
  methods: {
    goChartShowControl(){
      var that=this;
      that.$router.push({ path: `/chartShowControl` });
    }
    
  }
};
</script>
<style scoped>

</style>
