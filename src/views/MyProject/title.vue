<template>
  <div class="title">我的工程</div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Title",
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
      that.$router.push({ path: "/chartShowControl" });
    }
  }
};
</script>
<style scoped>
.title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  background: #eafef7;
  color: #223f5c;
  height: 40px;
}
</style>
