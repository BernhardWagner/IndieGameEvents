"use strict";

var bw = bw || {};

bw.test1 = (function () {

    window.onload = function () {                             /* Unterschied Dokument on load und window onload erklären (https://stackoverflow.com/questions/588040/window-onload-vs-document-onload)*/
        var canvas = document.getElementById('canvas');
        canvas.registerIndieGameEvents({
            events: ['move-all', 'action-1', 'open-map', 'dismiss', 'zoom', 'zoom-in', 'zoom-out'],               //an action could be for example a jump
            touchDirectionController: 'joystick'
            //events: ['moveleft', 'moveup', 'movedown']          //Moverments sollten funktionieren mit move oder wirklich einzeln registrieren
        });

        var mc = new Hammer(canvas);

        //canvas.hideIndieGameTouchInterfaceWithoutX();
        /*
        canvas.addEventListener('move-right', function (e) {
           console.log("right");
           console.log(e);
        });
        canvas.addEventListener('move-up', function (e) {
            console.log("up");
        });
        canvas.addEventListener('move-left', function (e) {
            console.log("left");
        });
        canvas.addEventListener('move-down', function (e) {
            console.log("down");
        });

        canvas.addEventListener('open-map', function () {
            console.log('map-opened')
        });*/

        var i = 0;

    }
})();