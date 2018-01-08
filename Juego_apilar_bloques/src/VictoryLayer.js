var VictoryLayer = cc.LayerColor.extend({
    ctor:function () {
        this._super();
        this.init();
    },

    init:function () {
        this._super(cc.color(0, 0, 0, 180));

        var winSize = cc.director.getWinSize();

        // cc.MenuItemSprite(imagen, imagenSeleccionado, metodoLlamar, elemento que contiene ese método)
        // Resultado de hacer click --> elemento.metodoLlamar()

        var botonReiniciar = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_siguiente_png),
            new cc.Sprite(res.boton_siguiente_png),
            this.pulsarContinuar,
            this);

        var menu = new cc.Menu(botonReiniciar);
        menu.setPosition(winSize.width / 2, winSize.height / 2);

        this.addChild(menu);
    },

    pulsarContinuar:function (sender) {
        // Volver a ejecutar la escena Prinicpal
        cc.director.runScene(new GameScene());
    }

});
