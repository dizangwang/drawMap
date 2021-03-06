export class ContextMenu {
    constructor(mapedit) {
        this.mapEditor = mapedit;
        this.init()
    }
    init() {

        this.liArray = [];
        ///右键菜单样式
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
         .map-contextmenu{
             position: absolute;
             padding: 12px 0;
             z-index: 9;
           background-color: white;
           width: 120px;
           border-radius: 4px;
         }
         .map-contextmenu ul{
             padding: 6px 2px 0 2px;
             list-style: none;
         }
         .map-contextmenu > ul > li{
             text-align: center;
             padding: 5px 0;
         }
         .map-contextmenu > ul > li:hover{
             background-color: rgba(255, 0, 0, 0.5);
         }
         `;
        document.getElementsByTagName('head')[0].appendChild(style);



        this.contextmenuDiv = document.createElement('div');
        this.contextmenuDiv.id = "map-contextmenu";
        this.contextmenuDiv.className = "map-contextmenu";

        this.contextmenuUl = document.createElement('ul');

        document.getElementsByTagName('body')[0].appendChild(this.contextmenuDiv);
        this.contextmenuDiv.appendChild(this.contextmenuUl);

        this.menu_overlay = new ol.Overlay({
            element: this.contextmenuDiv,
            positioning: 'center-center'
        });
        this.menu_overlay.setMap(this.mapEditor.ol.map);

        ////地图右键事件
        this.mapEditor.ol.map.getViewport().addEventListener("contextmenu", (e) => {
            e.preventDefault();
            if (this.mapEditor.interactionManage.getSelectFeatures().getLength() == 0) {
                if (this.mapEditor.interactionManage.getDrawAction()) {
                    if (this.mapEditor.ol.interactions.draw.type_ == "Polygon" || this.mapEditor.ol.interactions.draw.type_ == "Circle")
                        this.mapEditor.cancelDraw(true);
                    else
                        this.mapEditor.cancelDraw();
                }
                return;
            }

            this.contextmenuUl.childNodes.forEach(c => {
                this.contextmenuUl.removeChild(c);
            });
            let layername = "";

            let l = this.mapEditor.ol.interactions.select.getLayer(this.mapEditor.interactionManage.getSelectFeatures().getArray()[0]);
            if (l == this.mapEditor.ol.layers.buildLayer)
                layername = "build";
            if (l == this.mapEditor.ol.layers.pointLayer)
                layername = "point";
            if (l == this.mapEditor.ol.layers.pathLayer)
                layername = "path";
            if (l == this.mapEditor.ol.layers.polygonLayer)
                layername = "polygon";
            if (l == this.mapEditor.ol.layers.temLayer)
                layername = "image";

            this.liArray.forEach(li => {
                if (li.title.indexOf(layername) != -1)
                    this.contextmenuUl.appendChild(li.data);
            })



            let coordinate = this.mapEditor.ol.map.getEventCoordinate(e);
            this.menu_overlay.setPosition(coordinate);

        });

        this.mapEditor.ol.map.getViewport().addEventListener("click", (e) => {
            e.preventDefault();
            this.menu_overlay.setPosition(undefined);
        });
    }

    ///添加右键菜单事件
    add(name, fun, title) {
        let li = document.createElement('li');
        li.innerHTML = name;
        li.onclick = fun;
        this.liArray.push({
            title: title,
            data: li,
        })
    }


}