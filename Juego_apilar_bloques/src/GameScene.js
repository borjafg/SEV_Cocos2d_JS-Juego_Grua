// ----------------------
// Estado del juego
// ----------------------

var AGARRAR_BLOQUE = 0;
var AGARRANDO_BLOQUE = 1;
var AGARRANDO_BLOQUE_VOLVER = 2;

var SOLTAR_BLOQUE = 3;
var SOLTANDO_BLOQUE = 4;

var TODOS_BLOQUES_COLOCADOS = 5;

var estadoJuego = AGARRAR_BLOQUE;


// ----------------------
// Tipo de colisisones
// ----------------------

var tipoMuro = 2;
var tipoFigura = 3;


// -----------------------------------------------------
// Número de bloques que hay que generar en un nivel
// -----------------------------------------------------

var bloquesGenerar_inicial = 5;
var bloqueGenerar_Maximo = 15;

var bloquesGenerar_actual = bloquesGenerar_inicial;
var bloquesGenerar_incrementarUnidades = 5;


var numeroBloquesQuedan = bloquesGenerar_actual;
var tiempoGeneracionBloques = 4000; // Generar un nuevo bloque cada X milisegundos


// ------------------------------------------
// Tipo de bloques que se pueden generar
// ------------------------------------------

var baseGenerarBloques_inicial = 10;
var baseGenerarBloques_maximo = 30;

var baseGenerarBloques_actual = baseGenerarBloques_inicial;

// Cada 5 unidades puede generarse un nuevo tipo de figura
// Este incremento se aplicará en cada cambio de nivel
var baseGenerarBloques_incrementarUnidades = 5;


// ----------------------------------------------------------------
// Tamaño de la plataforma en la que hay que colocar los bloques
// ----------------------------------------------------------------

var tamanioPlataforma_minimo = 1;
var tamanioPlataforma_maximo = 3;

// Al princio la plataforma será lo más grande posible
var tamanioPlataforma = tamanioPlataforma_maximo;

// La plataforma se reducirá cada X niveles
var tamanioPlataforma_incrementarCadaNiveles = 1;


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
    tiempoLimiteColocacion: 5000,

    arrayBloques: [],
    formasEliminar: [],

    bloqueGenerado: null,

    grua_moverIzquierda: null,
    grua_moverDerecha: null,


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

        // --------------------------
        // Cachear los sprites
        // --------------------------

        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);

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

        // ------------------------------------------
        // Añadir la gestión de las colisiones
        // ------------------------------------------

        // muro y bloque
        this.space.addCollisionHandler(tipoMuro, tipoFigura, null, null, this.collisionBloqueConMuro.bind(this), null);

        // ----------------------------------
        // Inicializar elementos del juego
        // ----------------------------------

        numeroBloquesQuedan = bloquesGenerar_actual;

        this.spriteGrua_velX = 3;

        this.grua_moverIzquierda = false;
        this.grua_moverDerecha = false;

        this.inicializarPlataformas();
        this.inicializarGrua();
        this.generarBloqueAleatorio();

        estadoJuego = AGARRAR_BLOQUE;

        // ----------------------------
        // Actualizar el juego
        // ----------------------------

        this.scheduleUpdate();

        return true;
    },


    collisionBloqueConMuro: function(arbiter, space) {
        var controles = this.getParent().getChildByTag(idCapaControles);

        if(controles.restarVida() == 0) {
            cc.director.runScene(new GameScene());
        }

        var shapes = arbiter.getShapes();

        // shapes[0] es el muro
        this.formasEliminar.push(shapes[1]);
    },


    inicializarGrua: function() {
        this.spriteGrua = cc.Sprite.create(res.grua_png);

        this.spriteGrua.setScale(0.2);
        this.spriteGrua.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.9));

        this.addChild(this.spriteGrua);
    },


    inicializarPlataformas: function() {
        // ----------------------------------------
        // Plataforma de colocación de bloques
        // ----------------------------------------

        var spritePlataforma = new cc.PhysicsSprite("res/barra_" + tamanioPlataforma + ".png");

        var body = new cp.StaticBody();
        body.p = cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.05);
        spritePlataforma.setBody(body);

        var shape = new cp.BoxShape(body, spritePlataforma.width, spritePlataforma.height);
        shape.setFriction(1);
        this.space.addStaticShape(shape);

        this.addChild(spritePlataforma);


        // ----------------------------------------
        // Plataforma de generación de bloques
        // ----------------------------------------

        var spritePlataformaGen = new cc.PhysicsSprite(res.barra2_png);

        var body2 = new cp.StaticBody();
        body2.p = cc.p(cc.winSize.width * 0.13, cc.winSize.height * 0.75);
        spritePlataformaGen.setBody(body2);

        var shape2 = new cp.BoxShape(body2, spritePlataformaGen.width, spritePlataformaGen.height);
        shape2.setFriction(1);
        this.space.addStaticShape(shape2);

        this.addChild(spritePlataformaGen);

        this.spritePlataformaGeneracion = spritePlataformaGen;
    },


    cambiarTamanioPlataforma: function(nuevoTamanio) {
        if(nuevoTamanio >= tamanioPlataforma_minimo && nuevoTamanio <= tamanioPlataforma_maximo) {
            tamanioPlataforma = this.nuevoTamanio;
        }
    },


    generarBloqueAleatorio: function() {
        /*var valorAleatorio = Math.floor(Math.random() * (baseGenerarBloques_actual - 1)) + 1;

        if (valorAleatorio <= 5) { // Generar un cuadrado
            this.bloqueGenerado = generarFigura(FIGURA_CUADRADO,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 10) { // Generar un rectangulo en posición horizontal
            this.bloqueGenerado = generarFigura(FIGURA_RECTANGULO_HORIZONTAL,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 15) { // Generar un círculo */
            this.bloqueGenerado = generarFigura(FIGURA_CIRCULO,
                this.spritePlataformaGeneracion, this.space, this); /*
        }

        else if (valorAleatorio <= 20) { // Generar un rectángulo en posición vertical
            this.bloqueGenerado = generarFigura(FIGURA_RECTANGULO_VERTICAL,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else if (valorAleatorio <= 25) { // Generar un triángulo
            this.bloqueGenerado = generarFigura(FIGURA_TRIANGULO,
                this.spritePlataformaGeneracion, this.space, this);
        }

        else { // En cualquier otro caso: generar un cuadrado
            this.bloqueGenerado = generarFigura(FIGURA_CUADRADO,
                this.spritePlataformaGeneracion, this.space, this);
        }
        */
    },


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Mover la grua y el bloque generado
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    moverGrua: function(desplX) {
        this.spriteGrua.setPosition(cc.p(this.spriteGrua.x + desplX, this.spriteGrua.y));
    },

    moverBloqueGenerado: function(desplX) {
        this.bloqueGenerado.setPosition(cc.p(this.bloqueGenerado.x + desplX, this.bloqueGenerado.y));
    },


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Actualizar el juego
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    update: function(dt) {
        this.space.step(dt);

        // ------------------------------------------
        // Comrpobar si quedan bloques que colocar
        // ------------------------------------------

        if (estadoJuego == TODOS_BLOQUES_COLOCADOS) {
            cc.director.runScene(new GameScene());
        }


        else if (estadoJuego == SOLTAR_BLOQUE) {
            // -------------------------------------------------------------
            // Comprobar si se le acabó el tiempo para colocar el bloque
            // -------------------------------------------------------------

            var tiempoActual = new Date().getTime();

            if(tiempoActual - this.tiempoInicialBloque > this.tiempoLimiteColocacion){
                var controles = this.getParent().getChildByTag(idCapaControles);

                if(controles.restarVida() == 0) {
                    cc.director.runScene(new GameScene());
                }

                return;
            }

            // ---------------------------
            // Movimiento de la grua
            // ---------------------------

            var desplX;

            if (this.grua_moverIzquierda) {
                if (this.spriteGrua.x - this.spriteGrua_velX > cc.winSize.width * 0.3) {
                    desplX = -this.spriteGrua_velX;

                    this.moverGrua(desplX);
                    this.moverBloqueGenerado(desplX);
                }

                else {
                    desplX = cc.winSize.width * 0.3 - this.spriteGrua.x;

                    this.moverGrua(desplX);
                    this.moverBloqueGenerado(desplX);
                }
            }

            if (this.grua_moverDerecha) {
                if (this.spriteGrua.x + this.spriteGrua_velX < cc.winSize.width * 0.9) {
                    desplX = this.spriteGrua_velX;

                    this.moverGrua(desplX);
                    this.moverBloqueGenerado(desplX);
                }

                else {
                    desplX = cc.winSize.width * 0.9 - this.spriteGrua.x;

                    this.moverGrua(desplX);
                    this.moverBloqueGenerado(desplX);
                }
            }

        }


        // --------------------------------------------------
        // Colocar la grúa encima del bloque
        // --------------------------------------------------

        else if (estadoJuego == AGARRANDO_BLOQUE) {
            if (this.spriteGrua.x - this.spriteGrua_velX > this.bloqueGenerado.x) {
                this.moverGrua(-this.spriteGrua_velX);
            }

            else {
                this.moverGrua(this.bloqueGenerado.x - this.spriteGrua.x);
                estadoJuego = AGARRANDO_BLOQUE_VOLVER;
            }
        }


        // --------------------------------------------------
        // Llevar la grua al centro con el bloque generado
        // --------------------------------------------------

        if (estadoJuego == AGARRANDO_BLOQUE_VOLVER) {
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
