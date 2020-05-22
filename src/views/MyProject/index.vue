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
    <div class="center">
      <Button type="primary" @click="mapOutLineClick">地图轮廓</Button>
    </div>

    <div>地图数据 ：{{lineData}}</div>

    <!-- 全屏对话框 -->
    <Modal v-model="fullScreenModal" footer-hide fullscreen title="地图轮廓">
      <DrawProfile ref="drawProfile" @save="lineSave" @quit="lineQuit"></DrawProfile>
    </Modal>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Header from "./header.vue";
import Title from "./title.vue";
import DrawProfile from "../../components/DrawProfile.vue";

export default {
  name: "Login",
  computed: {
    ...mapGetters(["userInfo"])
  },
  components: {
    Header,
    Title,
    DrawProfile
  },
  data() {
    return {
      projectType: "",
      fullScreenModal: false,
      lineData: "",
      projectTypeList: [
        { label: "类型1", value: 1 },
        { label: "类型2", value: 2 }
      ]
    };
  },
  mounted() {},
  methods: {
    // 地图轮廓退出
    lineQuit() {
      var that = this;
      that.fullScreenModal = false;
    },

    // 地图轮廓保存
    lineSave(data) {
      var that = this;
      that.lineData = data;
    },

    // 点击创建轮廓
    mapOutLineClick() {
      var that = this;
      that.fullScreenModal = true;
      that.$refs.drawProfile.initData();
    },
    goChartShowControl() {
      var that = this;
      that.$router.push({ path: "/chartShowControl" });
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
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
