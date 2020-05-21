<template>
  <div class="app">
    <Header></Header>
    <div class="container">
      <div class="leftHandlerCon"></div>
      <div class="rightHandlerCon"></div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Header from "./header.vue";

export default {
  name: "ChartShowControl",
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: {
    Header
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {}
};
</script>
<style scoped>
.container {
  width: 100%;
  display: flex;
}
.leftHandlerCon {
  width: 25%;
  height: 400px;
  background: red;
}
.rightHandlerCon {
  flex: 1;
  height: 400px;
  background: yellow;
}
</style>

