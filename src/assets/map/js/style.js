export class Style {
    static buildStyle() {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(217,237,253,1.0)',
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
    }

    static poiStyle() {
        return new ol.style.Style({
            image: new ol.style.Icon({
                src: '../img/poi.png',
                size:[32,32]
            })
        });
    }

    static pathStyle() {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 10,
                color: 'rgba(155,155,155,1)'
            }),
        })
    }


    static featureToBuildStyle(featrue) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: featrue.get("borderColor"),
                width: featrue.get("width")
            }),
            fill: new ol.style.Fill({
                color: featrue.get("fillColor")
            }),
        });
    }

    static featureToPointStyle(featrue) {
        return new ol.style.Style({
            image: new ol.style.Icon({
                src: featrue.get("img"),
                size: [featrue.get("size"), featrue.get("size")],
            })
        });
    }

    static featureToPathStyle(featrue) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: featrue.get("width"),
                color: featrue.get("color"),
            }),
        });
    }

    static featureToPolygonStyle(featrue) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: featrue.get("borderColor"),
                width: featrue.get("width")
            }),
            fill: new ol.style.Fill({
                color: featrue.get("fillColor")
            }),
            text: new ol.style.Text({
                font: 'normal ' + featrue.get("fontSize") + 'px 微软雅黑',
                text: featrue.get('name'),
                fill: new ol.style.Fill({
                    color: featrue.get("fontFillColor")
                }),
                stroke: new ol.style.Stroke({
                    color: featrue.get("fontBorderColor"),
                    width: 2
                })
            })
        });
    }




    static objToBuildStyle(obj) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: obj["borderColor"],
                width: obj["width"]
            }),
            fill: new ol.style.Fill({
                color: obj["fillColor"]
            }),
        });
    }

    static objToPointStyle(obj) {
        return new ol.style.Style({
            image: new ol.style.Icon({
                src: obj["img"],
                size: [obj["size"], obj["size"]],
            })
        });
    }

    static objToPathStyle(obj) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: obj["width"],
                color: obj["color"],
            }),
        });
    }

    static objToPolygonStyle(obj) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: obj["borderColor"],
                width: obj["width"]
            }),
            fill: new ol.style.Fill({
                color: obj["fillColor"]
            }),
            text: new ol.style.Text({
                font: obj["font"],
                text: obj['name'],
                fill: new ol.style.Fill({
                    color: obj["fontFillColor"]
                }),
                stroke: new ol.style.Stroke({
                    color: obj["fontBorderColor"],
                    width: 2
                })
            })
        });
    }


}