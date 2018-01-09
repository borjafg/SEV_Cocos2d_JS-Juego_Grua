// ----------------------
// Estado del juego
// ----------------------

var AGARRAR_BLOQUE = 0;
var AGARRANDO_BLOQUE_MOVER_GRUA_BLOQUE = 1;
var AGARRANDO_BLOQUE_SUBIR_BLOQUE = 2;
var AGARRANDO_BLOQUE_MOVER_GRUA_CENTRO = 3;

var SOLTAR_BLOQUE = 4;
var SOLTANDO_BLOQUE = 5;

var TODOS_BLOQUES_COLOCADOS = 6;

var estadoJuego = AGARRAR_BLOQUE;


// ----------------------
// Tipo de colisisones
// ----------------------

var tipoMuro = 2;
var tipoFigura = 3;
var tipoLineaPowerUp = 4;


// -----------------------------------------------------
// Número de bloques que hay que generar en un nivel
// -----------------------------------------------------

var bloquesGenerar_inicial = 10;
var bloquesGenerar_maximo = 15;

var bloquesGenerar_actual = bloquesGenerar_inicial;
var bloquesGenerar_incrementarUnidades = 5;


var numeroBloquesQuedan = bloquesGenerar_actual;
var tiempoGeneracionBloques = 4000; // Generar un nuevo bloque cada X milisegundos


// ----------------------------------------------------------------
// Tipo de bloques que se pueden generar (Hay 5 tipos de bloques)
// ----------------------------------------------------------------

var baseGenerarBloques_inicial = 100; // 60
var baseGenerarBloques_maximo = 100;

var baseGenerarBloques_actual = baseGenerarBloques_inicial;

// Cada 20 unidades puede generarse un nuevo tipo de figura
// Este incremento se aplicará en cada cambio de nivel
var baseGenerarBloques_incrementarUnidades = 20;


// ----------------------------------------------------------------
// Tamaño de la plataforma en la que hay que colocar los bloques
// ----------------------------------------------------------------

var tamanioPlataforma_minimo = 1;
var tamanioPlataforma_maximo = 3;

// Al princio la plataforma será lo más grande posible
var tamanioPlataforma = tamanioPlataforma_maximo;

// La plataforma se reducirá cada X niveles
var tamanioPlataforma_decrementarCadaNiveles = 1;


// -------------------
// Nivel actual
// -------------------

var nivelActual = 1;
var nivelMaximo = 3;


// -------------------
// Capas utilizadas
// -------------------

var idCapaJuego = 1;
var idCapaControles = 2;


// ======================================
// Capa de la escena
// ======================================

var GameLayer = cc.Layer.extend({

    space: null,

    spritePlataformaGeneracion: null,

    spriteGrua: null,
    spriteGrua_velX: null,

    tiempoInicialBloque: null,
    tiempoLimiteColocacion: null,

    arrayBloques: [],
    formasEliminar: [],

    bloqueGenerado: null,
    bloqueGenerado_velSubida: null,

    grua_moverIzquierda: null,
    grua_moverDerecha: null,

    lineaPowerUp: null,
    powerUpActivo: null,   // Tiene el PowerUp ahora
    powerUpObtenido: null, // Tuvo el PowerUp en algún momento


    ctor:function () {
        this._super();
        var size = cc.winSize;

        // -----------------------
        // Inicializar Space
        // -----------------------

        this.space = new cp.Space();
        this.space.gravity = cp.v(0,-350);

        // ---------------
        // Depuración
        // ---------------

        this.depuracion = new cc.PhysicsDebugNode(this.space);
        this.addChild(this.depuracion, 10);

        // --------------------
        // Crear el fondo
        // --------------------

        var fondoGame = new cc.Sprite(res.fondo_game_png);

        // Asigno posición central
        fondoGame.setPosition(cc.p(size.width / 2, size.height / 2));
        fondoGame.setScale(size.height / fondoGame.height);

        // Añado fondo a la escena
        this.addChild(fondoGame);

        // ------------------------------
        // Crear los muros
        // ------------------------------

        var muroIzquierda = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, 0), // Punto de Inicio
            cp.v(0, size.height), // Punto final
            10); // Ancho del muro

        this.space.addStaticShape(muroIzquierda);


        var muroDerecha = new cp.SegmentShape(this.space.staticBody,
            cp.v(size.width, 0),// Punto de Inicio
            cp.v(size.width, size.height),// Punto final
            10);// Ancho del muro

        this.space.addStaticShape(muroDerecha);


        var muroAbajo = new cp.SegmentShape(this.space.staticBody,
            cp.v(0, 0),// Punto de Inicio
            cp.v(size.width, 0),// Punto final
            10);// Ancho del muro

        muroAbajo.setFriction(1);
        muroAbajo.setCollisionType(tipoMuro);

        this.space.addStaticShape(muroAbajo);

        // ----------------------------------
        // Inicializar elementos del juego
        // ----------------------------------

        numeroBloquesQuedan = bloquesGenerar_actual;

        this.powerUpActivo = false;
        this.powerUpObtenido = false;

        this.spriteGrua_velX = 3;
        this.bloqueGenerado_velSubida = 2;

        this.tiempoLimiteColocacion = 7000;

        this.grua_moverIzquierda = false;
        this.grua_moverDerecha = false;

        this.inicializarGrua();
        this.inicializarPlataformas();
        this.generarBloqueAleatorio();

        estadoJuego = AGARRAR_BLOQUE;

        // --------------------------------------------
        // Dibujar la línea que indica a la altura
        // la que se activa el PowerUp
        // --------------------------------------------

        this.dibujarLineaPowerUp();

        // ------------------------------
        // Añadir eventos
        // ------------------------------

        cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: this.procesarMouseDown
            }, this)

        // ------------------------------------------
        // Añadir la gestión de las colisiones
        // ------------------------------------------

        // muro y figura
        this.space.addCollisionHandler(tipoMuro, tipoFigura, null, null, this.collisionFiguraConMuro.bind(this), null);

        // línea y powerUp
        this.space.addCollisionHandler(tipoLineaPowerUp, tipoFigura, null, this.collisionFiguraConLineaPowerUp.bind(this), null, null);

        // ----------------------------
        // Actualizar el juego
        // ----------------------------

        this.scheduleUpdate();

        return true;
    },


    // -------------------------
    // Eventos
    // -------------------------

    procesarMouseDown: function(event) {
        var instancia = event.getCurrentTarget();

        if (instancia.powerUpActivo) {
            var index;
            var areaBloque;
            var figura;

            for (index = 0; index < instancia.arrayBloques.length; index++) {
                figura = instancia.arrayBloques[index]; //.body.shapeList[0];

                if (figura.containsPoint(event.getLocationX(), event.getLocationY())) {
                    instancia.powerUpActivo = false;
                    var controles = instancia.getParent().getChildByTag(idCapaControles);
                    controles.removeChild(controles.indicadorPowerUp);
                    instancia.formasEliminar.push(figura.body.shapeList[0]);
                    console.log("Eliminado un bloque --> " + figura.tipoFigura);
                }
            }
        }
    },


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Métodos para inicializar el juego
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    dibujarLineaPowerUp: function() {
        this.lineaPowerUp = new cc.DrawNode();

        var size = cc.winSize;

        var puntoInicial = cc.p(0, size.height * 0.4);
        var puntoFinal = cc.p(size.width, size.height * 0.4);
        var grosor = 3;
        var colorLinea = new cc.Color(9, 60, 68, 100);

        this.lineaPowerUp.drawSegment(puntoInicial, puntoFinal, grosor, colorLinea);

        this.addChild(this.lineaPowerUp);

        // ------------------------------------------------------------------------------
        // Como el DrawNode no tiene físicas, colocamos encima de él una forma estática
        // ------------------------------------------------------------------------------

        var lineaPowerUpShape = new cp.SegmentShape(this.space.staticBody,
            cp.v(puntoInicial.x, puntoInicial.y), // Punto de Inicio
            cp.v(puntoFinal.x, puntoFinal.y), // Punto final
            3); // Ancho del muro

        lineaPowerUpShape.setCollisionType(tipoLineaPowerUp);
        lineaPowerUpShape.setSensor(true);

        this.space.addStaticShape(lineaPowerUpShape);
    },


    inicializarGrua: function() {
        this.spriteGrua = cc.Sprite.create(res.grua_png);

        this.spriteGrua.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height - this.spriteGrua.height / 2));

        this.addChild(this.spriteGrua);
    },


    inicializarPlataformas: function() {
        // ----------------------------------------
        // Plataforma de colocación de bloques
        // ----------------------------------------

        var spritePlataforma = new cc.PhysicsSprite(res_aux.barra_aux_1 + tamanioPlataforma + res_aux.barra_aux_2);

        var body = new cp.StaticBody();

        body.p = new cp.Vect(cc.winSize.width * 0.5, spritePlataforma.height / 2 + 10);
        spritePlataforma.setBody(body);

        var shape = new cp.BoxShape(body, spritePlataforma.width, spritePlataforma.height);
        shape.setFriction(1);

        this.space.addStaticShape(shape);

        this.addChild(spritePlataforma);


        // ----------------------------------------
        // Plataforma de generación de bloques
        // ----------------------------------------

        var spritePlataformaGen = new cc.PhysicsSprite(res.barra1_png);

        var body2 = new cp.StaticBody();

        body2.p = new cp.Vect(spritePlataformaGen.width / 2 + 20, this.spriteGrua.y - this.spriteGrua.height / 2 - 60);
        spritePlataformaGen.setBody(body2);

        var shape2 = new cp.BoxShape(body2, spritePlataformaGen.width, spritePlataformaGen.height);
        shape2.setFriction(1);
        this.space.addStaticShape(shape2);

        this.addChild(spritePlataformaGen);

        this.spritePlataformaGeneracion = spritePlataformaGen;
    },


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Otros métodos
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    cambiarTamanioPlataforma: function(nuevoTamanio) {
        if(nuevoTamanio >= tamanioPlataforma_minimo && nuevoTamanio <= tamanioPlataforma_maximo) {
            tamanioPlataforma = this.nuevoTamanio;
        }
    },


    generarBloqueAleatorio: function() {
        var valorAleatorio = Math.floor(Math.random() * (baseGenerarBloques_actual - 1)) + 1;

        if (valorAleatorio <= 20) { // Generar un cuadrado
            this.bloqueGenerado = generarFigura(FIGURA_CUADRADO,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 40) { // Generar un rectangulo en posición horizontal
            this.bloqueGenerado = generarFigura(FIGURA_RECTANGULO_HORIZONTAL,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 60) { // Generar un círculo
            this.bloqueGenerado = generarFigura(FIGURA_CIRCULO,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 80) { // Generar un rectángulo en posición vertical
            this.bloqueGenerado = generarFigura(FIGURA_RECTANGULO_VERTICAL,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 100) { // Generar un triángulo
            this.bloqueGenerado = generarFigura(FIGURA_TRIANGULO,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else { // En cualquier otro caso: generar un cuadrado
            this.bloqueGenerado = generarFigura(FIGURA_CUADRADO,
                this.spritePlataformaGeneracion, this.space, this);
        }
    },


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Colisiones entre elementos del juego
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    collisionFiguraConMuro: function(arbiter, space) {
        var controles = this.getParent().getChildByTag(idCapaControles);

        if(controles.restarVida() == 0) {
            this.accionDerrotaJuego();
        }

        var shapes = arbiter.getShapes();

        // shapes[0] es el muro
        this.formasEliminar.push(shapes[1]);
    },


    collisionFiguraConLineaPowerUp: function(arbiter, space) {
        // Si ya se colocó la figura
        if (estadoJuego == AGARRAR_BLOQUE) {
            if (!this.powerUpObtenido) { // Si no se consiguió antes un PowerUp
                this.powerUpActivo = true;
                this.powerUpObtenido = true;
                var controles = this.getParent().getChildByTag(idCapaControles);
                controles.addChild(controles.indicadorPowerUp);
                console.log("Entró en el powerUp");
            }
        }
    },


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~------------------
    // Mover la grua, el bloque generado y la plataforma móvil
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~------------------

    moverGrua: function(desplX) {
        this.spriteGrua.setPosition(cc.p(this.spriteGrua.x + desplX, this.spriteGrua.y));
    },

    moverBloqueGenerado: function(desplX) {
        this.bloqueGenerado.setPosition(cc.p(this.bloqueGenerado.x + desplX, this.bloqueGenerado.y));
    },

    subirBloqueGenerado: function(desplY) {
        this.bloqueGenerado.setPosition(cc.p(this.bloqueGenerado.x, this.bloqueGenerado.y + desplY));
    },

    moverPlataformaMovil: function(desplX) {
        this.spritePlataformaMovil.body.setPos(cc.p(this.spritePlataformaMovil.x + desplX, this.spritePlataformaMovil.y));
    },


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Acciones al ganar y perder
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    accionVictoriaJuego: function() {
        cc.director.pause();

        // Si quedan más niveles entonces pasar al siguiente
        if (nivelActual + 1 <= nivelMaximo) {
            nivelActual++;

            // Cada X niveles reducir el tamaño de la plataforma
            if (nivelActual % tamanioPlataforma_decrementarCadaNiveles == 0) {
                if (tamanioPlataforma - 1 >= tamanioPlataforma_minimo) {
                    tamanioPlataforma--;
                }
            }

            // Aumentar el tipo de bloques que se pueden generar
            if (baseGenerarBloques_actual + baseGenerarBloques_incrementarUnidades <= baseGenerarBloques_maximo) {
                baseGenerarBloques_actual += baseGenerarBloques_incrementarUnidades;
            }

            else {
                baseGenerarBloques_actual = baseGenerarBloques_maximo;
            }

            // Aumentar el número de bloques que se generan en el nivel
            if (bloquesGenerar_actual + bloquesGenerar_incrementarUnidades <= bloquesGenerar_maximo) {
                bloquesGenerar_actual += bloquesGenerar_incrementarUnidades;
            }

            else {
                bloquesGenerar_actual = bloquesGenerar_maximo;
            }

            // Mostrar la pntalla de Victoria
            this.getParent().addChild(new VictoryLayer());
        }

        // Si el jugador ya ganó el último nivel
        else {
            nivelActual = 1;
            tamanioPlataforma = tamanioPlataforma_maximo;
            baseGenerarBloques_actual = baseGenerarBloques_inicial;
            bloquesGenerar_actual = bloquesGenerar_inicial;

            // Cambiar por una pantalla de volver a jugar (el primer nivel)
            this.getParent().addChild(new LastLevelLayer());
        }
    },


    accionDerrotaJuego: function() {
        cc.director.pause();

        this.getParent().addChild(new GameOverLayer());
    },


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Actualizar el juego
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    update: function(dt) {
        this.space.step(dt);

        // ------------------------------------------
        // Comprobar si quedan bloques que colocar
        // ------------------------------------------

        if (estadoJuego == TODOS_BLOQUES_COLOCADOS) {
            this.accionVictoriaJuego();
        }

        else if (estadoJuego == SOLTAR_BLOQUE) {
            // -------------------------------------------------------------
            // Comprobar si se le acabó el tiempo para colocar el bloque
            // -------------------------------------------------------------

            var tiempoActual = new Date().getTime();

            if (tiempoActual - this.tiempoInicialBloque > this.tiempoLimiteColocacion){
                var controles = this.getParent().getChildByTag(idCapaControles);

                if (controles.restarVida() == 0) {
                    this.accionDerrotaJuego();
                }

                return;
            }

            // ---------------------------
            // Movimiento de la grua
            // ---------------------------

            var desplX;

            if (this.grua_moverIzquierda) {
                var limiteIzquierda = (this.spritePlataformaGeneracion.x + this.spritePlataformaGeneracion.width / 2)
                    + (this.spriteGrua.width / 2) + 20;


                if (this.spriteGrua.x - this.spriteGrua_velX > limiteIzquierda) {
                    desplX = -this.spriteGrua_velX;

                    this.moverGrua(desplX);
                    this.moverBloqueGenerado(desplX);
                }

                else {
                    desplX = limiteIzquierda - this.spriteGrua.x;

                    this.moverGrua(desplX);
                    this.moverBloqueGenerado(desplX);
                }
            }

            if (this.grua_moverDerecha) {
                var limiteDerecha = cc.winSize.width - (this.spriteGrua.width / 2) - 20;

                if (this.spriteGrua.x + this.spriteGrua_velX < limiteDerecha) {
                    desplX = this.spriteGrua_velX;

                    this.moverGrua(desplX);
                    this.moverBloqueGenerado(desplX);
                }

                else {
                    desplX = limiteDerecha - this.spriteGrua.x;

                    this.moverGrua(desplX);
                    this.moverBloqueGenerado(desplX);
                }
            }

        }


        // --------------------------------------------------
        // Colocar la grúa encima del bloque
        // --------------------------------------------------

        else if (estadoJuego == AGARRANDO_BLOQUE_MOVER_GRUA_BLOQUE) {
            if (this.spriteGrua.x - this.spriteGrua_velX > this.bloqueGenerado.x) {
                this.moverGrua(-this.spriteGrua_velX);
            }

            else {
                this.moverGrua(this.bloqueGenerado.x - this.spriteGrua.x);
                estadoJuego = AGARRANDO_BLOQUE_SUBIR_BLOQUE;
            }
        }


        // -----------------------------------
        // Subir el bloque hasta la grúa
        // -----------------------------------

        else if(estadoJuego == AGARRANDO_BLOQUE_SUBIR_BLOQUE) {
            var posFinalBloque = this.spriteGrua.y - this.spriteGrua.height / 2 - this.bloqueGenerado.height / 2;

            if (this.bloqueGenerado.y + this.bloqueGenerado_velSubida < posFinalBloque) {
                this.subirBloqueGenerado(this.bloqueGenerado_velSubida);
            }

            else {
                this.subirBloqueGenerado(posFinalBloque - this.bloqueGenerado.y);

                estadoJuego = AGARRANDO_BLOQUE_MOVER_GRUA_CENTRO;
            }
        }


        // --------------------------------------------------
        // Llevar la grua al centro con el bloque generado
        // --------------------------------------------------

        else if (estadoJuego == AGARRANDO_BLOQUE_MOVER_GRUA_CENTRO) {
            if (this.spriteGrua.x + this.spriteGrua_velX < cc.winSize.width * 0.5) {
                this.moverGrua(this.spriteGrua_velX);
                this.moverBloqueGenerado(this.spriteGrua_velX);
            }

            else {
                this.moverGrua(cc.winSize.width * 0.5 - this.spriteGrua.x);
                this.moverBloqueGenerado(cc.winSize.width * 0.5 - this.spriteGrua.x);

                estadoJuego = SOLTAR_BLOQUE;
                this.tiempoInicialBloque = new Date().getTime();

                var controles = this.getParent().getChildByTag(idCapaControles);
                controles.addChild(controles.indicadorTiempo);
            }
        }


        // ---------------------------
        // Eliminación de bloques
        // ---------------------------

        // se buscan las formas que han caído fuera, para eliminarlas
        for (var i = 0; i < this.formasEliminar.length; i++) {
            var shape = this.formasEliminar[i];

            for (var i = 0; i < this.arrayBloques.length; i++) {
                if (this.arrayBloques[i].body.shapeList[0] == shape) {
                   this.space.removeShape(shape);
                   this.space.removeBody(shape.getBody());

                   this.arrayBloques[i].removeFromParent();
                   this.arrayBloques.splice(i, 1);
                }
            }
        }

        this.formasEliminar = [];
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
        this.addChild(layer, 0, idCapaJuego);

        var controlesLayer = new ControlesLayer();
        this.addChild(controlesLayer, 0, idCapaControles);
    }
});
