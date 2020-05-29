import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
const routes = [
  {
    path: "/",
    name: "/",
    redirect: "drawMap"
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login")
  },
  {
    path: "/taskManage",
    name: "taskManage",
    component: () => import("../views/TaskManage")
  },
  {
    path: "/buildingManage",
    name: "buildingManage",
    component: () => import("../views/BuildingManage")
  },
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
