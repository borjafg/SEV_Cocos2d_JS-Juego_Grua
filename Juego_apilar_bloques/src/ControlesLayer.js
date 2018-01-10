// ======================================
// Capa de la escena
// ======================================

var ControlesLayer = cc.Layer.extend({

    tiempoRestante: null,

    indicadorVidas: null,
    indicadorNivel: null,
    indicadorFigurasNoColocadas: null,
    indicadorTiempo: null,
    indicadorPowerUp: null,

    botonDcha: null,
    botonIzda: null,
    botonAgarrarSoltar: null,

    soltarFigura: null,
    generarFiguraTiempoInicial: null,


    ctor:function () {
        this._super();
        var size = cc.winSize;

        // ------------------------------------------------
        // Inicializar elementos del nivel
        // ------------------------------------------------

        this.inicializarBotonesControl();

        this.soltarFigura = false;

        // ----------------------------------------------------------------
        // Añadir indicadores (vidas restantes, figuras sin colacar...)
        // ----------------------------------------------------------------

        var posX_indicadores = size.width - 110;


        this.indicadorPowerUp = new cc.LabelTTF("PowerUp: No activo", "Helvetica", 17);
        this.indicadorPowerUp.setPosition(cc.p(posX_indicadores, size.height - 20));
        this.indicadorPowerUp.fillStyle = new cc.Color(255, 255, 255, 255);

        this.addChild(this.indicadorPowerUp);


        this.indicadorFigurasNoColocadas = new cc.LabelTTF("Coloca " + numeroFigurasQuedan + " figuras", "Helvetica", 17);

        this.indicadorFigurasNoColocadas.setPosition(cc.p(posX_indicadores, size.height - 40));
        this.indicadorFigurasNoColocadas.fillStyle = new cc.Color(255, 255, 255, 255);

        this.addChild(this.indicadorFigurasNoColocadas);


        this.indicadorNivel = new cc.LabelTTF("Nivel actual: " + nivelActual, "Helvetica", 17);
        this.indicadorNivel.setPosition(cc.p(posX_indicadores, size.height - 60));
        this.indicadorNivel.fillStyle = new cc.Color(255, 255, 255, 255);

        this.addChild(this.indicadorNivel);


        this.indicadorVidas = new cc.LabelTTF("Vidas: " + vidas, "Helvetica", 17);
        this.indicadorVidas.setPosition(cc.p(posX_indicadores, size.height - 80));
        this.indicadorVidas.fillStyle = new cc.Color(255, 255, 255, 255);

        this.addChild(this.indicadorVidas);


        this.indicadorTiempo = new cc.LabelTTF("", "Helvetica", 17);
        this.indicadorTiempo.setPosition(cc.p(posX_indicadores, size.height - 100));
        this.indicadorTiempo.fillStyle = new cc.Color(255, 255, 255, 255);

        this.addChild(this.indicadorTiempo);


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

                if (estadoJuego == AGARRAR_FIGURA) {
                    if (keyCode == 32) { // Espacio
                        estadoJuego = AGARRANDO_FIGURA_MOVER_GRUA_A_FIGURA;
                    }
                }

                else if (estadoJuego == SOLTAR_FIGURA) {
                    if (keyCode == 32) { // Espacio
                        instanciaCon.soltarFigura = true;
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
        if (estadoJuego == AGARRAR_FIGURA || estadoJuego == SOLTAR_FIGURA) {
            var instanciaCon = event.getCurrentTarget();
            var instancia = instanciaCon.getParent().getChildByTag(idCapaJuego);

            var areaBotonIzda = instanciaCon.botonIzda.getBoundingBox();
            var areaBotonDcha = instanciaCon.botonDcha.getBoundingBox();
            var areaBotonAgarrarSoltar = instanciaCon.botonAgarrarSoltar.getBoundingBox();

            if (estadoJuego == AGARRAR_FIGURA) {
                if (cc.rectContainsPoint( areaBotonAgarrarSoltar, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    estadoJuego = AGARRANDO_FIGURA_MOVER_GRUA_A_FIGURA;
                }
            }

            else if (estadoJuego == SOLTAR_FIGURA) {
                if (cc.rectContainsPoint( areaBotonAgarrarSoltar, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    instanciaCon.soltarFigura = true;
                }

                else if (cc.rectContainsPoint( areaBotonIzda, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    instancia.grua_moverDerecha = false;
                    instancia.grua_moverIzquierda = true;
                }

                else if (cc.rectContainsPoint( areaBotonDcha, cc.p(event.getLocationX(), event.getLocationY()) )) {
                    instancia.grua_moverIzquierda = false;
                    instancia.grua_moverDerecha = true;
                }
            }   // Fin del else if  estado == SOLTAR_FIGURA
        }   // Fin del if  estado == AGARRAR_FIGURA || estaodo == SOLTAR_FIGURA

    },


    procesarMouseUp: function(event) {
        var instanciaCon = event.getCurrentTarget();
        var instancia = instanciaCon.getParent().getChildByTag(idCapaJuego);

        instancia.grua_moverIzquierda = false;
        instancia.grua_moverDerecha = false;
    },


    inicializarBotonesControl: function() {
        // --------------------------------------
        // Botón mover la grúa a la derecha
        // --------------------------------------

        this.botonDcha = cc.Sprite.create(res.joypad_right_png);
        this.botonDcha.setPosition(cc.p(cc.winSize.width - this.botonDcha.width / 2 - 15, this.botonDcha.height / 2 + 25));

        this.addChild(this.botonDcha);

        // --------------------------------------
        // Botón mover la grúa a la izquierda
        // --------------------------------------

        this.botonIzda = cc.Sprite.create(res.joypad_left_png);

        var posX_botonIzq = this.botonDcha.x - (this.botonDcha.width / 2) - (this.botonIzda.width / 2) - 10;
        var posY_botonIzq = this.botonDcha.y;

        this.botonIzda.setPosition(cc.p(posX_botonIzq, posY_botonIzq));

        this.addChild(this.botonIzda);

        // --------------------------------
        // Botón agarrar y soltar figura
        // --------------------------------

        this.botonAgarrarSoltar = cc.Sprite.create(res.joypad_drag_drop_png);

        var posX_btnAgarrar = this.botonDcha.x;
        var posY_btnAgarrar = this.botonDcha.y + (this.botonDcha.width / 2) + (this.botonAgarrarSoltar.width / 2) + 10;

        this.botonAgarrarSoltar.setPosition(cc.p(posX_btnAgarrar, posY_btnAgarrar));

        this.addChild(this.botonAgarrarSoltar);
    },


    restarVida: function() {
        vidas--;
        this.indicadorVidas.setString("Vidas: " + vidas);

        return vidas;
    },


    indicarFiguraColocada: function() {
        numeroFigurasQuedan--;
        this.indicadorFigurasNoColocadas.setString("Coloca " + numeroFigurasQuedan + " figuras");
    },


    update: function(dt) {
        if (this.soltarFigura) {
            instancia = this.getParent().getChildByTag(idCapaJuego);

            estadoJuego = SOLTANDO_FIGURA;

            this.indicadorTiempo.setString("");

            this.soltarFigura = false;

            this.indicarFiguraColocada();
            instancia.arrayFiguras.push(instancia.figuraGenerada);

            var body = instancia.figuraGenerada.getBody();
            instancia.space.addBody(body);

            this.generarFiguraTiempoInicial = new Date().getTime();
        }  // Fin del if  this.soltarFigura


        // Esperamos para generar otra figura después de soltar el anterior
        if (estadoJuego == SOLTANDO_FIGURA) {
            var tiempoActual = new Date().getTime();

            if (tiempoActual > (this.generarFiguraTiempoInicial + tiempoGeneracionFiguras)) {
                if (numeroFigurasQuedan > 0) {
                    instancia.generarFiguraAleatoria();
                    estadoJuego = AGARRAR_FIGURA;
                }

                else {
                    estadoJuego = TODAS_FIGURAS_COLOCADAS;
                }
            }
        }   // Fin del if  estadoJuego == SOLTANDO_FIGURA

        if (estadoJuego == SOLTAR_FIGURA) {
            instancia = this.getParent().getChildByTag(idCapaJuego);

            var tiempoActual = new Date().getTime();
            var tiempo = tiempoLimiteColocacion - (tiempoActual - instancia.tiempoInicialFigura);

            if (tiempo > 0) {
                this.tiempoRestante = tiempo;
            }

            this.indicadorTiempo.setString("Tiempo restante: " + Math.round(this.tiempoRestante / 1000));
        }
    }   // Fin del método update

});
