var TestData = {
    id: "建筑物ID",
    name: "建筑物名称",
    floorsCounts: 3, ///楼层总数
    floors: {
        1: {
            floorData: {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [13222863.074897416, 3768825.0433383826],
                            [13222863.074897416, 3768562.394749727],
                            [13223197.033369796, 3768562.394749727],
                            [13223197.033369796, 3768825.0433383826],
                            [13222863.074897416, 3768825.0433383826]
                        ]
                    ]
                },
                "properties": {
                    id: "要素ID （1_floor 或者UUID）",
                    name: "A大楼",
                    floors: 1, ///楼层
                    styleID: "样式ID 或者 空 给前端绑定样式管理器用",
                    width: 2, ///边线线宽
                    fillColor: 'rgba(247,254,255,0.6)', ///填充颜色
                    borderColor: 'rgba(217,237,253,1.0)', ///边线颜色
                    ///有需要补充的数据讨论好KEY 往下添加
                }
            }, ///geoJSeon
            imageData: {
                data: "https://www.fengmap.com/img/editor/guide-operation/menu1.png",
                extent: [13222863.074897416, 3768562.394749727, 13223197.033369796, 3768825.0433383826]
            },
            layerData: {
                point: {
                    "type": "FeatureCollection",
                    "features": [{
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [13223000, 3768700]
                            },
                            "properties": {
                                id: "要素ID （1_point 或者UUID）",
                                typeID: "typeid",
                                name: "poi1",
                                height: 2,
                                styleID: "样式ID 或者 空 给前端绑定样式管理器用",
                                img: "../img/poi.png",
                                size: 32,
                            }
                        }

                    ]
                }, ///点要素表转换成geoJson
                path: {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": [
                                [13223000, 3768700],
                                [13223050, 3768700],
                                [13223050, 3768750],
                                [13223000, 3768750],
                                [13223000, 3768700]
                            ]
                        },
                        "properties": {
                            id: "要素ID （1_line 或者UUID）",
                            typeID: "typeid",
                            name: "path1",
                            height: 2,
                            styleID: "样式ID 或者 空 给前端绑定样式管理器用",
                            width: 5,
                            color: 'rgba(155,155,155,1)',
                        }
                    }]
                }, ///线要素表转换成geoJson
                polygon: {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [13223000, 3768700],
                                    [13223080, 3768700],
                                    [13223080, 3768780],
                                    [13223000, 3768780],
                                    [13223000, 3768700]
                                ]
                            ]
                        },
                        "properties": {
                            id: "要素ID （1_polygon 或者UUID）",
                            typeID: "typeid",
                            name: "polygon1",
                            height: 2,
                            styleID: "样式ID 或者 空 给前端绑定样式管理器用",
                            width: 5, ///边线线宽
                            fillColor: 'rgba(255,255,255,1)', ///填充颜色
                            borderColor: 'rgba(255,255,255,1)', ///边线颜色
                            font: 'normal 12px 微软雅黑', ///字号大小
                            fontFillColor: 'rgba(255,255,255,1)', ///填充颜色
                            fontBorderColor: 'rgba(0,0,0,1)', ///边线颜色
                        }
                    }]
                } ///面要素表转换成geoJson
            }
        },
        2: {
            floorData: {}, 
            imageData: {extent:[]},
            layerData: {point: {},path: {},polygon: {},}
        },
        3: {
            ///同1
        }
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