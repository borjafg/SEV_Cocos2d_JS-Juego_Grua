// ======================================
// Capa de la escena
// ======================================

var ControlesLayer = cc.Layer.extend({

    vidasQuedan: null,

    tiempoRestante: null,

    indicadorVidas: null,
    indicadorNivel: null,
    indicadorBloquesNoColocados: null,
    indicadorTiempo: null,

    botonDcha: null,
    botonIzda: null,
    botonAgarrarSoltar: null,

    soltarBloque: null,
    generarBloqueTiempoInicial: null,


    ctor:function () {
        this._super();
        var size = cc.winSize;

        // ------------------------------------------------
        // Inicializar elementos del nivel
        // ------------------------------------------------

        this.inicializarBotonesControl();

        this.soltarBloque = false;
        this.vidasQuedan = 1;

        // ----------------------------------------------------------------
        // Añadir indicadores (vidas restantes, bloques sin colacar...)
        // ----------------------------------------------------------------

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

        this.indicadorTiempo = new cc.LabelTTF("", "Helvetica", 17);
        this.indicadorTiempo.setPosition(cc.p(size.width - 110, size.height - 80));
        this.indicadorTiempo.fillStyle = new cc.Color(255, 255, 255, 255);




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

                if (estadoJuego == AGARRAR_BLOQUE) {
                    if (keyCode == 32) { // Espacio
                        estadoJuego = AGARRANDO_BLOQUE_MOVER_GRUA_BLOQUE;
                    }
                }

                else if (estadoJuego == SOLTAR_BLOQUE) {
                    if (keyCode == 32) { // Espacio
                        instanciaCon.soltarBloque = true;
                    }

                    else if (keyCode == 37) { // Flecha izquierda
                        console.log("Ir izquierda ");

                        instancia.grua_moverIzquierda = true;
                        instancia.grua_moverDerecha = false;
                    }

                    else if (keyCode == 39) { // Flecha derecha
                        console.log("Ir derecha ");

                        instancia.grua_moverIzquierda = false;
                        instancia.grua_moverDerecha = true;
                    }
                }
            },   // Fin onKeyPressed

            onKeyReleased: function(keyCode, event) {
                if (keyCode == 37 || keyCode == 39) {
                    var instanciaCon = event.getCurrentTarget();
                    var instancia = instanciaCon.getParent().getChildByTag(idCapaJuego);

                    instancia.grua_moverIzquierda = false;
                    instancia.grua_moverDerecha = false;
                }
            }
        }, this); // Fin del listener KEYBOARD


        // --------------------------------------------
        // Se actualiza el juego en cada iteración
        // --------------------------------------------

        this.scheduleUpdate();

        return true;
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
                    estadoJuego = AGARRANDO_BLOQUE_MOVER_GRUA_BLOQUE;
                }
            }

            else if (estadoJuego == SOLTAR_BLOQUE) {
                if (cc.rectContainsPoint( areaBotonAgarrarSoltar, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    instanciaCon.soltarBloque = true;
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


    restarVida: function() {
        this.vidasQuedan--;
        this.indicadorVidas.setString("Vidas: " + this.vidasQuedan);

        return this.vidasQuedan;
    },

    actualizarTiempoRestante: function(){

    },


    indicarBloqueColocado: function() {
        numeroBloquesQuedan--;
        this.indicadorBloquesNoColocados.setString("Quedan " + numeroBloquesQuedan + " bloques");
    },


    update: function(dt) {
        if (this.soltarBloque) {
            instancia = this.getParent().getChildByTag(idCapaJuego);

            estadoJuego = SOLTANDO_BLOQUE;

            this.removeChild(this.indicadorTiempo);

            this.soltarBloque = false;

            this.indicarBloqueColocado();
            instancia.arrayBloques.push(instancia.bloqueGenerado);

            var body = instancia.bloqueGenerado.getBody();
            instancia.space.addBody(body);

            this.generarBloqueTiempoInicial = new Date().getTime();
        }   // Fin del if  this.soltarBloque


        // Esperamos para generar otro bloque después de soltar el anterior
        if (estadoJuego == SOLTANDO_BLOQUE) {
            var tiempoActual = new Date().getTime();

            if (tiempoActual > (this.generarBloqueTiempoInicial + tiempoGeneracionBloques)) {
                if (numeroBloquesQuedan > 0) {
                    instancia.generarBloqueAleatorio();
                    estadoJuego = AGARRAR_BLOQUE;
                }

                else {
                    estadoJuego = TODOS_BLOQUES_COLOCADOS;
                }
            }
        }   // Fin del if  estadoJuego == SOLTANDO_BLOQUE

        if (estadoJuego == SOLTAR_BLOQUE) {
            instancia = this.getParent().getChildByTag(idCapaJuego);

            var tiempoActual = new Date().getTime();
            var tiempo = instancia.tiempoLimiteColocacion - (tiempoActual - instancia.tiempoInicialBloque);

            if (tiempo > 0) {
                this.tiempoRestante=tiempo;
            }

            this.indicadorTiempo.setString("Tiempo restante: " + Math.round(this.tiempoRestante/1000));
        }
    }

});
