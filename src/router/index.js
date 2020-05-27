import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
const routes = [
  {
    path: "/",
    name: "/",
    redirect: "lun"
  },
  {
    path: "/lun",
    name: "lun",
    component: () => import("../components/DrawProfile.vue")
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login")
  },
  {
    path: "/myProject",
    name: "myProject",
    component: () => import("../views/MyProject")
  },
  {
    path: "/chartShowControl",
    name: "chartShowControl",
    component: () => import("../views/ChartShowControl")
  },
  {
    path: "/taskManage",
    name: "taskManage",
    component: () => import("../views/TaskManage")
  },
  {
    path: "/BuildingManage",
    name: "BuildingManage",
    component: () => import("../views/BuildingManage")
  }

];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
