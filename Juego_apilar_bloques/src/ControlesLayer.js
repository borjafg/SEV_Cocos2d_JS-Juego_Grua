// ======================================
// Capa de la escena
// ======================================

var ControlesLayer = cc.Layer.extend({

    vidasQuedan: 3,

    indicadorVidas: null,
    indicadorNivel: null,
    indicadorBloquesNoColocados: null,

    botonDcha: null,
    botonIzda: null,
    botonAgarrarSoltar: null,


    ctor:function () {
        this._super();
        var size = cc.winSize;

        this.inicializarBotonesControl();

        // --------------------------------------------------------------
        // Añadir indicadores (vidas restantes, bloques sin colacar...)
        // --------------------------------------------------------------

        this.indicadorBloquesNoColocados =
            new cc.LabelTTF("Quedan " + numeroBloquesQuedan + " bloques", "Helvetica", 17);

        this.indicadorBloquesNoColocados.setPosition(cc.p(size.width - 110, size.height - 20));
        this.indicadorBloquesNoColocados.fillStyle = new cc.Color(255, 255, 255, 255);

        this.addChild(this.indicadorBloquesNoColocados);


        this.indicadorNivel = new cc.LabelTTF("Nivel actual: " + nivelActual, "Helvetica", 17);
        this.indicadorNivel.setPosition(cc.p(size.width - 110, size.height - 40));
        this.indicadorNivel.fillStyle = new cc.Color(255, 255, 255, 255);

        this.addChild(this.indicadorNivel);


        this.indicadorVidas = new cc.LabelTTF("Vidas: " + this.vidasQuedan, "Helvetica", 17);
        this.indicadorVidas.setPosition(cc.p(size.width - 110, size.height - 60));
        this.indicadorVidas.fillStyle = new cc.Color(255, 255, 255, 255);

        this.addChild(this.indicadorVidas);


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


        // --------------------------------------------------------------
        // No hace falta que se actualice en cada iteración del juego
        // --------------------------------------------------------------

        //this.scheduleUpdate();

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
                    instanciaCon.indicarBloqueColocado();

                    instancia.arrayBloques.push(instancia.bloqueGenerado);

                    var body = instancia.bloqueGenerado.getBody();
                    instancia.space.addBody(body);

                    if(numeroBloquesQuedan > 0) {
                        setTimeout(() => {
                                instancia.generarBloqueAleatorio();
                                estadoJuego = AGARRAR_BLOQUE;
                            },
                            4000);
                    }

                    else {
                        setTimeout(() => {
                                estadoJuego = TODOS_BLOQUES_COLOCADOS;
                            },
                            5000);
                    }
                }

                else if (cc.rectContainsPoint( areaBotonIzda, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    instancia.grua_moverDerecha = false;
                    instancia.grua_moverIzquierda = true;
                }

                else if (cc.rectContainsPoint( areaBotonDcha, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    instancia.grua_moverIzquierda = false;
                    instancia.grua_moverDerecha = true;
                }
            }   // Fin del else if  estado == SOLTAR_BLOQUE

        }   // Fin del if  estado == AGARRAR_BLOQUE || estaodo == SOLTAR_BLOQUE
    },


    procesarMouseUp: function(event) {
        var instanciaCon = event.getCurrentTarget();
        var instancia = instanciaCon.getParent().getChildByTag(idCapaJuego);

        instancia.grua_moverIzquierda = false;
        instancia.grua_moverDerecha = false;
    },


    restarVida: function() {
        this.vidasQuedan--;
        this.indicadorVidas.setString("Vidas: " + this.vidasQuedan);

        return this.vidasQuedan;
    },


    indicarBloqueColocado: function() {
        numeroBloquesQuedan--;
        this.indicadorBloquesNoColocados.setString("Quedan " + numeroBloquesQuedan + " bloques");
    },


    update: function(dt) {

    }

});
