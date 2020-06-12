import {
    Style
} from "./style.js";

///交互事件管理类
export class InterCtionManage {
    constructor(mapedit) {
        this.mapEditor = mapedit;

        this.mapEditor.ol.interactions = {};

        this._filter = {
            build: true,
            point: true,
            path: true,
            polygon: true
        }

        ///定义组件
        this.mapEditor.ol.interactions.draw = new ol.interaction.Draw({});
        this.mapEditor.ol.interactions.select = new ol.interaction.Select({
            ///选择控件筛选器
            filter: (f, l) => {
                if (l == this.mapEditor.ol.layers.buildLayer && this._filter.build)
                    return true;
                if (l == this.mapEditor.ol.layers.pointLayer && this._filter.point)
                    return true;
                if (l == this.mapEditor.ol.layers.pathLayer && this._filter.path)
                    return true;
                if (l == this.mapEditor.ol.layers.polygonLayer && this._filter.polygon)
                    return true;
                return false;
            }
        });

        ///初始化捕捉图层
        this.mapEditor.ol.interactions.modify = new ol.interaction.Modify({
            features: this.getSelectFeatures()
        });
        this.mapEditor.ol.interactions.translate = new ol.interaction.Translate({
            features: this.getSelectFeatures()
        });
        this.mapEditor.ol.interactions.snaps = []
        this.mapEditor.ol.interactions.snaps.push(new ol.interaction.Snap({
            source: this.mapEditor.ol.layers.buildLayer.getSource(),
        }))
        this.mapEditor.ol.interactions.snaps.push(new ol.interaction.Snap({
            source: this.mapEditor.ol.layers.pointLayer.getSource(),
        }))
        this.mapEditor.ol.interactions.snaps.push(new ol.interaction.Snap({
            source: this.mapEditor.ol.layers.pathLayer.getSource(),
        }))
        this.mapEditor.ol.interactions.snaps.push(new ol.interaction.Snap({
            source: this.mapEditor.ol.layers.polygonLayer.getSource(),
        }))

        this.mapEditor.ol.map.addInteraction(this.mapEditor.ol.interactions.select);
        this.mapEditor.ol.map.addInteraction(this.mapEditor.ol.interactions.modify);
        this.mapEditor.ol.map.addInteraction(this.mapEditor.ol.interactions.translate);

        this.mapEditor.ol.interactions.translate.setActive(false);
        this.mapEditor.ol.interactions.modify.setActive(false);

        ///绑定选择要素事件
        this.mapEditor.ol.interactions.select.on("select", (e) => {
            this.chanelEdit();
            if (e.selected.length > 0) {
                if (typeof (this.mapEditor.event.selectFeature) != "undefined") {
                    let f = e.selected[0].getProperties();
                    let layername = "";
                    let l = this.mapEditor.ol.interactions.select.getLayer(e.selected[0]);
                    if (l == this.mapEditor.ol.layers.buildLayer)
                        layername = "建筑物图层";
                    if (l == this.mapEditor.ol.layers.pointLayer)
                        layername = "POI图层";
                    if (l == this.mapEditor.ol.layers.pathLayer)
                        layername = "路径图层";
                    if (l == this.mapEditor.ol.layers.polygonLayer)
                        layername = "多边形图层";

                    delete f["geometry"]
                    this.mapEditor.event.selectFeature({
                        layername: layername,
                        id: e.selected[0].getId(),
                        value: f,
                    })
                }
            }
        })
    }

    chanelEdit() {
        this.mapEditor.ol.interactions.translate.setActive(false);
        this.mapEditor.ol.interactions.modify.setActive(false);
        this._startSnap(false);
        if (this.isRotate)
            this._endRotate();
    }

    ///设置图层是否可选择
    setIsSelect(layer, isSelect) {
        if (layer == "build") {
            this._filter.build = isSelect;
        }
        if (layer == "point") {
            this._filter.point = isSelect;
        }
        if (layer == "path") {
            this._filter.path = isSelect;
        }
        if (layer == "polygon") {
            this._filter.polygon = isSelect;
        }
    }

    ///绘制点
    drawPoint(style = null) {
        this._removeAllInteraction();
        this.mapEditor.ol.interactions.draw = new ol.interaction.Draw({
            source: this.mapEditor.ol.layers.pointLayer.getSource(),
            type: "Point",
        })
        this.mapEditor.ol.map.addInteraction(this.mapEditor.ol.interactions.draw);
        this._startSnap(true);

        this.mapEditor.ol.interactions.draw.on("drawend", (o) => {
            let f = o.feature;
            this._drawEnd(f, "point", style);

        })

    }

    ///绘制路径
    drawPath(style = null) {
        this._removeAllInteraction();
        this.mapEditor.ol.interactions.draw = new ol.interaction.Draw({
            source: this.mapEditor.ol.layers.pathLayer.getSource(),
            type: "LineString",
        })
        this.mapEditor.ol.map.addInteraction(this.mapEditor.ol.interactions.draw);
        this._startSnap(true);
        this.mapEditor.ol.interactions.draw.on("drawend", (o) => {
            let f = o.feature;
            this._drawEnd(f, "path", style);

        })
    }

    ///绘制多边形
    drawPolygon(style = null) {
        this._removeAllInteraction();
        this.mapEditor.ol.interactions.draw = new ol.interaction.Draw({
            source: this.mapEditor.ol.layers.polygonLayer.getSource(),
            type: "Polygon",
        })
        this.mapEditor.ol.map.addInteraction(this.mapEditor.ol.interactions.draw);
        this._startSnap(true);
        this.mapEditor.ol.interactions.draw.on("drawend", (o) => {
            let f = o.feature;
            this._drawEnd(f, "polygon", style);
        })
    }

    ///绘制圆
    drawCircle(style = null) {
        this._removeAllInteraction();
        this.mapEditor.ol.interactions.draw = new ol.interaction.Draw({
            source: this.mapEditor.ol.layers.polygonLayer.getSource(),
            type: "Circle",
        })
        this.mapEditor.ol.map.addInteraction(this.mapEditor.ol.interactions.draw);
        this._startSnap(true);
        this.mapEditor.ol.interactions.draw.on("drawend", (o) => {
            let f = o.feature;
            this._drawEnd(f, "polygon", style);
            // console.log(this.mapEditor.ol.layers.polygonLayer.getStyle())
        })
    }

    ///绘制矩形
    drawBox(style = null) {
        this._removeAllInteraction();
        this.mapEditor.ol.interactions.draw = new ol.interaction.Draw({
            source: this.mapEditor.ol.layers.polygonLayer.getSource(),
            type: "Circle",
            geometryFunction: ol.interaction.Draw.createBox()
        })
        this.mapEditor.ol.map.addInteraction(this.mapEditor.ol.interactions.draw);
        this._startSnap(true);
        this.mapEditor.ol.interactions.draw.on("drawend", (o) => {
            let f = o.feature;
            this._drawEnd(f, "polygon", style);
        })
    }

    _drawEnd(f, layer, s = null) {
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        f.setId(uuid);
        f.set("id", uuid)

        let layername = "";
        if (layer == "point") {
            let style = this.mapEditor.ol.layers.pointLayer.getStyle();
            if (s != null) {
                style = Style.objToPointStyle(s);
            }

            f.set("img", style.getImage().getSrc());
            f.set("size", style.getImage().getSize()[0]);
            layername = "POI图层";
            // f.setStyle(style);

            let img = new Image();
            let src = f.get("img");
            let size = f.get("size");
            img.src = src;
            img.width = size;
            img.height = size;
            img.onload = () => {
                f.setStyle(Style.objToPointStyle({
                    size: size,
                    src: this.mapEditor.getBase64Image(img)
                }));
            }



        }
        if (layer == "path") {
            let style = this.mapEditor.ol.layers.pathLayer.getStyle();
            if (s != null)
                style = Style.objToPathStyle(s);

            f.set("width", style.getStroke().getWidth());
            f.set("color", style.getStroke().getColor());
            layername = "路径图层";
            f.setStyle(style);
        }
        if (layer == "polygon") {
            let style = this.mapEditor.ol.layers.polygonLayer.getStyle();
            if (s != null)
                style = Style.objToPolygonStyle(s);

            f.set("borderColor", style.getStroke().getColor());
            f.set("width", style.getStroke().getWidth());
            f.set("fillColor", style.getFill().getColor());
            f.set("font", style.getText().getFont());
            f.set("fontFillColor", style.getText().getFill().getColor());
            f.set("fontBorderColor", style.getText().getStroke().getColor());
            layername = "多边形图层";
            f.setStyle(style);
        }

        if (typeof (this.mapEditor.event.drawFeature) != "undefined") {
            let d = f.getProperties();
            delete d["geometry"];
            this.mapEditor.event.drawFeature({
                layername: layername,
                id: uuid,
                value: d,
            });
        }

    }

    ///取消绘制
    cancelDraw() {
        this._removeAllInteraction();
        // this.mapEditor.ol.map.addInteraction(this.mapEditor.ol.interactions.select);
        this.mapEditor.ol.interactions.select.setActive(true);
    }

    ///获取选择要素
    getSelectFeatures() {
        return this.mapEditor.ol.interactions.select.getFeatures();
    }

    ///清除选择要素
    clearSelectFeatures() {
        return this.mapEditor.ol.interactions.select.getFeatures().clear();
    }

    ///删除选择要素
    removeSelectFeature() {
        if (this.mapEditor.ol.interactions.select.getFeatures().getLength() == 0)
            return;
        this.mapEditor.ol.interactions.select.getFeatures().forEach(f => {
            this.mapEditor.ol.interactions.select.getLayer(f).getSource().removeFeature(f);
        });
    }

    /// 移动选择要素
    moveSelectFeature() {
        this.chanelEdit();
        this.mapEditor.ol.interactions.translate.setActive(true);
        this._startSnap(true);
    }

    /// 修改选择要素
    modifySelectFeature() {
        this.chanelEdit();
        this.mapEditor.ol.interactions.modify.setActive(true);
        this._startSnap(true);
    }

    ///选择要素回调
    selectFeature(fun) {
        this.mapEditor.event.selectFeature = fun;
    }

    ///绘制要素回调
    drawFeature(fun) {
        this.mapEditor.event.drawFeature = fun;
    }

    ///开启捕捉
    _startSnap(b) {
        if (b)
            this.mapEditor.ol.interactions.snaps.forEach(o => {
                this.mapEditor.ol.map.addInteraction(o);
            })
        else
            this.mapEditor.ol.interactions.snaps.forEach(o => {
                this._removeInteraction(o);
            })
    }

    ///清除所有绑定控件
    _removeAllInteraction() {
        this.getSelectFeatures().clear();
        this.mapEditor.ol.interactions.translate.setActive(false);
        this.mapEditor.ol.interactions.modify.setActive(false);
        this.mapEditor.ol.interactions.select.setActive(false);
        this._startSnap(false);
        this._removeInteraction(this.mapEditor.ol.interactions.draw);
        // this._removeInteraction(this.mapEditor.ol.interactions.select);
    }


    ///移除单个控件
    _removeInteraction(interaction) {
        let interactions = this.mapEditor.ol.map.getInteractions();
        interactions.forEach(e => {
            if (e && interaction && e.ol_uid && interaction.ol_uid && typeof (e.ol_uid) != "undefined" && typeof (interaction.ol_uid) != "undefined")
                if (e.ol_uid == interaction.ol_uid)
                    this.mapEditor.ol.map.removeInteraction(interaction);
        })
    }

    ///开启旋转要素
    startRotate() {
        this.chanelEdit();

        this.isRotate = true;
        this._startDrap(false);
        this.rotate_click = this.mapEditor.ol.map.on('click', event => {
            this._onRotateMapClick(event);
        })
        this.rotate_drag = this.mapEditor.ol.map.on('pointerdrag', event => {
            this._onRotateMapDrag(event);
        })
    }


    _endRotate() {
        this.isRotate = false;
        this._startDrap(true);

        ol.Observable.unByKey(this.rotate_click);
        ol.Observable.unByKey(this.rotate_drag);
    }

    _startDrap(b) {
        this.mapEditor.ol.map.getInteractions().forEach(e => {
            if (e instanceof ol.interaction.DragPan) {
                e.setActive(b);
            }
        })
    }


    ///要素旋转 鼠标离开事件
    _onRotateMapClick(event) {
        // console.log(event)

        this.rotate_before = null;
        // this.rotate_center = null;
    }

    ///要素旋转鼠标拖动事件
    _onRotateMapDrag(event) {
        if (this.rotate_before == null) {
            this.rotate_before = event.coordinate;
            return;
        } else {
            ///求角度

            let getAngle = ({
                x: x1,
                y: y1
            }, {
                x: x2,
                y: y2
            }) => {
                const dot = x1 * x2 + y1 * y2
                const det = x1 * y2 - y1 * x2
                const angle = Math.atan2(det, dot) / Math.PI * 180
                return Math.round(angle + 360) % 360
            }

            // console.log(event)
            this.getSelectFeatures().forEach(f => {
                let g = f.getGeometry();
                let c = ol.extent.getCenter(g.getExtent());
                let a = getAngle({
                    x: this.rotate_before[0] - c[0],
                    y: this.rotate_before[1] - c[1],
                }, {
                    x: event.coordinate[0] - c[0],
                    y: event.coordinate[1] - c[1],
                });

                g.rotate(a * (Math.PI / 180), c);
            });
            this.rotate_before = event.coordinate;
        }
    }
}