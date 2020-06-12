///图层基类
export class Layer {
    constructor(option = {}) {

        ///图层是否显示
        this.isDisplay = option.isDisplay || true;

        ///图层是否可编辑
        this.isEdit = option.isEdit || true;

        ///图层名称
        this.name = option.name || "";

        ///图层内要素
        this.features = new Array();

    }

    isEmpty() {
        if (this.features.length == 0)
            return true;
        return false;
    }

    toGeoJSON() {

        return "";
    }

}