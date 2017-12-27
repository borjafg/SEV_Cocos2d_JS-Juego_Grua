

var GameLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        var size = cc.winSize;

        // Inicializar Space
        this.space = new cp.Space();
        this.space.gravity =  cp.v(0,0);

        //Cache
        cc.spriteFrameCache.addSpriteFrames(res.barra_plist);


        // Fondo
        var fondoGame= new cc.Sprite(res.fondo_game_png);

        // Asigno posición central
        fondoGame.setPosition(cc.p(size.width / 2, size.height / 2));
        fondoGame.setScale(size.height / fondoGame.height);

        // Añado fondo a la escena
        this.addChild(fondoGame);

        this.inicializarPlataformas();

        return true;

    } ,inicializarPlataformas:function () {

        var spritePlataforma = new cc.PhysicsSprite("#barra_3.png");

        var body = new cp.StaticBody();
        body.p = cc.p(cc.winSize.width*0.5 , cc.winSize.height*0.05);
        spritePlataforma.setBody(body);

        var shape = new cp.BoxShape(body, spritePlataforma.width, spritePlataforma.height);

        // addStaticShape en lugar de addShape
        shape.setFriction(1);
        this.space.addStaticShape(shape);

        this.addChild(spritePlataforma);

    }

});

var GameScene = cc.Scene.extend({
 onEnter:function () {
     this._super();
     cc.director.resume();
     var layer = new GameLayer();
     this.addChild(layer);
     //var controlesLayer = new ControlesLayer();
     //this.addChild(controlesLayer, 0, idCapaControles);
 }
});
