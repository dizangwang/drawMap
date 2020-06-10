const root = "/backend";
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
  // 根据楼宇ID获取整个楼层的轮廓详细信息
  getFloorOutlineByBuildingId: `${root}/floorMgr/outline/`,
  // 加载楼层信息
  loadFloor: `${root}/floorMgr/load/`,
  // 根据楼层id获取详细信息
  getFloorInfoById: `${root}/floorMgr/`,
  // 根据楼层id获取详细信息
  getFloorInfoByBuildingId: `${root}/floorMgr`,
  // 设置楼层完成
  floorFinishById: `${root}/floorMgr/finish/`,
  // 保存楼层信息
  saveFloor: `${root}/floorMgr/save`,
  // 设置楼层信息
  updateFloorSettings: `${root}/floorMgr/updateSettings/`,
  // 图标管理
  getIcons: `${root}/iconMgr/getIcons`,
  // 获取所有元素的样式
  getElementStyles: `${root}/elementStyleMgr/getElementStyles`,
  // 获得所有的标注样式
  getLabelStyles: `${root}/labelStyleMgr/getLabelStyles`,
  // 任务发布接口
  taskMgrPublish: `${root}/taskMgr/publish`,
  // 任务下架接口
  taskMgrUnPublish: `${root}/taskMgr/unpublish`,
  // 楼宇发布接口
  buildingMgrPublish: `${root}/buildingMgr/publish`,
  // 楼宇下架接口
  buildingMgrUnPublish: `${root}/buildingMgr/unpublish`,
  // 任务下载接口
  floorMgrFinishDownload: `${root}/floorMgr/finishDownload`,
  // 单楼层下载准备接口
  floorMgrGetDownloadFlag: `${root}/floorMgr/getDownloadFlag`,
  // 单楼层下载准备接口
  floorMgrPrepareDownload: `${root}/floorMgr/prepareDownload`,
  //设备楼层信息
  floorMgrUpdateSettings: `${root}/floorMgr/updateSettings/`



};
export default apis;
