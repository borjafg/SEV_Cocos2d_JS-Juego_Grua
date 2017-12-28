// ----------------------
// Estado del juego
// ----------------------

var AGARRAR_BLOQUE = 0;
var AGARRANDO_BLOQUE = 1
var SOLTAR_BLOQUE = 2;
var SOLTANDO_BLOQUE = 3;

var estadoJuego = AGARRAR_BLOQUE;


// -----------------------------------------------------
// Número de bloques que hay que generar en un nivel
// -----------------------------------------------------

var bloquesGenerar_inicial = 5;
var bloqueGenerar_Maximo = 15;

var bloquesGenerar_actual = bloquesGenerar_inicial;
var bloquesGenerar_incrementarUnidades = 5;


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


// ======================================
// Capa de la escena
// ======================================

var GameLayer = cc.Layer.extend({
    spriteGrua:null,

    botonDcha:null,
    botonIzda:null,

    grua_moverIzquierda:false,
    grua_moverDerecha:false,

    ctor:function () {
        this._super();
        var size = cc.winSize;

        // -----------------------
        // Inicializar Space
        // -----------------------

        this.space = new cp.Space();
        this.space.gravity = cp.v(0,0);

        // --------------------------
        // Cachear los sprites
        // --------------------------

        cc.spriteFrameCache.addSpriteFrames(res.barra_plist);

        // --------------------
        // Crear el fondo
        // --------------------

        var fondoGame = new cc.Sprite(res.fondo_game_png);

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

                if (estadoJuego == AGARRAR_BLOQUE) {
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
            },

            onKeyReleased: function(keyCode, event){
                if (keyCode == 37 || keyCode == 39) {
                    var instancia = event.getCurrentTarget();

                    instancia.grua_moverIzquierda = false;
                    instancia.grua_moverDerecha = false;
                }
            }
        }, this); // Fin del listener KEYBOARD

        // ----------------------------
        // Actualizar el juego
        // ----------------------------

        this.scheduleUpdate();

        return true;
    },


    procesarMouseDown: function(event) {
        if (estadoJuego == AGARRAR_BLOQUE) {
            var instancia = event.getCurrentTarget();

            var areaBotonIzda = instancia.botonIzda.getBoundingBox();
            var areaBotonDcha = instancia.botonDcha.getBoundingBox();


            if (cc.rectContainsPoint( areaBotonIzda, cc.p(event.getLocationX(), event.getLocationY()) )) {
                instancia.grua_moverIzquierda = true;
                instancia.grua_moverDerecha = false;
            }

            else if (cc.rectContainsPoint( areaBotonDcha, cc.p(event.getLocationX(), event.getLocationY()) )) {
                instancia.grua_moverIzquierda = false;
                instancia.grua_moverDerecha = true;
            }
        }
    },


    procesarMouseUp: function(event) {
        var instancia = event.getCurrentTarget();

        instancia.grua_moverIzquierda = false;
        instancia.grua_moverDerecha = false;
    },


    inicializarGrua: function() {
        this.spriteGrua = cc.Sprite.create(res.grua_png);

        this.spriteGrua.setScale(0.2);
        this.spriteGrua.setPosition(cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.9));

        this.addChild(this.spriteGrua);
    },


    inicializarBotonesControl: function() {
        this.botonIzda = cc.Sprite.create(res.joypad_png);
        this.botonIzda.setPosition(cc.p(cc.winSize.width * 0.7, cc.winSize.height * 0.25));

        this.addChild(this.botonIzda);

        this.botonDcha = cc.Sprite.create(res.joypad_png);
        this.botonDcha.setPosition(cc.p(cc.winSize.width * 0.85, cc.winSize.height * 0.25));

        this.addChild(this.botonDcha);
    },


    generarBloqueAleatorio: function() {
        var valorAleatorio = Math.floor(Math.random() * (baseParaGenerarBloques - 1)) + 1;

        if (valorAleatorio <= 5) { // Generar un cuadrado
            //var dn = new cc.DrawNode();
            //this.addChild(dn, 500);
            //dn.drawPoly([cc.p(50,50), cc.p(100, 70), cc.p(110, 100), cc.p(120, 80), cc.p(70, 40)], cc.p(500,500),  cc.color(249,255,115), 100,  cc.color(249,255,115));
            //dn.runAction(
            //    cc.repeatForever(
            //        cc.rotateBy(1, 10)
            //    )
            //);
        }

        else if (valorAleatorio <= 10) { // Generar un rectangulo en posición horizontal

        }

        else if (valorAleatorio <= 15) { // Generar un círculo

        }

        else if (valorAleatorio <= 20) { // Generar un rectángulo en posición vertical

        }

        else if (valorAleatorio <= 25) { // Generar un triángulo

        }

        else { // En cualquier otro caso: generar un cuadrado

        }
    },


    inicializarPlataformas: function() {
        var spritePlataforma = new cc.PhysicsSprite("#barra_" + tamanioPlataforma + ".png");

        var body = new cp.StaticBody();
        body.p = cc.p(cc.winSize.width * 0.5, cc.winSize.height * 0.05);
        spritePlataforma.setBody(body);

        var shape = new cp.BoxShape(body, spritePlataforma.width, spritePlataforma.height);

        // addStaticShape en lugar de addShape
        shape.setFriction(1);
        this.space.addStaticShape(shape);

        this.addChild(spritePlataforma);
    },


    cambiarTamanioPlataforma: function(nuevoTamanio) {
        if(nuevoTamanio >= tamanioPlataforma_minimo && nuevoTamanio <= tamanioPlataforma_maximo) {
            tamanioPlataforma = this.nuevoTamanio;
        }
    },


    update: function (dt) {
        // ---------------------------
        // Movimiento de la grua
        // ---------------------------

        cc.director.getActionManager().removeAllActionsFromTarget(this.spriteGrua, true);

        if (this.grua_moverIzquierda) {
            var actionMoverGruaX = cc.MoveTo.create(Math.abs(this.spriteGrua.x - 0) / 500,
                cc.p(Math.max(this.spriteGrua.x - 2, 0), cc.winSize.height * 0.9));

            this.spriteGrua.runAction(actionMoverGruaX);
        }

        if (this.grua_moverDerecha) {
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
    }
});
