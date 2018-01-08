var res = {
    HelloWorld_png : "res/HelloWorld.png",

    CloseNormal_png : "res/CloseNormal.png",
    CloseSelected_png : "res/CloseSelected.png",

    barra1_png : "res/barra_1.png",
    barra2_png : "res/barra_2.png",
    barra3_png : "res/barra_3.png",

    fondo_menu_png : "res/fondo_menu.png",
    fondo_game_png : "res/fondo_game.png",

    grua_png : "res/grua.png",

    boton_jugar_png : "res/boton_jugar.png",
    boton_reanudar_png : "res/boton_reanudar.png",
    boton_siguiente_png : "res/boton_siguiente.png",
    boton_boton_volver_jugar_png : "res/boton_volver_jugar.png",

    joypad_left_png : "res/pad_left.png",
    joypad_right_png : "res/pad_right.png",
    joypad_drag_drop_png : "res/pad_drag_and_drop.png",

    figura_cuadrado_png : "res/figura_cuadrado.png",
    figura_triangulo_png : "res/figura_triangulo.png",
    figura_circulo_png : "res/figura_circulo.png",
    figura_barra_horizontal_png : "res/figura_barra_horizontal.png",
    figura_barra_vertical_png : "res/figura_barra_vertical.png"
};

var g_resources = [];

for (var i in res) {
    g_resources.push(res[i]);
}


var res_aux = {
    barra_aux_1 : "res/barra_",
    barra_aux_2 : ".png",
}