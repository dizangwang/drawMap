import {
    Style
} from "./style.js";

///交互事件管理类
export class InterCtionManage {
    constructor(mapedit) {
        this.mapEditor = mapedit;

        this._drawFeatureArray = [];


        this.mapEditor.ol.interactions = {};

        this._filter = {
            build: true,
            point: true,
            path: true,
            polygon: true,
            editImage: false
        }

        ///定义组件
        this.mapEditor.ol.interactions.draw = new ol.interaction.Draw({});
        this.mapEditor.ol.interactions.select = new ol.interaction.Select({
            ///选择控件筛选器
            filter: (f, l) => {
                if (!this._filter.editImage) {
                    if (l == this.mapEditor.ol.layers.buildLayer && this._filter.build)
                        return true;
                    if (l == this.mapEditor.ol.layers.pointLayer && this._filter.point)
                        return true;
                    if (l == this.mapEditor.ol.layers.pathLayer && this._filter.path)
                        return true;
                    if (l == this.mapEditor.ol.layers.polygonLayer && this._filter.polygon)
                        return true;
                } else
                if (l == this.mapEditor.ol.layers.temLayer)
                    return true;
                return false;
            },
            hitTolerance: 3,
        });

        ///初始化捕捉图层
        this.mapEditor.ol.interactions.modify = new ol.interaction.Modify({
            features: this.getSelectFeatures(),
            insertVertexCondition: () => {
                if (this._filter.editImage)
                    return false;
                return true;
            },
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
            } else {
                if (typeof (this.mapEditor.event.selectFeature) != "undefined") {
                    this.mapEditor.event.selectFeature(null)
                }
            }
        })

        this.isRotate = false;
        this.isImageModify = false;
        this.imageModifyIndex = null;

        this.rotate_click = this.mapEditor.ol.map.on('click', event => {


            // if (typeof (this.mapEditor.event.click) != "undefined") {
            //     this.mapEditor.event.click();
            // }

            if (this.isRotate)
                this._onRotateMapClick(event);



            // this.imageModifyIndex = null;

            // let f = this.mapEditor.ol.layers.temLayer.getSource().getFeatures()[0].clone();
            // let g = f.getGeometry();
            // let ps = g.getCoordinates();

            // ps[0].forEach((p, i) => {
            //     let pp = this.mapEditor.ol.map.getPixelFromCoordinate(p);
            //     let a = pp[0] - event.pixel[0];
            //     let b = pp[1] - event.pixel[1];
            //     let d = Math.sqrt(a * a + b * b);
            //     if (d <= 10) {
            //         this.imageModifyIndex = i;
            //         return;
            //     }
            // })

            // this.mapEditor.ol. map.getPixelFromCoordinate(coordinate)
            // if (ps[0].indexOf(event.coordinate) >= 0) {
            // console.log(1);
            // }

        })



        this.throttleFunc = this.throttle(((event) => {
            // console.log(1);
            if (this.isRotate)
                this._onRotateMapDrag(event);

            if (this._filter.editImage)
                this.freshImage();
        }), 50);

        this.rotate_drag = this.mapEditor.ol.map.on('pointerdrag', event => {

            if (this.isImageModify) {
                if (this.imageModifyIndex == null) {
                    let f = this.mapEditor.ol.layers.temLayer.getSource().getFeatures()[0].clone();
                    let g = f.getGeometry();
                    let ps = g.getCoordinates();
                    for (let i = 0; i < 4; i++) {
                        let p = ps[0][i];
                        let pp = this.mapEditor.ol.map.getPixelFromCoordinate(p);
                        let a = pp[0] - event.pixel[0];
                        let b = pp[1] - event.pixel[1];
                        let d = Math.sqrt(a * a + b * b);
                        if (d <= 10) {
                            this.imageModifyIndex = i;
                            // break;
                        }
                    }
                }
                if (this.imageModifyIndex != null)
                    this._onImageModifyMove(event);
                return;
            }


            this.throttleFunc.bind(this)(event);

        })
    }

    throttle(fn, interval = 500) {
        let timer = null;
        let firstTime = true;

        return function (arg) {
            if (firstTime) {
                // 第一次加载
                fn(arg);
                return firstTime = false;
            }
            if (timer) {
                // 定时器正在执行中，跳过
                return;
            }
            timer = setTimeout(() => {
                clearTimeout(timer);
                timer = null;
                fn(arg);
            }, interval);
        };
    }

    freshImage() {
        if (this.mapEditor.ol.layers.temLayer.getSource().getFeatures().length > 0) {
            let f = this.mapEditor.ol.layers.temLayer.getSource().getFeatures()[0].clone();
            let e = f.getGeometry().getExtent();
            this.mapEditor.ol.layers.imageLayer.setSource(new ol.source.ImageStatic({
                url: this.temBase64,
                projection: new ol.proj.Projection({
                    code: "EPSG:3857"
                }),
                imageExtent: e
            }));
        }
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
            condition: (e) => {
                if (e.originalEvent.button == 0)
                    return true;
            },
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
            this._drawEnd(f, "circle", style);
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


    ///绘制完成事件
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

            f.set("name", s.name);
            f.set("borderColor", style.getStroke().getColor());
            f.set("width", style.getStroke().getWidth());
            f.set("fillColor", style.getFill().getColor());
            f.set("font", style.getText().getFont());
            f.set("fontFillColor", style.getText().getFill().getColor());
            f.set("fontBorderColor", style.getText().getStroke().getColor());
            layername = "多边形图层";
            f.setStyle(style);
        }
        if (layer == "circle") {
            let c = f.getGeometry().flatCoordinates;
            let p1 = [c[0], c[1]];
            let p2 = [c[2], c[3]];
            // g
            let dx = Math.abs(p2[0] - p1[0]);
            let dy = Math.abs(p2[1] - p1[1]);
            var r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            let arr = [];

            for (let i = 0; i <= 36; i++) {
                var x = p1[0] + r * Math.sin(2 * Math.PI * i / 36),
                    y = p1[1] + r * Math.cos(2 * Math.PI * i / 36);
                arr.push([x, y]);
            }

            let polygon = new ol.geom.Polygon([arr]);
            f.setGeometry(polygon);
            let style = this.mapEditor.ol.layers.polygonLayer.getStyle();
            if (s != null)
                style = Style.objToPolygonStyle(s);

            f.set("name", s.name);
            f.set("borderColor", style.getStroke().getColor());
            f.set("width", style.getStroke().getWidth());
            f.set("fillColor", style.getFill().getColor());
            f.set("font", style.getText().getFont());
            f.set("fontFillColor", style.getText().getFill().getColor());
            f.set("fontBorderColor", style.getText().getStroke().getColor());
            layername = "多边形图层";
            f.setStyle(style);
        }

        // this.mapEditor.interactionManage.getSelectFeatures().push(f);
        if (layername == "多边形图层")
            this._drawFeatureArray.push(f);

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
    cancelDraw(t = false) {

        this._removeAllInteraction();

        if (typeof (this.mapEditor.event.drawFinish) != "undefined")
            this.mapEditor.event.drawFinish("绘制结束");
        // this.mapEditor.ol.map.addInteraction(this.mapEditor.ol.interactions.select);
        this.mapEditor.ol.interactions.select.setActive(true);


        if (this._drawFeatureArray.length > 0 && t) {
            this.mapEditor.ol.interactions.select.getFeatures().push(this._drawFeatureArray[this._drawFeatureArray.length - 1]);

            let f = this._drawFeatureArray[this._drawFeatureArray.length - 1].getProperties();
            // let layername = "";
            // let l = this.mapEditor.ol.interactions.select.getLayer(this._drawFeatureArray[this._drawFeatureArray.length - 1]);
            // if (l == this.mapEditor.ol.layers.buildLayer)
            //     layername = "建筑物图层";
            // if (l == this.mapEditor.ol.layers.pointLayer)
            //     layername = "POI图层";
            // if (l == this.mapEditor.ol.layers.pathLayer)
            //     layername = "路径图层";
            // if (l == this.mapEditor.ol.layers.polygonLayer)
            //     layername = "多边形图层";

            delete f["geometry"]
            this.mapEditor.event.selectFeature({
                layername: "多边形图层",
                id: this._drawFeatureArray[this._drawFeatureArray.length - 1].getId(),
                value: f,
            })


        }

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

    ///编辑图片
    editImage(data) {
        let img = new Image();
        img.src = data;
        img.onload = (() => {
            this.temImg = img;
            this.temBase64 = this.mapEditor.getBase64Image(this.temImg);
        }).bind(this)
        this.clearSelectFeatures()
        this.chanelEdit();
        this.mapEditor.ol.interactions.translate.setActive(true);
        this.mapEditor.ol.interactions.modify.setActive(true);



        this.mapEditor.ol.interactions.modify.on("modifystart", (e) => {
            this.isImageModify = true;
        });



        this.mapEditor.ol.interactions.modify.on("modifyend", (e) => {
            this.isImageModify = false;
            this.imageModifyIndex = null;

        })

        this.mapEditor.ol.interactions.translate.on("translateend", (e) => {})

        this._startSnap(true);
    }

    ///取消编辑图片
    cancelEditImage() {
        this.clearSelectFeatures()
        this.chanelEdit();
        this.mapEditor.ol.interactions.modify.on("modifystart", (e) => {});
        this.mapEditor.ol.interactions.modify.on("modifyend", (e) => {});
        this.mapEditor.ol.interactions.modify.on("translateend", (e) => {});


        return this.temBase64;

    }

    _onImageModifyMove(event) {
        if (this.mapEditor.ol.layers.temLayer.getSource().getFeatures().length > 0) {
            let f = this.mapEditor.ol.layers.temLayer.getSource().getFeatures()[0].clone();
            let g = f.getGeometry();
            let ps = g.getCoordinates();

            // console.log(this.imageModifyIndex);

            let p0 = ps[0][this.imageModifyIndex >= 2 ? this.imageModifyIndex - 2 : this.imageModifyIndex + 2];

            let p1 = event.coordinate;
            let maxX = p0[0] > p1[0] ? p0[0] : p1[0];
            let maxY = p0[1] > p1[1] ? p0[1] : p1[1];
            let minX = p0[0] < p1[0] ? p0[0] : p1[0];
            let minY = p0[1] < p1[1] ? p0[1] : p1[1];

            let e = [minX, minY, maxX, maxY];
            let arr = [];
            arr.push([e[0], e[1]]);
            arr.push([e[0], e[3]]);
            arr.push([e[2], e[3]]);
            arr.push([e[2], e[1]]);
            arr.push([e[0], e[1]]);
            let newGeo = new ol.geom.Polygon([arr]);
            this.mapEditor.ol.layers.temLayer.getSource().getFeatures()[0].setGeometry(newGeo);
            this.mapEditor.ol.layers.imageLayer.setSource(new ol.source.ImageStatic({
                url: this.temBase64,
                projection: new ol.proj.Projection({
                    code: "EPSG:3857"
                }),
                imageExtent: e
            }));
            return;
        }
    }

    ///选择要素回调
    selectFeature(fun) {
        this.mapEditor.event.selectFeature = fun;
    }

    // click(fun) {
    //     this.mapEditor.event.click = fun;

    // }

    ///绘制要素回调
    drawFeature(fun) {
        this.mapEditor.event.drawFeature = fun;
    }

    ///绘制结束事件
    drawFinish(fun) {
        this.mapEditor.event.drawFinish = fun;
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

    getDrawAction() {
        let interaction = this.mapEditor.ol.interactions.draw;

        let b = false
        let interactions = this.mapEditor.ol.map.getInteractions();
        interactions.forEach(e => {
            if (e && interaction && e.ol_uid && interaction.ol_uid && typeof (e.ol_uid) != "undefined" && typeof (interaction.ol_uid) != "undefined")
                if (e.ol_uid == interaction.ol_uid)
                    b = true;
        })
        return b;
    }

    ///开启旋转要素
    startRotate() {
        this.chanelEdit();

        this.rotatePoint = ol.extent.getCenter(this.mapEditor.interactionManage.getSelectFeatures().getArray()[0].getGeometry().getExtent());

        this.isRotate = true;
        this._startDrap(false);

    }


    _endRotate() {
        this.isRotate = false;
        this._startDrap(true);

        // ol.Observable.unByKey(this.rotate_click);
        // ol.Observable.unByKey(this.rotate_drag);
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
        this.rotare_first = null;
        this.rotate_before = null;
        this.rotatePoint = null;
        // this.rotate_center = null;
    }

    ///要素旋转鼠标拖动事件
    _onRotateMapDrag(event) {
        if (this.rotare_first == null)
            this.rotare_first = event.coordinate;
        if (this.rotate_before == null) {
            this.rotate_before = event.coordinate;
            return;
        } else {
            // console.log(event)
            this.getSelectFeatures().forEach(f => {
                if (!this._filter.editImage) {
                    let g = f.getGeometry();
                    let c = this.rotatePoint;
                    let a = this.getAngle({
                        x: this.rotate_before[0] - c[0],
                        y: this.rotate_before[1] - c[1],
                    }, {
                        x: event.coordinate[0] - c[0],
                        y: event.coordinate[1] - c[1],
                    });
                    g.rotate(a * (Math.PI / 180), c);
                } else {
                    /////图片旋转
                    let c = this.rotatePoint;
                    let a = this.getAngle({
                        x: this.rotare_first[0] - c[0],
                        y: this.rotare_first[1] - c[1],
                    }, {
                        x: event.coordinate[0] - c[0],
                        y: event.coordinate[1] - c[1],
                    });

                    let i = new Image();
                    i.src = this.temBase64;
                    i.onload = (() => {
                        this.temBase64 = this.mapEditor.rotateBase64Iamge(this.temImg, a * (Math.PI / 180));
                    }).bind(this);
                }
            });
            this.rotate_before = event.coordinate;
        }
    }


    getAngle({
        x: x1,
        y: y1
    }, {
        x: x2,
        y: y2
    }) {
        const dot = x1 * x2 + y1 * y2
        const det = x1 * y2 - y1 * x2
        const angle = Math.atan2(det, dot) / Math.PI * 180
        return Math.round(angle + 360) % 360
    }
}