import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
const routes = [

  // 默认跳转
  {
    path: "/",
    name: "/",
    redirect: "taskManage"
  },

  // 任务管理页
  {
    path: "/taskManage",
    name: "taskManage",
    component: () => import("../views/TaskManage/index.vue")
  },

  // 楼宇管理页
  {
    path: "/buildingManage",
    name: "buildingManage",
    component: () => import("../views/BuildingManage/index.vue")
  },

  // 任务下的楼宇管理页
  {
    path: "/buildingManage/:id",
    name: "buildingManage",
    component: () => import("../views/BuildingManage/index.vue")
  },

  // 绘制页面
  {
    path: "/drawMap/:id",
    name: "drawMap",
    component: () => import("../views/DrawMap/index.vue")
  }

];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes
});

export default router;
