"use strict";

var bw = bw || {};

bw.test1 = (function () {

    window.onload = function () {                             /* Unterschied Dokument on load und window onload erklären (https://stackoverflow.com/questions/588040/window-onload-vs-document-onload)*/
        var canvas = document.getElementById('canvas');
        canvas.registerIndieGameEvents({
            events: ['move-all', 'action-1', 'action-2', 'action-3', 'action-4'],               //an action could be for example a jump
            touchDirectionController: 'joystick'
            //events: ['moveleft', 'moveup', 'movedown']          //Moverments sollten funktionieren mit move oder wirklich einzeln registrieren
        });

        canvas.addEventListener('move-right', function (e) {
           // console.log(e);
        });
        var i = 0;

    }
})();