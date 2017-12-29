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

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ======================================
// Capa de la escena
// ======================================

var GameLayer = cc.Layer.extend({
    spriteGrua:null,
    spritePlataformaGeneracion:null,

    botonDcha:null,
    botonIzda:null,
    botonCoger:null,

    bloqueGrua:null,
    bloqueGenerado:null,
    bloquesGenerados:null,

    grua_moverIzquierda:false,
    grua_moverDerecha:false,

    ctor:function () {
        this._super();
        var size = cc.winSize;

        // -----------------------
        // Inicializar Space
        // -----------------------

        this.space = new cp.Space();
        this.space.gravity = cp.v(0,-350);

        // --------------------------
        // Cachear los sprites
        // --------------------------

        cc.spriteFrameCache.addSpriteFrames(res.barra_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.barra2_plist);



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

        this.bloquesGenerados=0;
        this.inicializarPlataformas();
        this.inicializarGrua();
        this.inicializarBotonesControl();
        this.generarBloqueAleatorio();

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

        // ----------------------------
        // Actualizar el juego
        // ----------------------------

        this.scheduleUpdate();

        return true;
    },


    procesarMouseDown: function(event) {
        if (estadoJuego == AGARRAR_BLOQUE || estadoJuego == SOLTAR_BLOQUE) {
            var instancia = event.getCurrentTarget();

            var areaBotonIzda = instancia.botonIzda.getBoundingBox();
            var areaBotonDcha = instancia.botonDcha.getBoundingBox();
            var areaBotonCoger = instancia.botonCoger.getBoundingBox();

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
                    setTimeout(() => {instancia.agarrarBloque()}, 1500);
                }
            }
        }
    },

    moverGrua: function(x){

        var actionMoverGruaX = cc.MoveTo.create(400 / 500,
             cc.p(x, this.spriteGrua.y));

        this.spriteGrua.runAction(actionMoverGruaX);

        if(this.bloqueGrua!=null){
            var actionMoverBloqueGruaX = cc.MoveTo.create(400 / 500,
                cc.p(x, this.bloqueGrua.y));
            this.bloqueGrua.runAction(actionMoverBloqueGruaX);
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

        this.botonCoger = cc.Sprite.create(res.joypad_png);
        this.botonCoger.setPosition(cc.p(cc.winSize.width * 0.85, cc.winSize.height * 0.45));

        this.addChild(this.botonCoger);
    },


    generarBloqueAleatorio: function() {

        var spriteBloque = new cc.PhysicsSprite("#cocodrilo1.png");

        console.log("1: " + spriteBloque.width + ", 2: " + spriteBloque.height);
        // Masa 1
        var body = new cp.Body(1, cp.momentForBox(1, 3, 3));

        body.p = cc.p(this.spritePlataformaGeneracion.x , this.spritePlataformaGeneracion.y + this.spritePlataformaGeneracion.height + spriteBloque.height);

        spriteBloque.setBody(body);
        //this.space.addBody(body);

        var shape = new cp.BoxShape(body, spriteBloque.width, spriteBloque.height);
        shape.setFriction(1);
        //shape.setCollisionType(tipoBloque);
        this.space.addShape(shape);
        this.addChild(spriteBloque);
        this.bloqueGenerado= spriteBloque;

        /**
        var valorAleatorio = Math.floor(Math.random() * (baseGenerarBloques_actual - 1)) + 1;
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
        **/
        this.bloquesGenerados++;
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

        /*this.spritePlataformaGeneracion = new cc.PhysicsSprite("#barra_2.png");
        var body = new cp.StaticBody();
        body.p = cc.p(cc.winSize.width * 0.25, cc.winSize.height * 0.75);
        this.spritePlataformaGeneracion.setBody(body);

        var shape = new cp.BoxShape(body, this.spritePlataformaGeneracion.width, this.spritePlataformaGeneracion.height);

        // addStaticShape en lugar de addShape
        shape.setFriction(1);
        this.space.addStaticShape(shape);
        */

        this.spritePlataformaGeneracion =cc.Sprite.create(res.barra2_png);

        this.spritePlataformaGeneracion.setPosition(cc.p(cc.winSize.width * 0.13, cc.winSize.height * 0.75));

        this.addChild(this.spritePlataformaGeneracion);
    },


    cambiarTamanioPlataforma: function(nuevoTamanio) {
        if(nuevoTamanio >= tamanioPlataforma_minimo && nuevoTamanio <= tamanioPlataforma_maximo) {
            tamanioPlataforma = this.nuevoTamanio;
        }
    },

    colocarGruaEncimaBloque:  function(){
        this.moverGrua(this.bloqueGenerado.x);
    },

    agarrarBloque:  function(){
            this.bloqueGrua=this.bloqueGenerado;
            this.bloqueGenerado=null;
            this.moverGrua(cc.winSize.width * 0.5);
            estadoJuego=SOLTAR_BLOQUE;
    },


    update: function (dt) {
        // ---------------------------
        // Movimiento de la grua
        // ---------------------------
        this.space.step(dt);

        if (estadoJuego == AGARRAR_BLOQUE || estadoJuego == SOLTAR_BLOQUE) {
            if (this.grua_moverIzquierda) {
                /*var actionMoverGruaX = cc.MoveTo.create(Math.abs(this.spriteGrua.x - 0) / 500,
                    cc.p(Math.max(this.spriteGrua.x - 2, cc.winSize.height * 0.4), this.spriteGrua.y));

                this.spriteGrua.runAction(actionMoverGruaX);
                if(this.bloqueGrua!=null){
                    var actionMoverBloqueGruaX = cc.MoveTo.create(Math.abs(this.bloqueGrua.x - 0) / 500,
                        cc.p(Math.max(this.bloqueGrua.x - 2, cc.winSize.height * 0.4), this.bloqueGrua.y));
                    this.bloqueGrua.runAction(actionMoverBloqueGruaX);
                }*/
                this.moverGrua(Math.max(this.spriteGrua.x - 2, cc.winSize.height * 0.4));
            }

            if (this.grua_moverDerecha) {
                this.moverGrua(Math.min(this.spriteGrua.x + 2, cc.winSize.width));
                /*var actionMoverGruaX = cc.MoveTo.create(Math.abs(this.spriteGrua.x - cc.winSize.width) / 500,
                    cc.p(Math.min(this.spriteGrua.x + 2, cc.winSize.width), this.spriteGrua.y));

                this.spriteGrua.runAction(actionMoverGruaX);
                if(this.bloqueGrua!=null){
                    var actionMoverBloqueGruaX = cc.MoveTo.create(Math.abs(this.bloqueGrua.x - cc.winSize.width) / 500,
                        cc.p(Math.min(this.bloqueGrua.x + 2, cc.winSize.width), this.bloqueGrua.y));
                    this.bloqueGrua.runAction(actionMoverBloqueGruaX);
                }*/
            }
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
