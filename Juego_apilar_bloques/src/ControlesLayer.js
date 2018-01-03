var ControlesLayer = cc.Layer.extend({

    vidas:3,
    etiquetaVidas:null,

    botonDcha:null,
    botonIzda:null,
    botonAgarrarSoltar:null,

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
                var instanciaCon = event.getCurrentTarget();
                var instancia = instanciaCon.getParent().getChildByTag(idCapaJuego);

                if (estadoJuego == SOLTAR_BLOQUE) {
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
                }

                //cc.director.getActionManager().removeAllActionsFromTarget(this.spriteGrua, true);
            },

            onKeyReleased: function(keyCode, event) {
                if (keyCode == 37 || keyCode == 39) {
                    var instanciaCon = event.getCurrentTarget();
                    var instancia = instanciaCon.getParent().getChildByTag(idCapaJuego);

                    instancia.grua_moverIzquierda = false;
                    instancia.grua_moverDerecha = false;
                }
            }
        }, this); // Fin del listener KEYBOARD

        this.scheduleUpdate();

        return true;
    },


    inicializarBotonesControl: function() {
        // --------------------------------------
        // Botón mover la grúa a la izquierda
        // --------------------------------------

        this.botonIzda = cc.Sprite.create(res.joypad_left_png);
        this.botonIzda.setPosition(cc.p(cc.winSize.width * 0.7, cc.winSize.height * 0.25));

        this.addChild(this.botonIzda);

        // --------------------------------------
        // Botón mover la grúa a la derecha
        // --------------------------------------

        this.botonDcha = cc.Sprite.create(res.joypad_right_png);
        this.botonDcha.setPosition(cc.p(cc.winSize.width * 0.85, cc.winSize.height * 0.25));

        this.addChild(this.botonDcha);

        // --------------------------------
        // Botón agarrar y soltar bloque
        // --------------------------------

        this.botonAgarrarSoltar = cc.Sprite.create(res.joypad_drag_drop_png);
        this.botonAgarrarSoltar.setPosition(cc.p(cc.winSize.width * 0.85, cc.winSize.height * 0.5));

        this.addChild(this.botonAgarrarSoltar);
    },


    procesarMouseDown: function(event) {
        if (estadoJuego == AGARRAR_BLOQUE || estadoJuego == SOLTAR_BLOQUE) {
            var instanciaCon = event.getCurrentTarget();
            var instancia = instanciaCon.getParent().getChildByTag(idCapaJuego);

            var areaBotonIzda = instanciaCon.botonIzda.getBoundingBox();
            var areaBotonDcha = instanciaCon.botonDcha.getBoundingBox();
            var areaBotonAgarrarSoltar = instanciaCon.botonAgarrarSoltar.getBoundingBox();

            if (estadoJuego == AGARRAR_BLOQUE) {
                if (cc.rectContainsPoint( areaBotonAgarrarSoltar, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    estadoJuego = AGARRANDO_BLOQUE;
                }
            }

            else if (estadoJuego == SOLTAR_BLOQUE) {
                if (cc.rectContainsPoint( areaBotonAgarrarSoltar, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    estadoJuego = SOLTANDO_BLOQUE;

                    instancia.arrayBloques.push(instancia.bloqueGenerado);

                    var body = instancia.bloqueGenerado.getBody();
                    instancia.space.addBody(body);

                    setTimeout(() => {
                            instancia.generarBloqueAleatorio();
                            estadoJuego = AGARRAR_BLOQUE;
                        },
                        4000);
                }

                else if (cc.rectContainsPoint( areaBotonIzda, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    instancia.grua_moverDerecha = false;
                    instancia.grua_moverIzquierda = true;
                }

                else if (cc.rectContainsPoint( areaBotonDcha, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    instancia.grua_moverIzquierda = false;
                    instancia.grua_moverDerecha = true;
                }
            }   // Fin del estado == SOLTAR_BLOQUE

        }   // Fin del if  estado == AGARRAR_BLOQUE || estaodo == SOLTAR_BLOQUE
    },


    procesarMouseUp: function(event) {
        var instanciaCon = event.getCurrentTarget();
        var instancia = instanciaCon.getParent().getChildByTag(idCapaJuego);

        instancia.grua_moverIzquierda = false;
        instancia.grua_moverDerecha = false;
    },


    restarVida: function() {
        this.vidas--;
        this.etiquetaVidas.setString("Vidas: " + this.vidas);

        return this.vidas;
    },


    update: function(dt) {

    }

});

