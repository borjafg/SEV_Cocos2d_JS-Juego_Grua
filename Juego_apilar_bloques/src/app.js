

var MenuLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        var size = cc.winSize;

        // Fondo
        var fondoMenu= new cc.Sprite(res.fondo_menu_png);

        // Asigno posición central
        fondoMenu.setPosition(cc.p(size.width / 2, size.height / 2));

        // Lo escalo porque es más pequeño que la pantalla
        fondoMenu.setScale(size.height / fondoMenu.height);

        // Añado fondo a la escena
        this.addChild(fondoMenu);

        //MenuItemSprite para el botón
        var botonJugar = new cc.MenuItemSprite(
        new cc.Sprite(res.boton_jugar_png),
        new cc.Sprite(res.boton_jugar_png),
        this.pulsarBotonJugar, this);

        var menu = new cc.Menu(botonJugar);

        // Asigno posición central
        menu.setPosition(cc.p(size.width / 2, size.height * 0.25));

        // Añado el menú a la escena
        this.addChild(menu);

        return true;

    },


    pulsarBotonJugar : function(){
        cc.director.runScene(new GameScene());
    }

});



var MenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MenuLayer();
        this.addChild(layer);
    }
});
