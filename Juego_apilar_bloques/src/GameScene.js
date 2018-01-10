// ----------------------
// Estado del juego
// ----------------------

var AGARRAR_FIGURA = 0;
var AGARRANDO_FIGURA_MOVER_GRUA_A_FIGURA = 1;
var AGARRANDO_FIGURA_SUBIR_FIGURA = 2;
var AGARRANDO_FIGURA_MOVER_GRUA_CENTRO = 3;

var SOLTAR_FIGURA = 4;
var SOLTANDO_FIGURA = 5;

var TODAS_FIGURAS_COLOCADAS = 6;

var estadoJuego;


// ----------------------
// Tipo de colisisones
// ----------------------

var tipoMuro = 2;
var tipoFigura = 3;
var tipoLineaPowerUp = 4;


// -----------------------------------------------------
// Número de figuras que hay que generar en un nivel
// -----------------------------------------------------

var figurasGenerar_inicial = 4;
var figurasGenerar_maximo = 8;

var figurasGenerar_actual = figurasGenerar_inicial;
var figurasGenerar_incrementarUnidades = 3;


var numeroFigurasQuedan = figurasGenerar_actual;
var tiempoGeneracionFiguras = 4500; // Generar un nueva figura cada X milisegundos


// -----------------------------------------------------
// Número de vidas que hay en un nivel
// -----------------------------------------------------

var numero_vidas_iniciales = 5;
var numero_vidas_minimas = 1;

var numero_vidas_actuales = numero_vidas_iniciales;
var numero_vidas_reducirUnidades = 2;

var vidas;


// -----------------------------------------------------
// Tiempo para colocar una figura en un nivel
// -----------------------------------------------------

var tiempoLimiteColocacion_inicial = 8000;
var tiempoLimiteColocacion_minimo = 4000;

var tiempoLimiteColocacion_actual = tiempoLimiteColocacion_inicial;
var tiempoLimiteColocacion_decrementarUnidades = 1000;

var tiempoLimiteColocacion;


// ----------------------------------------------------------------
// Tipo de figuras que se pueden generar (Hay 5 tipos de figuras)
// ----------------------------------------------------------------

var baseGenerarFiguras_inicial = 60;
var baseGenerarFiguras_maximo = 100;

var baseGenerarFiguras_actual = baseGenerarFiguras_inicial;

// Cada 20 unidades puede generarse un nuevo tipo de figura
// Este incremento se aplicará en cada cambio de nivel
var baseGenerarFiguras_incrementarUnidades = 20;


// ----------------------------------------------------------------
// Tamaño de la plataforma en la que hay que colocar los figuras
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

    spritePlataformaColocacion: null,
    spritePlataformaGeneracion: null,

    spriteGrua: null,
    spriteGrua_velX: null,

    tiempoInicialFigura: null,

    arrayFiguras: null,
    formasEliminar: null,

    figuraGenerada: null,
    figuraGenerada_velSubida: null,

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
        this.space.gravity = cp.v(0,-360);

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

        this.arrayFiguras = [];
        this.formasEliminar = [];

        numeroFigurasQuedan = figurasGenerar_actual;
        vidas = numero_vidas_actuales;

        this.powerUpActivo = false;
        this.powerUpObtenido = false;

        this.spriteGrua_velX = 3;
        this.figuraGenerada_velSubida = 2;

        this.grua_moverIzquierda = false;
        this.grua_moverDerecha = false;

        this.inicializarGrua();
        this.inicializarPlataformas();
        this.generarFiguraAleatoria();

        estadoJuego = AGARRAR_FIGURA;

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
            var indice;
            var figura;

            for (indice = 0; indice < instancia.arrayFiguras.length; indice++) {
                figura = instancia.arrayFiguras[indice];

                if (figura.containsPoint(event.getLocationX(), event.getLocationY())) {
                    instancia.powerUpActivo = false;

                    var controles = instancia.getParent().getChildByTag(idCapaControles);

                    controles.indicadorPowerUp.setString("PowerUp: No activo");
                    instancia.formasEliminar.push(figura.body.shapeList[0]);

                    console.log("Se ha desactivado el PowerUp");
                    console.log("Eliminada una figura -->  " + figura.tipoFigura);
                    break;
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
        var lineaPowerUp_posY = this.spritePlataformaColocacion.y + (this.spritePlataformaColocacion.height / 2) + 90;

        var puntoInicial = cc.p(0, lineaPowerUp_posY);
        var puntoFinal = cc.p(size.width, lineaPowerUp_posY);
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
        // Plataforma de colocación de figuras
        // ----------------------------------------

        var spritePlataforma = new cc.PhysicsSprite(res_aux.barra_aux_1 + tamanioPlataforma + res_aux.barra_aux_2);

        var body = new cp.StaticBody();

        body.p = new cp.Vect(cc.winSize.width * 0.5, spritePlataforma.height / 2 + 10);
        spritePlataforma.setBody(body);

        var shape = new cp.BoxShape(body, spritePlataforma.width, spritePlataforma.height);
        shape.setFriction(1.05);
        this.space.addStaticShape(shape);

        this.addChild(spritePlataforma);
        this.spritePlataformaColocacion = spritePlataforma;


        // ----------------------------------------
        // Plataforma de generación de figuras
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


    generarFiguraAleatoria: function() {
        var valorAleatorio = Math.floor(Math.random() * (baseGenerarFiguras_actual - 1)) + 1;

        if (valorAleatorio <= 20) { // Generar un cuadrado
            this.figuraGenerada = generarFigura(FIGURA_CUADRADO,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 40) { // Generar un rectangulo en posición horizontal
            this.figuraGenerada = generarFigura(FIGURA_RECTANGULO_HORIZONTAL,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 60) { // Generar un círculo
            this.figuraGenerada = generarFigura(FIGURA_CIRCULO,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 80) { // Generar un rectángulo en posición vertical
            this.figuraGenerada = generarFigura(FIGURA_RECTANGULO_VERTICAL,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 100) { // Generar un triángulo
            this.figuraGenerada = generarFigura(FIGURA_TRIANGULO,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else { // En cualquier otro caso: generar un cuadrado
            this.figuraGenerada = generarFigura(FIGURA_CUADRADO,
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
        if (estadoJuego == AGARRAR_FIGURA) {
            if (!this.powerUpObtenido) { // Si todavía no consiguió un PowerUp
                this.powerUpActivo = true;
                this.powerUpObtenido = true;

                var controles = this.getParent().getChildByTag(idCapaControles);

                controles.indicadorPowerUp.setString("PowerUp: Activo");
                console.log("Se activó el PowerUp");
            }
        }
    },


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Mover la grua y la figura generada
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    moverGrua: function(desplX) {
        this.spriteGrua.setPosition(cc.p(this.spriteGrua.x + desplX, this.spriteGrua.y));
    },

    moverFiguraGenerada: function(desplX) {
        this.figuraGenerada.setPosition(cc.p(this.figuraGenerada.x + desplX, this.figuraGenerada.y));
    },

    subirFiguraGenerada: function(desplY) {
        this.figuraGenerada.setPosition(cc.p(this.figuraGenerada.x, this.figuraGenerada.y + desplY));
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

            // Aumentar la variedad de figuras que se pueden generar
            if (baseGenerarFiguras_actual + baseGenerarFiguras_incrementarUnidades <= baseGenerarFiguras_maximo) {
                baseGenerarFiguras_actual += baseGenerarFiguras_incrementarUnidades;
            }

            else {
                baseGenerarFiguras_actual = baseGenerarFiguras_maximo;
            }

            // Aumentar el número de figuras que se generan en el nivel
            if (figurasGenerar_actual + figurasGenerar_incrementarUnidades <= figurasGenerar_maximo) {
                figurasGenerar_actual += figurasGenerar_incrementarUnidades;
            }

            else {
                figurasGenerar_actual = figurasGenerar_maximo;
            }

            // Reducir el número de vidas del nivel
            if (numero_vidas_actuales - numero_vidas_reducirUnidades >= numero_vidas_minimas) {
                numero_vidas_actuales -= numero_vidas_reducirUnidades;
            }

            else {
                numero_vidas_actuales = numero_vidas_minimas;
            }

            // Reducir el tiempo que tiene el jugador para colocar la figura
            if (tiempoLimiteColocacion_actual - tiempoLimiteColocacion_decrementarUnidades >= tiempoLimiteColocacion_minimo) {
                tiempoLimiteColocacion_actual -= tiempoLimiteColocacion_decrementarUnidades;
            }

            else {
                tiempoLimiteColocacion_actual = tiempoLimiteColocacion_minimo;
            }

            // Mostrar la pntalla de Victoria
            this.getParent().addChild(new VictoryLayer());
        }

        // Si el jugador ya ganó el último nivel
        else {
            nivelActual = 1;
            tamanioPlataforma = tamanioPlataforma_maximo;

            baseGenerarFiguras_actual = baseGenerarFiguras_inicial;
            figurasGenerar_actual = figurasGenerar_inicial;

            numero_vidas_actuales = numero_vidas_iniciales;
            tiempoLimiteColocacion_actual = tiempoLimiteColocacion_inicial;

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

        // --------------------------------------------
        // Comprobar si quedan figuras que colocar
        // --------------------------------------------

        if (estadoJuego == TODAS_FIGURAS_COLOCADAS) {
            this.accionVictoriaJuego();
        }

        else if (estadoJuego == SOLTAR_FIGURA) {
            // -------------------------------------------------------------
            // Comprobar si se le acabó el tiempo para colocar la figura
            // -------------------------------------------------------------

            var tiempoActual = new Date().getTime();

            if (tiempoActual - this.tiempoInicialFigura > tiempoLimiteColocacion) {
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
                    this.moverFiguraGenerada(desplX);
                }

                else {
                    desplX = limiteIzquierda - this.spriteGrua.x;

                    this.moverGrua(desplX);
                    this.moverFiguraGenerada(desplX);
                }
            }

            if (this.grua_moverDerecha) {
                var limiteDerecha = cc.winSize.width - (this.spriteGrua.width / 2) - 20;

                if (this.spriteGrua.x + this.spriteGrua_velX < limiteDerecha) {
                    desplX = this.spriteGrua_velX;

                    this.moverGrua(desplX);
                    this.moverFiguraGenerada(desplX);
                }

                else {
                    desplX = limiteDerecha - this.spriteGrua.x;

                    this.moverGrua(desplX);
                    this.moverFiguraGenerada(desplX);
                }
            }

        }


        // --------------------------------------------------
        // Colocar la grúa encima de la figura
        // --------------------------------------------------

        else if (estadoJuego == AGARRANDO_FIGURA_MOVER_GRUA_A_FIGURA) {
            if (this.spriteGrua.x - this.spriteGrua_velX > this.figuraGenerada.x) {
                this.moverGrua(-this.spriteGrua_velX);
            }

            else {
                this.moverGrua(this.figuraGenerada.x - this.spriteGrua.x);
                estadoJuego = AGARRANDO_FIGURA_SUBIR_FIGURA;
            }
        }


        // -----------------------------------
        // Subir la figura hasta la grúa
        // -----------------------------------

        else if(estadoJuego == AGARRANDO_FIGURA_SUBIR_FIGURA) {
            var posFinalFigura = this.spriteGrua.y - this.spriteGrua.height / 2 - this.figuraGenerada.height / 2;

            if (this.figuraGenerada.y + this.figuraGenerada_velSubida < posFinalFigura) {
                this.subirFiguraGenerada(this.figuraGenerada_velSubida);
            }

            else {
                this.subirFiguraGenerada(posFinalFigura - this.figuraGenerada.y);

                estadoJuego = AGARRANDO_FIGURA_MOVER_GRUA_CENTRO;
            }
        }


        // --------------------------------------------------
        // Llevar la grua al centro con la figura generada
        // --------------------------------------------------

        else if (estadoJuego == AGARRANDO_FIGURA_MOVER_GRUA_CENTRO) {
            var posObjetivo = cc.winSize.width * 0.5;
            var desplazX;

            if (this.spriteGrua.x + this.spriteGrua_velX < posObjetivo) {
                desplazX = this.spriteGrua_velX;

                this.moverGrua(desplazX);
                this.moverFiguraGenerada(desplazX);
            }

            else {
                desplazX = posObjetivo - this.spriteGrua.x;

                this.moverGrua(desplazX);
                this.moverFiguraGenerada(desplazX);

                estadoJuego = SOLTAR_FIGURA;
                this.tiempoInicialFigura = new Date().getTime();
            }
        }


        // ---------------------------
        // Eliminación de figuras
        // ---------------------------

        // se buscan las formas que han caído fuera, para eliminarlas
        for (var index_1 = 0; index_1 < this.formasEliminar.length; index_1++) {
            var shape = this.formasEliminar[index_1];

            for (var index_2 = 0; index_2 < this.arrayFiguras.length; index_2++) {
                if (this.arrayFiguras[index_2].body.shapeList[0] == shape) {
                   this.space.removeShape(shape);
                   this.space.removeBody(shape.getBody());

                   this.arrayFiguras[index_2].removeFromParent();
                   this.arrayFiguras.splice(index_2, 1);

                   break;
                }
            }
        }

        this.formasEliminar = [];
    }   // Fin del método update

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
