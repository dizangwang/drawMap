import {
    Style
} from "./style.js";
import {
    InterCtionManage
} from "./interactionmanage.js";
import {
    ContextMenu
} from "./contextmenu.js";


export default class MapEditor {
    ///data 导出数据结构
    ///buildData 轮廓geoJson{属性中需要包含name (建筑物名称)  floors 楼层数}
    constructor(option) {
        ///geojson{} 对应的楼层关联件。样式信息，颜色字体等数据
        ///map 结构
        this.map = option.data;
        this._container = option.container;
        ///事件
        this.event = {};
        ///ol对象
        this.ol = {};
        ///图层
        this.ol.layers = {}
        ///控件
        this.ol.control = {}
        ///地图
        this.ol.map = new ol.Map({
            target: option.container || "",
            ///层级由低到高
            layers: [],
            view: new ol.View({
                center: ol.proj.fromLonLat([118.783, 32.042]),
                zoom: 17,
                minZoom: 16,
                maxZoom: 22,
            }),
            controls: ol.control.defaults({
                zoom: false,
            })
        });
        ///交互工具类
        this.interactionManage = null;
        this.contextmenu = null;
        ///初始化
        this._initHTML();


        this._initFloor();
    }


    _initFloor() {
        this.ol.map.getLayers().clear();
        ///定义图层

        let extent = [];
        if (this.map.imageData.extent.length != 0) {
            let p0 = this.transformTo3857(this.map.imageData.extent[0], this.map.imageData.extent[1]);
            let p1 = this.transformTo3857(this.map.imageData.extent[2], this.map.imageData.extent[3]);
            extent = [p0[0], p0[1], p1[0], p1[1]]
        }

        this.ol.layers.imageLayer = new ol.layer.Image({
            source: new ol.source.ImageStatic({
                url: this.map.imageData.data,
                projection: new ol.proj.Projection({
                    code: "EPSG:3857"
                }),
                imageExtent: extent
            })
        });

        if (this.map.imageData.extent.length != 0)
            this.ol.map.getView().fit(extent, {
                padding: [100, 100, 100, 100],
            });
        this.ol.layers.buildLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: Style.buildStyle()
        });
        this.ol.layers.polygonLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: Style.buildStyle()
        });
        this.ol.layers.pathLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: Style.pathStyle()
        });
        this.ol.layers.pointLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: Style.poiStyle(),
            // style: (f, r) => {
            // return Style.featureToPointStyle(f);
            // },
        });

        this.ol.map.addLayer(this.ol.layers.imageLayer);
        this.ol.map.addLayer(this.ol.layers.buildLayer);
        this.ol.map.addLayer(this.ol.layers.polygonLayer);
        this.ol.map.addLayer(this.ol.layers.pathLayer);
        this.ol.map.addLayer(this.ol.layers.pointLayer);

        ///添加要素
        if (typeof (this.map.floorData.geometry) != "undefined") {
            let v = (new ol.format.GeoJSON()).readFeatures(this.map.floorData);
            v.forEach(f => {
                f.getGeometry().transform("EPSG:4326", "EPSG:3857");
                // console.log((new ol.format.GeoJSON()).writeFeatures([f]));
                this.ol.layers.buildLayer.getSource().addFeature(f);
                this.ol.map.getView().fit(f.getGeometry().getExtent(), {
                    padding: [100, 100, 100, 100],
                });
                f.setStyle(Style.featureToBuildStyle(f));
                f.setId(f.get("id"));
            });
        }

        ///初始化图层
        if (JSON.stringify(this.map.layerData.point) !== '{}') {
            let fs = (new ol.format.GeoJSON()).readFeatures(this.map.layerData.point);
            if (fs.length > 0)
                fs.forEach(f => {
                    f.getGeometry().transform("EPSG:4326", "EPSG:3857");
                    this.ol.layers.pointLayer.getSource().addFeature(f);
                    // f.setStyle(Style.featureToPointStyle(f));
                    let img = new Image();
                    let src = f.get("img");
                    let s = f.get("size");
                    img.src = src;
                    img.width = s;
                    img.height = s;
                    img.onload = () => {
                        f.setStyle(Style.objToPointStyle({
                            size: s,
                            src: this.getBase64Image(img)
                        }));
                    }
                    f.setId(f.get("id"));

                });
        }
        if (JSON.stringify(this.map.layerData.path) !== '{}') {
            let fs = (new ol.format.GeoJSON()).readFeatures(this.map.layerData.path);
            if (fs.length > 0)
                fs.forEach(f => {
                    f.getGeometry().transform("EPSG:4326", "EPSG:3857");
                    this.ol.layers.pathLayer.getSource().addFeature(f);
                    f.setStyle(Style.featureToPathStyle(f));
                    f.setId(f.get("id"));
                });
        }
        if (JSON.stringify(this.map.layerData.polygon) !== '{}') {

            let fs = (new ol.format.GeoJSON()).readFeatures(this.map.layerData.polygon);
            if (fs.length > 0)
                fs.forEach(f => {
                    f.getGeometry().transform("EPSG:4326", "EPSG:3857");
                    this.ol.layers.polygonLayer.getSource().addFeature(f);
                    f.setStyle(Style.featureToPolygonStyle(f));
                    f.setId(f.get("id"));
                });
        }

        this.interactionManage = new InterCtionManage(this);
        this.contextmenu = new ContextMenu(this);


        this.contextmenu.add("修改要素", () => {
            this.interactionManage.modifySelectFeature();
        }, "build,path,polygon,image");
        this.contextmenu.add("移动要素", () => {
            this.interactionManage.moveSelectFeature();
        }, "build,point,path,polygon,image");
        this.contextmenu.add("旋转要素", () => {
            this.interactionManage.startRotate();
        }, "build,polygon,image");
        // this.contextmenu.add("取消编辑", () => {
        //     this.interactionManage.chanelEdit();
        //     this.interactionManage.clearSelectFeatures();
        // });
        this.contextmenu.add("删除要素", () => {
            this.interactionManage.removeSelectFeature();
        }, "point,path,polygon");

        ///比例尺
        this.ol.control.scaleLine = new ol.control.ScaleLine({
            className: "map-scaleline",
            units: 'metric',
            target: document.getElementById("scaleLine"),
        });
        this.ol.map.addControl(this.ol.control.scaleLine);
    }


    _initHTML() {
        ///默认比例尺 样式
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
        .map-scaleline {
            background: rgba(0, 60, 136, .3);
            border-radius: 4px;
            bottom: 8px;
            left: 8px;
            padding: 2px;
            position: absolute;
        }
        .map-scaleline-inner {
            border: 1px solid #eee;
            border-top: none;
            color: #eee;
            font-size: 10px;
            text-align: center;
            margin: 1px;
            will-change: contents, width;
            transition: all .25s;
        }
        `;
        document.getElementsByTagName('head')[0].appendChild(style);
    }


    ///重置数据
    setData(data) {
        this.map = data;
        this._initFloor();
    }

    ///选择要素回调事件
    selectFeature(fun) {
        this.interactionManage.selectFeature(fun)
    }

    ///绘制要素回调事件
    drawFeature(fun) {
        this.interactionManage.drawFeature(fun)
    }

    ///绘制结束
    drawFinish(fun) {
        this.interactionManage.drawFinish(fun)
    }

    ///绘制点
    drawPoint(style = null) {
        this.interactionManage.drawPoint(style);
    }

    ///绘制路径
    drawPath(style = null) {
        this.interactionManage.drawPath(style);
    }

    ///绘制多边形
    drawPolygon(style = null) {
        this.interactionManage.drawPolygon(style);
    }

    ///绘制圆
    drawCircle(style = null) {
        this.interactionManage.drawCircle(style);
    }

    ///绘制矩形
    drawBox(style = null) {
        this.interactionManage.drawBox(style);
    }

    ///获取图片默认位置
    defaultImageData(img, fix = 500) {

        let newData = img;

        if (this.ol.layers.buildLayer.getSource().getFeatures().length > 0) {
            let f = this.ol.layers.buildLayer.getSource().getFeatures()[0].clone();
            let e;

            ///获取新正方形图片
            newData = this.getNewImgBase64(img, fix);

            let mapSize = this.ol.map.getSize();
            var mapExtent = this.ol.map.getView().calculateExtent(mapSize);

            ///每个像素对应的经纬度
            let w = (mapExtent[2] - mapExtent[0]) / mapSize[0];
            let h = (mapExtent[3] - mapExtent[1]) / mapSize[1];

            let newWidth = (img.width > img.height) ? img.width : img.height;
            newWidth = newWidth * 3 / 4

            var p = ol.extent.getCenter(mapExtent);
            e = [p[0] - newWidth * w / 2, p[1] - newWidth * h / 2, p[0] + newWidth * w / 2, p[1] + newWidth * h / 2]
            //     let arr = [];
            //     arr.push([e[0], e[1]]);
            //     arr.push([e[0], e[3]]);
            //     arr.push([e[2], e[3]]);
            //     arr.push([e[2], e[1]]);
            //     arr.push([e[0], e[1]]);
            //     let polygon = new ol.geom.Polygon([arr]);
            //    f .setGeometry(polygon);
            let p0 = this.transformTo4326(e[0], e[1]);
            let p1 = this.transformTo4326(e[2], e[3]);
            let extent = [p0[0], p0[1], p1[0], p1[1]]
            return {
                data: newData,
                extent: extent
            };
        }
    }


    ///编辑图片
    editImage(data, ext = null, fix = 500) {
        let img = new Image();
        img.src = data;
        if (ext != null) {
            let p0 = this.transformTo3857(ext[0], ext[1]);
            let p1 = this.transformTo3857(ext[2], ext[3]);
            ext = [p0[0], p0[1], p1[0], p1[1]]
        }

        img.onload = () => {
            let newData = data;
            // this.temImg = data;
            this.ol.layers.temLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: Style.buildStyle()
            });
            this.ol.map.addLayer(this.ol.layers.temLayer);
            if (this.ol.layers.buildLayer.getSource().getFeatures().length > 0) {
                let f = this.ol.layers.buildLayer.getSource().getFeatures()[0].clone();
                let e;
                if (ext == null) {
                    ///获取新正方形图片
                    newData = this.getNewImgBase64(img, fix);

                    let mapSize = this.ol.map.getSize();
                    var mapExtent = this.ol.map.getView().calculateExtent(mapSize);

                    ///每个像素对应的经纬度
                    let w = (mapExtent[2] - mapExtent[0]) / mapSize[0];
                    let h = (mapExtent[3] - mapExtent[1]) / mapSize[1];

                    let newWidth = (img.width > img.height) ? img.width : img.height;
                    newWidth = newWidth * 3 / 4

                    var p = ol.extent.getCenter(mapExtent);
                    e = [p[0] - newWidth * w / 2, p[1] - newWidth * h / 2, p[0] + newWidth * w / 2, p[1] + newWidth * h / 2]

                } else
                    e = ext;

                let arr = [];
                arr.push([e[0], e[1]]);
                arr.push([e[0], e[3]]);
                arr.push([e[2], e[3]]);
                arr.push([e[2], e[1]]);
                arr.push([e[0], e[1]]);
                let polygon = new ol.geom.Polygon([arr]);
                f.setGeometry(polygon);

                let style = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(217,0,0,1.0)',
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(247,254,255,0.8)'
                    }),
                    text: new ol.style.Text({
                        font: 'normal 12px 微软雅黑',
                        // text: featrue.get('name'),
                        fill: new ol.style.Fill({
                            color: 'rgba(255,255,255,1)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0,0,0,1)',
                            width: 2
                        })
                    })
                });
                // f.setStyle(style);
                this.ol.layers.buildLayer.getSource().getFeatures()[0].setStyle(style);
                this.ol.layers.temLayer.getSource().addFeature(f);

                let p0 = this.transformTo4326(e[0], e[1]);
                let p1 = this.transformTo4326(e[2], e[3]);
                let extent = [p0[0], p0[1], p1[0], p1[1]]
                this.setImageData({
                    data: newData,
                    extent: extent
                });
            }
            this.interactionManage._filter.editImage = true;
            this.interactionManage.editImage(newData);
        }
    }

    // 取消图片编辑
    cancelEditImage() {
        this.interactionManage._filter.editImage = false;

        let img = this.interactionManage.cancelEditImage();
        if (this.ol.layers.temLayer.getSource().getFeatures().length > 0) {
            let f = this.ol.layers.temLayer.getSource().getFeatures()[0].clone();
            let e = f.getGeometry().getExtent();
            let p0 = this.transformTo4326(e[0], e[1]);
            let p1 = this.transformTo4326(e[2], e[3]);
            let extent = [p0[0], p0[1], p1[0], p1[1]]
            this.setImageData({
                data: img,
                extent: extent
            });
        }
        this.ol.layers.buildLayer.getSource().getFeatures()[0].setStyle(Style.buildStyle());

        this.ol.map.removeLayer(this.ol.layers.temLayer);

        return {
            data: img,
            extent: this.map.imageData.extent
        };
    }

    ///取消绘制
    cancelDraw(t = false) {
        this.interactionManage.cancelDraw(t);
    }

    ///地图放大
    zoomOut() {
        let view = this.ol.map.getView();
        view.setZoom(view.getZoom() + 1);
    }

    ///地图缩小
    zoomIn() {
        let view = this.ol.map.getView();
        view.setZoom(view.getZoom() - 1);
    }

    ///设置建筑物样式
    setBuildStyle(id, style) {
        let f = this.ol.layers.buildLayer.getSource().getFeatureById(id);
        if (typeof (f) != "undefined") {
            this.interactionManage.clearSelectFeatures();
            f.setStyle(Style.objToBuildStyle(style));
            f.set("borderColor", style.borderColor);
            f.set("width", style.width);
            f.set("fillColor", style.fillColor);
        }
    }

    ///设置点样式
    setPointStyle(id, style) {
        let f = this.ol.layers.pointLayer.getSource().getFeatureById(id);
        if (typeof (f) != "undefined") {
            this.interactionManage.clearSelectFeatures();
            f.set("img", style.img);
            f.set("size", style.size);

            let img = new Image();
            img.src = style.img;
            img.width = style.size;
            img.height = style.size;
            img.onload = () => {
                f.setStyle(Style.objToPointStyle({
                    size: style.size,
                    src: this.getBase64Image(img)
                }));
            }
        }
    }

    ///设置线样式
    setPathStyle(id, style) {
        let f = this.ol.layers.pathLayer.getSource().getFeatureById(id);
        if (typeof (f) != "undefined") {
            this.interactionManage.clearSelectFeatures();
            f.setStyle(Style.objToPathStyle(style));
            f.set("width", style.width);
            f.set("color", style.color);
        }
    }

    ///设置面样式
    setPolygonStyle(id, style) {
        let f = this.ol.layers.polygonLayer.getSource().getFeatureById(id);
        if (typeof (f) != "undefined") {
            this.interactionManage.clearSelectFeatures();
            f.setStyle(Style.objToPolygonStyle(style));
            f.set("name", style.name);
            f.set("borderColor", style.borderColor);
            f.set("width", style.width);
            f.set("fillColor", style.fillColor);
            f.set("font", style.font);
            f.set("fontFillColor", style.fontFillColor);
            f.set("fontBorderColor", style.fontBorderColor);
        }
    }

    ///总数据返回接口
    getData(type = "all") {
        let data = [];
        let fs;
        if (type == "build") {
            fs = this.ol.layers.buildLayer.getSource().getFeatures()
        }
        if (type == "point") {
            fs = this.ol.layers.pointLayer.getSource().getFeatures()
        }
        if (type == "path") {
            fs = this.ol.layers.pathLayer.getSource().getFeatures()
        }
        if (type == "polygon") {
            fs = this.ol.layers.polygonLayer.getSource().getFeatures()
        }
        if (type == "all") {
            fs = this.ol.layers.buildLayer.getSource().getFeatures()
            fs.concat(this.ol.layers.pointLayer.getSource().getFeatures());
            fs.concat(this.ol.layers.pathLayer.getSource().getFeatures());
            fs.concat(this.ol.layers.polygonLayer.getSource().getFeatures());
        }
        fs.forEach(f => {
            data.push(f.getProperties());
        })
        return data;
    }

    ///设置图层显隐
    setLayerDisplay(layer, display) {
        if (layer == "image") {
            this.ol.layers.imageLayer.setVisible(display);
        }
        if (layer == "build") {
            this.ol.layers.buildLayer.setVisible(display);
        }
        if (layer == "point") {
            this.ol.layers.pointLayer.setVisible(display);
        }
        if (layer == "path") {
            this.ol.layers.pathLayer.setVisible(display);
        }
        if (layer == "polygon") {
            this.ol.layers.polygonLayer.setVisible(display);
        }
    }

    ///设置图层是否可选择
    setIsSelect(layer, isSelect) {
        this.interactionManage.setIsSelect(layer, isSelect);
    }

    ///设置底图数据
    setImageData(data) {
        this.map.imageData = data;

        // [13222863.074897416, 3768562.394749727, 13223197.033369796, 3768825.0433383826]

        let p0 = this.transformTo3857(this.map.imageData.extent[0], this.map.imageData.extent[1]);
        let p1 = this.transformTo3857(this.map.imageData.extent[2], this.map.imageData.extent[3]);
        let extent = [p0[0], p0[1], p1[0], p1[1]]
        if (this.map.imageData.extent.length != 0) {
            this.ol.layers.imageLayer.setSource(new ol.source.ImageStatic({
                url: this.map.imageData.data,
                projection: new ol.proj.Projection({
                    code: "EPSG:3857"
                }),
                imageExtent: extent
            }));
            if (this.map.imageData.extent.length != 0)
                this.ol.map.getView().fit(extent, {
                    padding: [100, 100, 100, 100],
                });

        }
    }

    ///设置底图数据
    setBuildData(data) {
        this.map.floorData = data;
        this.ol.layers.buildLayer.getSource().clear();

        ///添加要素
        if (typeof (this.map.floorData.geometry) != "undefined") {
            let v = (new ol.format.GeoJSON()).readFeatures(this.map.floorData);
            v.forEach(f => {
                f.getGeometry().transform("EPSG:4326", "EPSG:3857");
                // console.log((new ol.format.GeoJSON()).writeFeatures([f]));
                this.ol.layers.buildLayer.getSource().addFeature(f);
                this.ol.map.getView().fit(f.getGeometry().getExtent(), {
                    padding: [100, 100, 100, 100],
                });
                f.setStyle(Style.featureToBuildStyle(f));
                f.setId(f.get("id"));
            });
        }

    }

    ///根据id删除要素
    deleteFeatureById(layer, id) {
        let source;
        if (layer == "build")
            source = this.ol.layers.buildLayer.getSource();
        if (layer == "point")
            source = this.ol.layers.pointLayer.getSource();
        if (layer == "path")
            source = this.ol.layers.pathLayer.getSource();
        if (layer == "polygon")
            source = this.ol.layers.polygonLayer.getSource();
        let f = source.getFeatureById(id);
        source.removeFeature(f);
    }

    ///根据ID添加要素信息
    addFeatureById(layer, id, k, v) {
        let source;
        if (layer == "build")
            source = this.ol.layers.buildLayer.getSource();
        if (layer == "point")
            source = this.ol.layers.pointLayer.getSource();
        if (layer == "path")
            source = this.ol.layers.pathLayer.getSource();
        if (layer == "polygon")
            source = this.ol.layers.polygonLayer.getSource();
        let f = source.getFeatureById(id);
        f.set(k, v);
        // source.removeFeature(f);
    }

    getCenter() {
        var mapExtent = this.ol.map.getView().calculateExtent(this.ol.map.getSize());
        var p = ol.extent.getCenter(mapExtent);
        return this.transformTo4326(p[0], p[1])
    }

    setCenter(p) {
        let point = this.transformTo3857(p[0], p[1])
        this.ol.map.getView().setCenter(point);
    }


    getZoom() {
        return this.ol.map.getView().getZoom();
    }

    setZoom(z) {
        this.ol.map.getView().setZoom(z);
    }



    ///获取保存后端数据
    getSaveData() {
        let format = new ol.format.GeoJSON();
        // console.log((new ol.format.GeoJSON()).writeFeatures([f]));

        let d = {
            floorData: {},
            imageData: {},
            layerData: {
                point: {},
                path: {},
                polygon: {}
            }
        };

        let fs = [];
        let ffs = [];
        fs = this.ol.layers.pointLayer.getSource().getFeatures();
        fs.forEach(o => {
            let f = o.clone();
            f.getGeometry().transform("EPSG:3857", "EPSG:4326");
            ffs.push(f);
        })
        d.layerData.point = JSON.parse(format.writeFeatures(ffs));

        ffs = [];
        fs = this.ol.layers.pathLayer.getSource().getFeatures();
        fs.forEach(o => {
            let f = o.clone();
            f.getGeometry().transform("EPSG:3857", "EPSG:4326");
            ffs.push(f);
        })
        d.layerData.path = JSON.parse(format.writeFeatures(ffs));

        ffs = [];
        fs = this.ol.layers.polygonLayer.getSource().getFeatures();
        fs.forEach(o => {
            let f = o.clone();
            f.getGeometry().transform("EPSG:3857", "EPSG:4326");
            ffs.push(f);
        })
        d.layerData.polygon = JSON.parse(format.writeFeatures(ffs));


        if (this.ol.layers.buildLayer.getSource().getFeatures().length > 0) {
            let f = this.ol.layers.buildLayer.getSource().getFeatures()[0].clone();
            f.getGeometry().transform("EPSG:3857", "EPSG:4326");
            d.floorData = JSON.parse(format.writeFeature(f));
        } else
            d.floorData = {};
        d.imageData = this.map.imageData;

        if (d.floorData != {})
            delete d.floorData.id;

        d.layerData.point.features.forEach(f => {
            delete f.id;
        })
        d.layerData.path.features.forEach(f => {
            delete f.id;
        })
        d.layerData.polygon.features.forEach(f => {
            delete f.id;
        })

        return d;
    }

    transformTo3857(lon, lat) {
        var p = [lon, lat];
        p = ol.proj.transform(p, 'EPSG:4326', 'EPSG:3857');
        return p;
    }

    transformTo4326(lon, lat) {
        var p = [lon, lat];
        p = ol.proj.transform(p, 'EPSG:3857', 'EPSG:4326');
        return p;
    }

    static canvas = null;

    getBase64Image(img) {
        if (this.canvas == null)
            this.canvas = document.createElement("canvas");
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        var ctx = this.canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var dataURL = this.canvas.toDataURL("image/png");
        return dataURL;
    }

    getNewImgBase64(img, fix) {
        if (this.canvas == null)
            this.canvas = document.createElement("canvas");

        // this.canvas.width = fix;
        // this.canvas.height = fix;
        // let dis = Math.sqrt(img.width * img.width + img.height * img.height);
        // let sacel = fix / dis
        // var ctx = this.canvas.getContext("2d");
        // ctx.drawImage(img, (fix - img.width * sacel) / 2, (fix - img.height * sacel) / 2, img.width * sacel, img.height * sacel);

        let dis = Math.sqrt(img.width * img.width + img.height * img.height);
        this.canvas.width = dis;
        this.canvas.height = dis;
        let sacel = 1
        var ctx = this.canvas.getContext("2d");
        ctx.drawImage(img, (dis - img.width * sacel) / 2, (dis - img.height * sacel) / 2, img.width * sacel, img.height * sacel);

        var dataURL = this.canvas.toDataURL("image/png");
        return dataURL;
    }

    rotateBase64Iamge(img, angle) {
        if (this.canvas == null)
            this.canvas = document.createElement("canvas");


        this.canvas.width = img.width;
        this.canvas.height = img.height;
        var ctx = this.canvas.getContext("2d");

        let w = this.canvas.width;
        let h = this.canvas.height;
        ctx.translate(w / 2, h / 2); // 1
        ctx.rotate(-angle); // 2
        ctx.drawImage(img, -w / 2, -h / 2);
        // 恢复设置（恢复的步骤要跟你修改的步骤向反）
        ctx.rotate(angle);
        return this.canvas.toDataURL("image/png");
    }

}