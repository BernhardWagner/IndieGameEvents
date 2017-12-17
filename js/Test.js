"use strict";

var bw = bw || {};

bw.test1 = (function () {

    window.onload = function () {                             /* Unterschied Dokument on load und window onload erklären (https://stackoverflow.com/questions/588040/window-onload-vs-document-onload)*/
        var canvas = document.getElementById('canvas'),
            ctx = canvas.getContext("2d");
        canvas.registerIndieGameEvents({
            events: ['move-all', 'action-1', 'action-2', 'action-3', 'open-map', 'open-menu', 'dismiss', 'zoom', 'rotate'],               //an action could be for example a jump
            touchDirectionController: 'joystick'
            //events: ['moveleft', 'moveup', 'movedown']          //Moverments sollten funktionieren mit move oder wirklich einzeln registrieren
        });

        //bei zoom unt rotate event immer += verwenden für value

        var x = 50, y = 50, zoom = 1;

        canvas.addEventListener('move-right', function (e) {
           console.log("right");
           console.log(e.strength);
           x += e.strength;
        });
        canvas.addEventListener('move-up', function (e) {
            console.log("up");
            y -= e.strength;
        });

        canvas.addEventListener('move-left', function (e) {
            console.log("left");
            console.log(e.strength);
            x -= e.strength;
        });

        canvas.addEventListener('move-down', function (e) {
            console.log("down");
            y += e.strength;
        });

        canvas.addEventListener('open-map', function () {
            console.log('map-opened')
        });

        canvas.addEventListener('rotate', function (e) {
           console.log(e.scale);
           zoom += e.rotation;
        });

        canvas.addEventListener('action-2', function () {
            console.log("action2");
        });

        canvas.addEventListener('action-3', function () {
            console.log("action3");
        });

        canvas.addEventListener('action-4', function () {
            console.log("action4");
        });

        draw();

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(x, y, 20 * zoom, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'green';
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#003300';
            ctx.stroke();

            var i = 0;

            requestAnimationFrame(draw);
        }

    }
})();