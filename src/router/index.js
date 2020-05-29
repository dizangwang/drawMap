import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
const routes = [

  // 默认跳转
  {
    path: "/",
    name: "/",
    redirect: "drawMap"
  },

  // 登录页
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login")
  },

  // 任务管理页
  {
    path: "/taskManage",
    name: "taskManage",
    component: () => import("../views/TaskManage")
  },

  // 楼宇管理页
  {
    path: "/buildingManage",
    name: "buildingManage",
    component: () => import("../views/BuildingManage")
  },

  // 绘制页面
  {
    path: "/drawMap",
    name: "drawMap",
    component: () => import("../views/DrawMap")
  }

];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
