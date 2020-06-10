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
                zoom: 17
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
        this.ol.layers.imageLayer = new ol.layer.Image({
            source: new ol.source.ImageStatic({
                url: this.map.imageData.data,
                projection: new ol.proj.Projection({
                    code: "EPSG:3857"
                }),
                imageExtent: this.map.imageData.extent
            })
        });

        if (this.map.imageData.extent.length != 0)
            this.ol.map.getView().fit(this.map.imageData.extent, {
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
            style: Style.poiStyle()
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
                // f.getGeometry().transform("EPSG:4326", "EPSG:3857");
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
                    this.ol.layers.pointLayer.getSource().addFeature(f);
                    f.setStyle(Style.featureToPointStyle(f));
                    f.setId(f.get("id"));

                });
        }
        if (JSON.stringify(this.map.layerData.path) !== '{}') {
            let fs = (new ol.format.GeoJSON()).readFeatures(this.map.layerData.path);
            if (fs.length > 0)
                fs.forEach(f => {
                    this.ol.layers.pathLayer.getSource().addFeature(f);
                    f.setStyle(Style.featureToPathStyle(f));
                    f.setId(f.get("id"));
                });
        }
        if (JSON.stringify(this.map.layerData.polygon) !== '{}') {
            let fs = (new ol.format.GeoJSON()).readFeatures(this.map.layerData.polygon);
            if (fs.length > 0)
                fs.forEach(f => {
                    this.ol.layers.polygonLayer.getSource().addFeature(f);
                    f.setStyle(Style.featureToPolygonStyle(f));
                    f.setId(f.get("id"));
                });
        }

        this.interactionManage = new InterCtionManage(this);
        this.contextmenu = new ContextMenu(this);

        this.contextmenu.add("修改要素", () => {
            this.interactionManage.modifySelectFeature();
        });
        this.contextmenu.add("移动要素", () => {
            this.interactionManage.moveSelectFeature();
        });
        this.contextmenu.add("旋转要素", () => {
            this.interactionManage.startRotate();
        });
        this.contextmenu.add("删除要素", () => {
            this.interactionManage.removeSelectFeature();
        });

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

    ///选择要素回调事件
    drawFeature(fun) {
        this.interactionManage.drawFeature(fun)
    }


    ///绘制点
    drawPoint(style=null) {
        this.interactionManage.drawPoint(style);
    }

    ///绘制路径
    drawPath(style=null) {
        this.interactionManage.drawPath(style);
    }

    ///绘制多边形
    drawPolygon(style=null) {
        this.interactionManage.drawPolygon(style);
    }

    ///绘制圆
    drawCircle(style=null) {
        this.interactionManage.drawCircle(style);
    }

    ///绘制矩形
    drawBox(style=null) {
        this.interactionManage.drawBox(style);
    }

    ///取消绘制
    cancelDraw() {
        this.interactionManage.cancelDraw();
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
            f.setStyle(Style.objToPointStyle(style));
            f.set("img", style.img);
            f.set("size", style.size);
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


}