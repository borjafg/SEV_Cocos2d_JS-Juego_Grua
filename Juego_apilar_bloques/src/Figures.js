// --------------------------------------
// Creación de figuras geométricas
// --------------------------------------

var FIGURA_CUADRADO = 0;
var FIGURA_RECTANGULO_HORIZONTAL = 1;
var FIGURA_RECTANGULO_VERTICAL = 2;
var FIGURA_CIRCULO = 3;
var FIGURA_TRIANGULO = 4;


var polyContainsPoint = function(verts, px, py) {
    var numVertices = verts.length >> 1;

    var ax;
    var ay = verts[2 * numVertices - 3] - py;
    var bx = verts[2 * numVertices - 2] - px;
    var by = verts[ 2 * numVertices - 1] - py;

    var lup;

    for (var i = 0; i < numVertices; i++) {
        ax = bx;
        ay = by;

        bx = verts[2 * i] - px;
        by = verts[2 * i + 1] - py;

        if (ay == by)
            continue;

        lup = by > ay;
    }

    var depth = 0;

    for (var i = 0; i < numVertices; i++) {
        ax = bx;
        ay = by;

        bx = verts[2 * i] - px;
        by = verts[2 * i + 1] - py;

        if (ay < 0 && by < 0) continue;	 // ambos "arriba" o ambos "abajo"
        if (ay > 0 && by > 0) continue;	 // ambos "arriba" or both "abajo"
        if (ax < 0 && bx < 0) continue;  // ambos puntos a la izquierda

        if (ay == by && Math.min(ax, bx) <= 0) return true;
        if (ay == by) continue;

        var lx = ax + (bx - ax) * (-ay) / (by - ay);

        if (lx == 0) return true;  // point on edge
        if (lx > 0) depth++;
        if (ay == 0 &&  lup && by > ay) depth--;	 // hit vertex, both up
        if (ay == 0 && !lup && by < ay) depth--; // hit vertex, both down

        lup = by > ay;
    }

    //console.log(depth);
    return (depth & 1) == 1;
};


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
            console.log("==> Generado un cuadrado");

            spriteFigura = new cc.PhysicsSprite(res.figura_cuadrado_png);
            spriteFigura.tipoFigura = "Cuadrado";

            body = new cp.Body(1, cp.momentForBox(1, spriteFigura.width, spriteFigura.height));

            body.p = new cp.Vect(xPlataformaGeneracion, yPlataformaGeneracion + spriteFigura.height / 2);
            spriteFigura.setBody(body);

            shape = new cp.BoxShape(body, spriteFigura.width, spriteFigura.height);

            spriteFigura.containsPoint = function(puntoX, puntoY) {
                if (polyContainsPoint(this.body.shapeList[0].tVerts, puntoX, puntoY)) {
                    return true;
                }

                return false;
            };

            break;


        case FIGURA_RECTANGULO_HORIZONTAL:
            console.log("==> Generado un rectángulo horizontal");

            spriteFigura = new cc.PhysicsSprite(res.figura_barra_horizontal_png);
            spriteFigura.tipoFigura = "Rectángulo horizontal";

            body = new cp.Body(1, cp.momentForBox(1, spriteFigura.width, spriteFigura.height));

            body.p = new cp.Vect(xPlataformaGeneracion, yPlataformaGeneracion + spriteFigura.height / 2);
            spriteFigura.setBody(body);

            shape = new cp.BoxShape(body, spriteFigura.width, spriteFigura.height);

            spriteFigura.containsPoint = function(puntoX, puntoY) {
                if (polyContainsPoint(this.body.shapeList[0].tVerts, puntoX, puntoY)) {
                    return true;
                }

                return false;
            };

            break;


        case FIGURA_RECTANGULO_VERTICAL:
            console.log("==> Generado un rectángulo vertical");

            spriteFigura = new cc.PhysicsSprite(res.figura_barra_vertical_png);
            spriteFigura.tipoFigura = "Rectángulo vertical";

            body = new cp.Body(1, cp.momentForBox(1, spriteFigura.width, spriteFigura.height));

            body.p = new cp.Vect(xPlataformaGeneracion, yPlataformaGeneracion + spriteFigura.height / 2);
            spriteFigura.setBody(body);

            shape = new cp.BoxShape(body, spriteFigura.width, spriteFigura.height);

            spriteFigura.containsPoint = function(puntoX, puntoY) {
                if (polyContainsPoint(this.body.shapeList[0].tVerts, puntoX, puntoY)) {
                    return true;
                }

                return false;
            };

            break;


        case FIGURA_CIRCULO:
            console.log("==> Generado un círculo");

            spriteFigura = new cc.PhysicsSprite(res.figura_circulo_png);
            spriteFigura.tipoFigura = "Círculo";

            // Momento de inercia del círculo:
            // -> Masa: 1
            // -> Radio interior: al ser un círculo sólido su valor es 0
            // -> Radio exterior: la mitad del ancho del sprite
            // -> Offset (ver como se crea un triángulo)
            //
            body = new cp.Body(1, cp.momentForCircle(1, 0, spriteFigura.width / 2, cp.vzero));
            body.p = new cp.Vect(xPlataformaGeneracion, yPlataformaGeneracion + spriteFigura.height / 2);

            spriteFigura.setBody(body);

            shape = new cp.CircleShape(body, spriteFigura.width / 2, cp.vzero);

            spriteFigura.containsPoint = function(puntoX, puntoY) {
                var centro = this.body.getPos();
                var radio = this.body.shapeList[0].r;

                var distanciaCentroYpunto = Math.sqrt(Math.pow(centro.x - puntoX, 2) + Math.pow(centro.y - puntoY, 2));

                if (distanciaCentroYpunto < radio) {
                    return true;
                }

                return false;
            };

            break;


        case FIGURA_TRIANGULO:
            console.log("==> Generado un triángulo");

            spriteFigura = new cc.PhysicsSprite(res.figura_triangulo_png);
            spriteFigura.tipoFigura = "Triángulo";

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
            body.p = new cp.Vect(xPlataformaGeneracion, yPlataformaGeneracion + spriteFigura.height / 2);

            spriteFigura.setBody(body);

            shape = new cp.PolyShape(body, vertices, offset);

            spriteFigura.containsPoint = function(puntoX, puntoY) {
                if (polyContainsPoint(this.body.shapeList[0].tVerts, puntoX, puntoY)) {
                    return true;
                }

                return false;
            };

            break;


        default:
            console.log("==> Figura desconocida: generando un cuadrado");

            return generarFigura(FIGURA_CUADRADO, plataformaGenereacionBloques, espacio, capaJuego);
    }

    shape.setFriction(1);
    shape.setCollisionType(tipoFigura);

    espacio.addShape(shape);
    capaJuego.addChild(spriteFigura);

    return spriteFigura;
}






