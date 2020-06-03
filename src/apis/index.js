const root = "/api";
const apis = {
  // 获取所有任务类型
  getAllTypes: `${root}/taskTypeMgr/getAllTypes`,
  // 根据上级区域id查找下级区域
  getAreasWithPid: `${root}/regionMgr/getChildRegions`,
  // 保存任务
  taskSave: `${root}/taskMgr/save`,
  // 任务列表
  taskMgrList: `${root}/taskMgr`,
  // 删除任务信息
  taskMgrDelete: `${root}/taskMgr/delete`,
  // 根据id获取任务详情
  getTaskById: `${root}/taskMgr/`,
  // 根据id更新任务
  updateTaskById: `${root}/taskMgr/`,
  // 获取楼宇列表
  buildingMgrList: `${root}/buildingMgr`,
  // 保存楼宇
  buildingMgrSave: `${root}/buildingMgr/save`,
  // 根据楼宇id更新楼宇信息
  buildingMgrUpdate: `${root}/buildingMgr/`,
  // 根据楼宇id获取楼宇信息
  getBuildingById: `${root}/buildingMgr/`,
  // 根据楼宇id删除楼宇信息
  deleteBuildingById: `${root}/buildingMgr/delete`,
  // 根据楼层ID获得楼层的详细信息
  getFloorById: `${root}/floorMgr/`,
  // 根据楼层ID更新楼层的详细信息
  updateFloorById: `${root}/floorMgr/updateSettings/`,
  // 根据楼宇ID获取整个楼层的详细信息
  getFloorByBuildingId: `${root}/floorMgr/outline/`
};
export default apis;
