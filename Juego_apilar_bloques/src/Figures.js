// --------------------------------------
// Creación de figuras geométricas
// --------------------------------------

var FIGURA_CUADRADO = 0;
var FIGURA_RECTANGULO_HORIZONTAL = 1;
var FIGURA_RECTANGULO_VERTICAL = 2;
var FIGURA_CIRCULO = 3;
var FIGURA_TRIANGULO = 4;


generarFigura = function(tipoFiguraGenerar, plataformaGenereacionBloques, espacio) {

    var spriteFigura;
    var body;
    var shape;

    // Coordenadas del centro la parte superior
    // de la plataforma de generación de bloques

    var xPlataformaGeneracion = plataformaGenereacionBloques.x;
    var yPlataformaGeneracion = plataformaGenereacionBloques.y + plataformaGenereacionBloques.height / 2;


    switch (tipoFiguraGenerar) {
        case FIGURA_CUADRADO:
            console.log("==>  Generado un cuadrado");

            spriteFigura = new cc.PhysicsSprite("#cocodrilo1.png");

            // Masa 1
            body = new cp.Body(1, cp.momentForBox(1, spriteFigura.width, spriteFigura.height));

            body.p = cc.p(xPlataformaGeneracion, yPlataformaGeneracion + spriteFigura.height / 2);
            spriteFigura.setBody(body);

            shape = new cp.BoxShape(body, spriteFigura.width, spriteFigura.height);

            break;


        case FIGURA_RECTANGULO_HORIZONTAL:

            break;


        case FIGURA_RECTANGULO_VERTICAL:

            break;


        case FIGURA_CIRCULO:
            spriteFigura = new cc.PhysicsSprite("#animacion_circulo1.png");

            body = new cp.Body(1, cp.momentForCircle(1, 0, this.spritePelota.width / 2, cp.vzero));
            body.p = posicion;

            spriteFigura.setBody(body);

            shape = new cp.CircleShape(body, this.spritePelota.width / 2, cp.vzero);

            break;


        case FIGURA_TRIANGULO:

            break;


        default:

    }

    shape.setFriction(1);
    shape.setCollisionType(tipoFigura);
    espacio.addShape(shape);

    return spriteFigura;
}






