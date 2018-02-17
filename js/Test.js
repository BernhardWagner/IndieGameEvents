"use strict";

var bw = bw || {};

bw.test1 = (function () {

    window.onload = function () {                             /* Unterschied Dokument on load und window onload erklären (https://stackoverflow.com/questions/588040/window-onload-vs-document-onload)*/
        var canvas = document.getElementById('canvas'),
            ctx = canvas.getContext("2d");
        indieGameEvents.register(canvas,{
            events: ['move-all', 'action-1', 'action-2', 'action-3', 'action-4', 'open-map', 'open-menu', 'dismiss', 'zoom', 'rotate'],               //an action could be for example a jump //zooming with keybaord + and - //keyboard rotate with numpad / * or i o
            touchDirectionController: 'buttons',
            touchJoystickAccuracy: 'smooth', //stength of the touch controller directions will get more accurate //smooth directions
            useWASDDirections: true,
            //events: ['moveleft', 'moveup', 'movedown']          //Moverments sollten funktionieren mit move oder wirklich einzeln registrieren
        });



        //bei zoom unt rotate event immer += verwenden für value

        // canvas.onclick = function () {
        //     if (canvas.requestFullscreen) {
        //         canvas.requestFullscreen();
        //     } else if (canvas.msRequestFullscreen) {
        //         canvas.msRequestFullscreen();
        //     } else if (canvas.mozRequestFullScreen) {
        //         canvas.mozRequestFullScreen();
        //     } else if (canvas.webkitRequestFullscreen) {
        //         canvas.webkitRequestFullscreen();
        //     }
        // };

        var x = 500, y = 200, zoom = 1;

        canvas.addEventListener('move-right', function (e) {
           //console.log("right");
           console.log(e);
           x += e.strength/100;
        });
        canvas.addEventListener('move-up', function (e) {
            //console.log("up");
            y -= e.strength/100;
        });

        canvas.addEventListener('move-left', function (e) {
           // console.log("left");
           //console.log(e.strength);
            x -= e.strength/100;
        });

        canvas.addEventListener('move-down', function (e) {
           // console.log("down");
            //console.log(e.strength);
            y += e.strength/100;
        });

        canvas.addEventListener('open-map', function () {
            console.log('map-opened')
        });

        canvas.addEventListener('zoom', function (e) {
           console.log(e.scale);
           zoom += e.scale;
        });

        canvas.addEventListener('rotate', function (e) {
            console.log(e.rotation);
            zoom += e.rotation;
        });

        canvas.addEventListener('action-1', function () {
            console.log("action1");
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

        canvas.addEventListener('dismiss', function () {
            console.log("dismiss");
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