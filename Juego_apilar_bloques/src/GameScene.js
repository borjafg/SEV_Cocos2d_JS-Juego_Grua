// ======================================
// Capa de la escena
// ======================================

var GameLayer = cc.Layer.extend({

    spriteGrua:null,

    botonDcha:null,
    botonIzda:null,

    moveLeft:false,
    moveRight:false,

    ctor:function () {
        this._super();
        var size = cc.winSize;

        // -----------------------
        // Inicializar Space
        // -----------------------

        this.space = new cp.Space();
        this.space.gravity =  cp.v(0,0);

        // --------------------------
        // Cachear los sprites
        // --------------------------

        cc.spriteFrameCache.addSpriteFrames(res.barra_plist);

        // --------------------
        // Crear el fondo
        // --------------------

        var fondoGame= new cc.Sprite(res.fondo_game_png);

        // Asigno posición central
        fondoGame.setPosition(cc.p(size.width / 2, size.height / 2));
        fondoGame.setScale(size.height / fondoGame.height);

        // Añado fondo a la escena
        this.addChild(fondoGame);

        // ----------------------------------
        // Inicializar elementos del juego
        // ----------------------------------

        this.inicializarPlataformas();
        this.inicializarGrua();
        this.inicializarBotonesControl();

        // --------------------------
        // Añadir listeners
        // --------------------------

        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown,
            onMouseUp: this.procesarMouseUp
        }, this)


        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(keyCode, event) {
                var actionMoverGruaX = null;
                var instancia = event.getCurrentTarget();

                if (keyCode == 37){
                    console.log("Ir izquierda ");
                    actionMoverGruaX =
                        cc.MoveTo.create(Math.abs(instancia.spriteGrua.x - 0) / 500,
                        cc.p(0, cc.winSize.height * 0.9));
                }

                if (keyCode == 39){
                    console.log("Ir derecha ");
                    actionMoverGruaX =
                        cc.MoveTo.create(Math.abs(instancia.spriteGrua.x - cc.winSize.width) / 500,
                        cc.p(cc.winSize.width,cc.winSize.height * 0.9));
                }

                cc.director.getActionManager().removeAllActionsFromTarget(instancia.spriteGrua, true);

                if (actionMoverGruaX != null)
                    instancia.spriteGrua.runAction(actionMoverGruaX);
           },

           onKeyReleased: function(keyCode, event){
               if(keyCode == 37 || keyCode == 39){
                     var instancia = event.getCurrentTarget();
                     cc.director.getActionManager().
                       removeAllActionsFromTarget(instancia.spriteGrua, true);
               }
           }
        }, this); // Fin del listener KEYBOARD

        // ----------------------------
        // Actualizar el juego
        // ----------------------------

        this.scheduleUpdate();

        return true;
    },


    inicializarPlataformas: function () {
        var spritePlataforma = new cc.PhysicsSprite("#barra_3.png");

        var body = new cp.StaticBody();
        body.p = cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.05);
        spritePlataforma.setBody(body);

        var shape = new cp.BoxShape(body, spritePlataforma.width, spritePlataforma.height);

        // addStaticShape en lugar de addShape
        shape.setFriction(1);
        this.space.addStaticShape(shape);

        this.addChild(spritePlataforma);
    },


    inicializarGrua: function () {
        this.spriteGrua = cc.Sprite.create(res.grua_png);

        this.spriteGrua.setScale(0.2);
        this.spriteGrua.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.9));

        this.addChild(this.spriteGrua);
    },


    inicializarBotonesControl: function () {
        //Botones para movimiento
        /*
        var botonIzda = new cc.MenuItemSprite(
        new cc.Sprite(res.joypad_png),
        new cc.Sprite(res.joypad_png),
        this.pulsarBotonIzda, this);

        var botonDcha = new cc.MenuItemSprite(
        new cc.Sprite(res.joypad_png),
        new cc.Sprite(res.joypad_png),
        this.pulsarBotonDcha, this);

        var menu = new cc.Menu(botonIzda);
        menu.setPosition(cc.p(cc.winSize.width *0.7, cc.winSize.height * 0.3));
        this.addChild(menu);

        var menu = new cc.Menu(botonDcha);
        menu.setPosition(cc.p(cc.winSize.width *0.85, cc.winSize.height * 0.3));
        this.addChild(menu);*/

        this.botonIzda = cc.Sprite.create(res.joypad_png);
        this.botonIzda.setPosition(cc.p(cc.winSize.width * 0.7, cc.winSize.height * 0.25));

        this.addChild(this.botonIzda);

        this.botonDcha = cc.Sprite.create(res.joypad_png);
        this.botonDcha.setPosition(cc.p(cc.winSize.width * 0.85, cc.winSize.height * 0.25));

        this.addChild(this.botonDcha);
    },


    procesarMouseDown: function(event) {
        var instancia = event.getCurrentTarget();
        cc.director.getActionManager().removeAllActionsFromTarget(this.spriteGrua, true);

        var areaBotonIzda = instancia.botonIzda.getBoundingBox();

        if (cc.rectContainsPoint( areaBotonIzda, cc.p(event.getLocationX(), event.getLocationY()) )) {
            instancia.moveRight = false;
            instancia.moveLeft = true;
        }

        var areaBotonDcha = instancia.botonDcha.getBoundingBox();

        if (cc.rectContainsPoint( areaBotonDcha, cc.p(event.getLocationX(), event.getLocationY()) )) {
            instancia.moveLeft=false;
            instancia.moveRight=true;
        }
    },


    procesarMouseUp: function(event) {
        var instancia = event.getCurrentTarget();

        instancia.moveLeft = false;
        instancia.moveRight = false;
    },


    update: function (dt) {
        if (this.moveLeft) {
            var actionMoverGruaX = cc.MoveTo.create(Math.abs(this.spriteGrua.x - 0) / 500,
                cc.p(Math.max(this.spriteGrua.x - 2, 0), cc.winSize.height * 0.9));

            this.spriteGrua.runAction(actionMoverGruaX);
        }

        if (this.moveRight) {
            var actionMoverGruaX = cc.MoveTo.create(Math.abs(this.spriteGrua.x - cc.winSize.width) / 500,
                    cc.p(Math.min(this.spriteGrua.x + 2, cc.winSize.width), cc.winSize.height * 0.9));

            this.spriteGrua.runAction(actionMoverGruaX);
        }
    }

});


// ==========================
// Escena del juego
// ==========================

var GameScene = cc.Scene.extend({
    onEnter: function() {
        this._super();
        cc.director.resume();

        var layer = new GameLayer();
        this.addChild(layer);
        //var controlesLayer = new ControlesLayer();
        //this.addChild(controlesLayer, 0, idCapaControles);
    }
});
