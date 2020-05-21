<template>
  <div class="myProject">
    <Header></Header>
    <Title></Title>
    <div class="handler">
      <Select v-model="projectType" placeholder="选择项目" style="width:200px">
        <Option
          v-for="item in projectTypeList"
          :value="item.value"
          :key="item.value"
        >{{ item.label }}</Option>
      </Select>
      <Button type="primary">创建工程</Button>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Header from "./header.vue";
import Title from "./title.vue";
export default {
  name: "Login",
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: {
    Header,
    Title
  },
  data() {
    return {
      projectType: "",
      projectTypeList: [
        { label: "类型1", value: 1 },
        { label: "类型2", value: 2 }
      ]
    };
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
.handler {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 800px;
  height: 70px;
  margin: 0 auto;
}
</style>
