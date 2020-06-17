var TestData = {
    id: "建筑物ID",
    name: "建筑物名称",
    floorsCounts: 3, ///楼层总数
    floors: {
      
        1:{
            floorData: {}, 
            imageData: {data:"",extent:[]},
            layerData: {point: {},path: {},polygon: {},}
        },
       
    } ///楼层数据
};


var styleManageData = {
    ///面状要素样式 以及 线状要素样式
    styles: [{
        id: "s1",
        name: "样式1",
        width: 5, ///边线线宽
        fillColor: 'rgba(255,255,255,1)', ///填充颜色
        borderColor: 'rgba(0,0,0,1)', ///边线颜色

    }, {}],
    ///显示文字标注样式
    labelStyles: [{
        id: "ls1",
        name: "标注样式1",
        fontSize: 12, ///字号大小
        fillColor: 'rgba(255,255,255,1)', ///填充颜色
        borderColor: 'rgba(0,0,0,1)', ///边线颜色
    }, {}],
    ///图标样式
    icon: [{
        id: "i1",
        name: "图标1",
        img: "../img/poi.png",
        size: 12
    }, {}],
}


export default TestData;