// --------------------------------------
// Creación de figuras geométricas
// --------------------------------------

var FIGURA_CUADRADO = 0;
var FIGURA_RECTANGULO_HORIZONTAL = 1;
var FIGURA_RECTANGULO_VERTICAL = 2;
var FIGURA_CIRCULO = 3;
var FIGURA_TRIANGULO = 4;


generarFigura = function(tipoFiguraGenerar, plataformaGenereacionBloques, espacio, capaJuego) {

    var spriteFigura;
    var body;
    var shape;

    // Coordenadas del centro de la parte superior
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
            spriteFigura = new cc.PhysicsSprite(res.figura_circulo_png);

            // Momento de inercia del círculo:
            // -> Masa: 1
            // -> Radio interior: al ser un círculo sólido su valor es 0
            // -> Radio exterior: la mitad del ancho del sprite
            // -> Offset (ver como se crea un triángulo)
            //
            body = new cp.Body(1, cp.momentForCircle(1, 0, spriteFigura.width / 2, cp.vzero));
            body.p = cc.p(xPlataformaGeneracion, yPlataformaGeneracion + spriteFigura.height / 2);

            spriteFigura.setBody(body);

            shape = new cp.CircleShape(body, spriteFigura.width / 2, cp.vzero);

            break;


        case FIGURA_TRIANGULO:
            spriteFigura = new cc.PhysicsSprite(res.figura_triangulo_png);

            // Hay que definir los vértices en el
            // sentido de las agujas del reloj
            //
            // El punto (0,0) será la posición del
            // sprite en el espacio (el centro del
            // sprite), a no ser que se defina
            // un offset
            //
            var vertices = [];

            vertices.push(0); // x1
            vertices.push(0); // y1

            vertices.push(spriteFigura.width / 2);  // x2
            vertices.push(spriteFigura.height);     // y2

            vertices.push(spriteFigura.width);  // x3
            vertices.push(0);                   // y3

            // El offset (desplazamiento) es un valor que se suma
            // a cada vértice a la hora de calcular las colisiones
            //
            // Por ejemplo, la figura podría estar desplazada hacia arriba
            // en el sprite. Este parámetro permite que se definan los
            // vértices respecto al punto (0,0) y luego sumar un valor a
            // la coordenada Y para para que cada vértice encaje con los
            // de la figura en el sprite.
            //
            var offset = new cp.Vect(-spriteFigura.width / 2, -spriteFigura.height / 2);

            body = new cp.Body(1, cp.momentForPoly(1, vertices, cp.vzero));
            body.p = cc.p(xPlataformaGeneracion, yPlataformaGeneracion + spriteFigura.height / 2);

            spriteFigura.setBody(body);


            shape = new cp.PolyShape(body, vertices, offset);

            break;


        default:
            return generarFigura(FIGURA_CUADRADO, plataformaGenereacionBloques, espacio, capaJuego);
    }

    shape.setFriction(1);
    shape.setCollisionType(tipoFigura);

    espacio.addShape(shape);
    capaJuego.addChild(spriteFigura);

    return spriteFigura;
}






