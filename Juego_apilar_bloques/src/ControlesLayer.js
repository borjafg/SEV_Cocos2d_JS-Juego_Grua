var ControlesLayer = cc.Layer.extend({
    vidas:3,
    etiquetaVidas:null,

    botonDcha:null,
    botonIzda:null,
    botonCoger:null,
    botonSoltar:null,

    bloquesGenerados:null,


    ctor:function () {
        this._super();
        var size = cc.winSize;

        this.inicializarBotonesControl();
        this.etiquetaVidas = new cc.LabelTTF("Vidas: " + this.vidas, "Helvetica", 20);
        this.etiquetaVidas.setPosition(cc.p(size.width - 85, 420));
        this.etiquetaVidas.fillStyle = new cc.Color(255, 255, 255, 255);
        this.addChild(this.etiquetaVidas);

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

                //if (estadoJuego == AGARRAR_BLOQUE) {
                    if (keyCode == 37) {
                        console.log("Ir izquierda ");

                        instancia.grua_moverIzquierda = true;
                        instancia.grua_moverDerecha = false;
                    }

                    if (keyCode == 39) {
                        console.log("Ir derecha ");

                        instancia.grua_moverIzquierda = false;
                        instancia.grua_moverDerecha = true;
                    }
                    cc.director.getActionManager().removeAllActionsFromTarget(this.spriteGrua, true);
                //}
            },

            onKeyReleased: function(keyCode, event){
                if (keyCode == 37 || keyCode == 39) {
                    var instancia = event.getCurrentTarget();

                    instancia.grua_moverIzquierda = false;
                    instancia.grua_moverDerecha = false;
                }
            }
        }, this); // Fin del listener KEYBOARD

        this.scheduleUpdate();

        return true;
    },

    inicializarBotonesControl: function() {
        this.botonIzda = cc.Sprite.create(res.joypad_png);
        this.botonIzda.setPosition(cc.p(cc.winSize.width * 0.7, cc.winSize.height * 0.25));

        this.addChild(this.botonIzda);

        this.botonDcha = cc.Sprite.create(res.joypad_png);
        this.botonDcha.setPosition(cc.p(cc.winSize.width * 0.85, cc.winSize.height * 0.25));

        this.addChild(this.botonDcha);

        this.botonCoger = cc.Sprite.create(res.joypad_png);
        this.botonCoger.setPosition(cc.p(cc.winSize.width * 0.85, cc.winSize.height * 0.45));

        this.addChild(this.botonCoger);

        this.botonSoltar = cc.Sprite.create(res.joypad_png);
        this.botonSoltar.setPosition(cc.p(cc.winSize.width * 0.7, cc.winSize.height * 0.45));

        this.addChild(this.botonSoltar);
    },

    procesarMouseDown: function(event) {
        if (estadoJuego == AGARRAR_BLOQUE || estadoJuego == SOLTAR_BLOQUE) {
            var instanciaCon = event.getCurrentTarget();
            var instancia = instanciaCon.getParent().getChildByTag(idCapaJuego);

            var areaBotonIzda = instanciaCon.botonIzda.getBoundingBox();
            var areaBotonDcha = instanciaCon.botonDcha.getBoundingBox();
            var areaBotonCoger = instanciaCon.botonCoger.getBoundingBox();
            var areaBotonSoltar = instanciaCon.botonSoltar.getBoundingBox();

            if (cc.rectContainsPoint( areaBotonIzda, cc.p(event.getLocationX(), event.getLocationY()) )) {
                instancia.grua_moverDerecha = false;
                instancia.grua_moverIzquierda = true;
            }

            else if (cc.rectContainsPoint( areaBotonDcha, cc.p(event.getLocationX(), event.getLocationY()) )) {
                instancia.grua_moverIzquierda = false;
                instancia.grua_moverDerecha = true;
            }

            if(estadoJuego == AGARRAR_BLOQUE){
                if  (cc.rectContainsPoint( areaBotonCoger, cc.p(event.getLocationX(), event.getLocationY()) ) && instancia.bloqueGenerado!=null)
                {
                    estadoJuego=AGARRANDO_BLOQUE;
                    cc.director.getActionManager().removeAllActionsFromTarget(instancia.spriteGrua, true);
                    instancia.colocarGruaEncimaBloque();
                    setTimeout(() => {instancia.agarrarBloque();}, 1500);

                }
            }
            if(estadoJuego == SOLTAR_BLOQUE){
                if  (cc.rectContainsPoint( areaBotonSoltar, cc.p(event.getLocationX(), event.getLocationY()) ) && instancia.bloqueGrua!=null)
                {
                    estadoJuego=SOLTANDO_BLOQUE;
                    cc.director.getActionManager().removeAllActionsFromTarget(instancia.spriteGrua, true);
                    instancia.arrayBloques.push(instancia.bloqueGrua);
                    var body = instancia.bloqueGrua.getBody();
                    instancia.bloqueGrua=null;
                    instancia.space.addBody(body);
                    setTimeout(() => {instancia.generarBloqueAleatorio(); estadoJuego=AGARRAR_BLOQUE;}, 4000);
                }
            }
        }
    },

    procesarMouseUp: function(event) {
        var instanciaCon = event.getCurrentTarget();
        var instancia = instanciaCon.getParent().getChildByTag(idCapaJuego);

        instancia.grua_moverIzquierda = false;
        instancia.grua_moverDerecha = false;
    },

    restarVida:function(){
         this.vidas--;
         this.etiquetaVidas.setString("Vidas: " + this.vidas);
         return this.vidas;
    },

    update:function (dt) {

    }

});
