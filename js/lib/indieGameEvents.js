"use strict";

//self invoking functions und closures erklären?
(function () {
    //standard settings for the library
    var _standardSettings;


    //sets the standard settings that will be overwritten with the settings object of the user
    _standardSettings = {
        events: [],
        physicalInputs: ['keyboard', 'mouse', 'touch', 'controller'],                    //joystick?
        useWASDDirections: false,
        useArrowDirections: true,
        useEightTouchDirections: true,
        touchDirectionController: 'joystick',                                                       //virtual joystick... buttons would also be an option
        joystickType: 'static'                                                                        //when a joystick is used there are two types static and dynamic (generates joystick on touch)
    };

    HTMLCanvasElement.prototype.registerIndieGameEvents = function (settings) {             //only works on HTML5 Canvas Element, No use of Jquery (for bachelor compare select of jquery and select of vanilla javascript
        //"this" is the canvasElement

        //creates an empty object for the library
        this.indieGameEvents = {};

        //sets the settings for the events (either standard settings or user settings when defined)
        this.indieGameEvents.settings = {
            events: settings.events || _standardSettings.events,                                                        //TODO: determine that inputs are correct
            physicalInputs: settings.physicalInputs || _standardSettings.physicalInputs,
            useWASDDirections: settings.useWASDDirections || _standardSettings.useWASDDirections,
            useArrowDirections: settings.useArrowDirections || _standardSettings.useArrowDirections,
            touchDirectionController: settings.touchDirectionController || _standardSettings.touchDirectionController,
            joystickType: settings.joystickType || _standardSettings.joystickType,
            useEightTouchDirections: settings.useEightTouchDirections || _standardSettings.useEightTouchDirections
        };


        eventTranslator(this);                                                              //main function, translates the physical events to the right events

        return this.indieGameEvents; //the object where you can do something with //TODO should be there or not?
    };

    /*MAIN*/
    function eventTranslator(canvas) {
        var events = canvas.indieGameEvents.settings.events,
            physicalInput = canvas.indieGameEvents.settings.physicalInputs;

        /*directions*/
        if(events.indexOf('move-all')) {                                                     //for directions (naming scheme with -)
            registerMoveUp(canvas);
            registerMoveDown(canvas);
            registerMoveLeft(canvas);
            registerMoveRight(canvas);
        }

        else {
            if (events.indexOf('move-up')) {
                registerMoveUp(canvas);
            }

            if (events.indexOf('move-down')) {
                registerMoveDown(canvas);
            }

            if (events.indexOf('move-left')) {
                registerMoveLeft(canvas);
            }

            if (events.indexOf('move-right')) {
                registerMoveRight(canvas);
            }
        }



        /*create an interface for touch devices when the device has an touch input*/
        if((physicalInput.indexOf('touch') || physicalInput.contains('touchscreen')) && isTouchDevice()) {
            createTouchInterface(canvas);
        }
    }


    /*FOR THE DIRECTIONS*/
    function registerMoveUp(canvas) {
        canvas.indieGameEvents.directions = true;               //when at least one direction event is true the directions are set to true
    }

    function registerMoveDown(canvas) {
        canvas.indieGameEvents.directions = true;

    }

    function registerMoveLeft(canvas) {
        canvas.indieGameEvents.directions = true;

    }

    function registerMoveRight(canvas) {
        canvas.indieGameEvents.directions = true;

    }
    
    
    /*THE TOUCH INTERFACE*/
    function createTouchInterface(canvas) {                                                                 //Touch interface will be overlaid over the canvas
        var smallestJoystickValue = 100,    //min and max values so the touchpad isnt to big or small
            highestJoystickValue = 350,
            overlayRectSize = canvas.getBoundingClientRect(),                                                //gets the correct overlayRect position and size;
            events = canvas.indieGameEvents.settings.events;

        /*object for the touch interface*/
        canvas.indieGameEvents.touchInterface = {};
        var dom = canvas.indieGameEvents.touchInterface.domElements = {};

        dom.overlay = document.createElement('div');
        dom.overlay.className += 'touchInterface';

        setTouchOverlayStyle(overlayRectSize, dom);                                                          //to position the overlay


        /*if we use a joystick for the arrow directions and at least one direction event is enabled */
        if(canvas.indieGameEvents.settings.touchDirectionController === 'joystick' && canvas.indieGameEvents.directions) {
            var joystickSize = Math.min(Math.max(smallestJoystickValue, Math.min(overlayRectSize.width * 0.25, overlayRectSize.height * 0.25)), highestJoystickValue);
            //creates the dom objects for the joystick.
            //console.log(joystickSize);
            dom.joystick = {};
            dom.joystick.wrapper = document.createElement('div');
            dom.joystick.innerCircle = document.createElement('div');
            dom.joystick.outerCircle = document.createElement('div');

            dom.joystick.wrapper.className += 'joystick-wrapper';
            dom.joystick.innerCircle.className += 'joystick-inner-circle';
            dom.joystick.outerCircle.className += 'joystick-outer-circle';

            setJoystickStyle(dom, joystickSize);                                                                      //TODO resize on rezise window and orientation change

            dom.overlay.appendChild(dom.joystick.wrapper).appendChild(dom.joystick.outerCircle).parentNode.appendChild(dom.joystick.innerCircle);                           //appends the joystick to the overlay

            if (isTouchDevice()) {
               dom.joystick.wrapper.addEventListener('touchstart', function(e) {joystickTouchStartAction(e, canvas);});
                dom.joystick.wrapper.addEventListener('touchmove', function(e) {joystickMoveAction(e, canvas);});
                dom.joystick.wrapper.addEventListener('touchend', function(e) {joystickReleaseAction(e, canvas);});
            } else if (isPointer()) {
                dom.joystick.wrapper.addEventListener('pointerdown', function(e) {joystickTouchStartAction(e);});
                dom.joystick.wrapper.addEventListener('pointermove', function(e) {joystickMoveAction(e, canvas);});
                dom.joystick.wrapper.addEventListener('pointerup', function(e) {joystickReleaseAction(e, canvas);});
            } else if (isMSPointer()) {
                dom.joystick.wrapper.addEventListener('MSPointerDown', function(e) {joystickTouchStartAction(e, canvas);});
                dom.joystick.wrapper.addEventListener('MSPointerMove', function(e) {joystickMoveAction(e, canvas);});
                dom.joystick.wrapper.addEventListener('MSPointerUp', function(e) {joystickReleaseAction(e, canvas);});
            }
        }

        /* if we use buttons for the touch movements */
        else if ((canvas.indieGameEvents.settings.touchDirectionController === 'buttons' || canvas.indieGameEvents.settings.touchDirectionController === 'button' ) && canvas.indieGameEvents.directions) {
            var buttonSize = 50, buttonMargin = 2;

            dom.directionButtons = {};
            dom.directionButtons.wrapper = document.createElement('div');

            if(events.indexOf('move-up') || events.indexOf('move-all')) {
                dom.directionButtons.up = document.createElement('button');
                dom.directionButtons.up.innerHTML = "🡹";
                dom.directionButtons.up.className +=  'up-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.up);
            }
            if(events.indexOf('move-down') || events.indexOf('move-all')) {
                dom.directionButtons.down = document.createElement('button');
                dom.directionButtons.down.innerHTML = "🡻";
                dom.directionButtons.down.className += 'down-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.down);
            }

            if(events.indexOf('move-left') || events.indexOf('move-all')){
                dom.directionButtons.left = document.createElement('button');
                dom.directionButtons.left.innerHTML = "🡸";
                dom.directionButtons.left.className += 'left-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.left);
            }

            if(events.indexOf('move-right') || events.indexOf('move-all')){
                dom.directionButtons.right = document.createElement('button');
                dom.directionButtons.right.innerHTML = "🡺";
                dom.directionButtons.right.className += 'right-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.right);
            }

            if(canvas.indieGameEvents.settings.useEightTouchDirections) {
                if(events.indexOf('move-left') && events.indexOf('move-up')|| events.indexOf('move-all')){
                    dom.directionButtons.leftup = document.createElement('button');
                    dom.directionButtons.leftup.innerHTML = "🡼";
                }
            }


            dom.directionButtons.rightdown = document.createElement('button');
            dom.directionButtons.rightup = document.createElement('button');
            dom.directionButtons.leftdown = document.createElement('button');


            dom.directionButtons.rightdown.innerHTML = "🡾";
            dom.directionButtons.rightup.innerHTML = "🡽";
            dom.directionButtons.leftdown.innerHTML = "🡿";


            dom.directionButtons.leftup.className += 'leftup-button';
            dom.directionButtons.rightdown.className += 'rightdown-button';
            dom.directionButtons.rightup.className += 'rightup-button';
            dom.directionButtons.leftdown.className += 'leftdown-button';
            dom.directionButtons.wrapper.className += 'direction-buttons-wrapper';

            setTouchButtonsStyle(dom, buttonSize, buttonMargin);

            dom.directionButtons.wrapper.appendChild(dom.directionButtons.leftup);
            dom.directionButtons.wrapper.appendChild(dom.directionButtons.rightup);
            dom.directionButtons.wrapper.appendChild(dom.directionButtons.leftdown);
            dom.directionButtons.wrapper.appendChild(dom.directionButtons.rightdown);

            dom.overlay.appendChild(dom.directionButtons.wrapper);
        }


        document.body.appendChild(dom.overlay);                                                     //appends the interface directly in the body tag to prevent position relative interference
    }





    function setTouchOverlayStyle(overlayRectSize, dom) {
        //sets the style for the interface overlay                                                      //TODO on resize or orientationChange it also should work
        dom.overlay.setAttribute("style",
            "width:" + overlayRectSize.width + "px; " +
            "height:" + overlayRectSize.height + "px; " +
            "position: absolute; " +
            "z-index: 200; " +
            "left:" + overlayRectSize.left + "px; " +
            "top:" + overlayRectSize.top + "px; "
        );
    }

    function setJoystickStyle(dom, joystickSize) {                                                      //TODO add dynamic joystick
        dom.joystick.wrapper.setAttribute("style",
            "position: absolute; " +
            "width:" + joystickSize + "px; " +
            "height:" + joystickSize + "px; " +
            "left:" + 20 + "px; " +
            "bottom:" + 20 + "px; " +
            "border-radius: 50%;"
        );

        dom.joystick.outerCircle.setAttribute("style", "border-radius: 50%; width: 100%; height: 100%; position: absolute; background: black; opacity: 0.4;");                  //joystick values can be styled from outside with !important
        dom.joystick.innerCircle.setAttribute("style",  "border-radius: 50%; width: 50%; height: 50%; position: absolute; background: black; opacity: 0.3; transform: translate(-50%, -50%); top: 50%; left:50%;");
    }


    //joystick actions
    function joystickTouchStartAction(e, canvas) {
        var data = getJoystickTouchData(e);

        //out of bounce check
        if(data.yPos > 0 && data.yPos < data.parentPosition.height && data.xPos > 0 && data.xPos < data.parentPosition.width) {
            data.innerCircle.style.left = data.xPos + "px";
            data.innerCircle.style.top = data.yPos + "px";
        }

            triggerJoystickDirectionEvents(data, canvas);
    }
    
    function joystickMoveAction(e, canvas) {
        var data = getJoystickTouchData(e),
            currentPoint = {x: data.xPos, y: data.yPos},
            distance = getDistance(data.midPoint, currentPoint);

        /*if(data.xPos < 0) {
            data.xPos = 0;
        } else if(data.xPos > data.parentPosition.width) {
            data.xPos = data.parentPosition.width;
        }

        if(data.yPos < 0){
            data.yPos = 0;
        } else if (data.yPos > data.parentPosition.height){
            data.yPos = data.parentPosition.height;
        }*/

        if(distance > data.midPoint.x) {
            var vectorA = {x: data.xPos - data.midPoint.x, y: data.yPos - data.midPoint.x};
            vectorA.x = vectorA.x * data.midPoint.x/distance;
            vectorA.y = vectorA.y * data.midPoint.x/distance;

            data.xPos = vectorA.x + data.midPoint.x;
            data.yPos = vectorA.y + data.midPoint.y;
        }


        data.innerCircle.style.left = data.xPos + "px";
        data.innerCircle.style.top = data.yPos + "px";

        triggerJoystickDirectionEvents(data, canvas);

    }
    
    function joystickReleaseAction(e) {
        var data = getJoystickTouchData(e);

        data.innerCircle.style.transition = '0.2s ease';
        data.innerCircle.style.left = 50 + "%";
        data.innerCircle.style.top = 50 + "%";

        setTimeout(function () {
            data.innerCircle.style.transition = "";
        }, 200);
    }
    
    function getJoystickTouchData(e) {
        var parentPosition = e.target.offsetParent.getBoundingClientRect() || e.changedTouches[0].target.offsetParent.getBoundingClientRect();

        return {
            outerCircle : e.target.offsetParent.firstChild || e.changedTouches[0].pageX.target.offsetParent.firstChild,     //always take the first touch
            innerCircle : e.target.offsetParent.lastChild || e.changedTouches[0].pageX.target.offsetParent.lastChild,
            parentPosition :  parentPosition,
            midPoint : {x: parentPosition.width /2, y: parentPosition.height / 2},
            xPos : (e.pageX || e.changedTouches[0].pageX) - parentPosition.x,
            yPos : (e.pageY || e.changedTouches[0].pageY) - parentPosition.y
        };
    }
    
    function triggerJoystickDirectionEvents(data, canvas) {                                     //aufzeichnen wie kreis aussieht?
        var touchPoint = {x: data.xPos, y: data.yPos},
            events = canvas.indieGameEvents.settings.events,
            distance = getDistance(touchPoint, data.midPoint),
            strength = ~~distance.map(0, data.midPoint.x, 0, 100);

        if(distance > data.parentPosition.width/9) {
            var angle = getAngle(data.midPoint, touchPoint);

            if(angle < 67.5 && angle > -67.5 && (events.indexOf('move-right') || events.indexOf('move-all'))){
                //console.log('right');
                canvas.dispatchEvent(new CustomEvent('move-right', {detail: {strength: strength}}));
            }

            if(angle < 151.5 && angle > 22.5 && (events.indexOf('move-down') || events.indexOf('move-all'))){
               // console.log('down');
                canvas.dispatchEvent(new Event('move-down', {detail: {strength: strength}}));
            }

            if(((angle < -112.5 && angle < 0) || (angle > 0 && angle > 112.5)) && (events.indexOf('move-left') || events.indexOf('move-all'))) {
                //console.log('left');
                canvas.dispatchEvent(new Event('move-left', {detail: {strength: strength}}))
            }

            if(angle < -28.5 && angle > -157.5 && (events.indexOf('move-up') || events.indexOf('move-all'))) {
                //console.log('up');
                canvas.dispatchEvent(new Event('move-up', {detail: {strength: strength}}))
            }
        }
    }
    
    
    /*touch buttons*/
    function setTouchButtonsStyle(dom, buttonSize, margin) {
        var buttons, i;

        for(var key in dom.directionButtons) {
            if(dom.directionButtons.hasOwnProperty(key)) {
                if(dom.directionButtons[key] instanceof HTMLButtonElement) {
                    dom.directionButtons[key].setAttribute("style", "color: white; background-color: black; width:" + buttonSize + "px; height:" + buttonSize + "px; border: none; margin: "+ margin +"px; opacity: 0.5; border-radius: 3px;");
                }
            }
        }


        dom.directionButtons.wrapper.setAttribute("style",
            "position: absolute; " +
            "width:" + (buttonSize + 2* margin) * 3 + "px; " +
            "height:" + (buttonSize + 2* margin) * 3 + "px; " +
            "left:" + 20 + "px; " +
            "bottom:" + 20 + "px;"
        );


    }



    /* HELPING FUNCTIONS */
    function isTouchDevice() {
        return 'ontouchstart' in window;        //TODO sehen ob es funktioniert und referenz dafür im internet suchen wie das funktioniert vielleicht zu simpel?
    }

    //can you use pointer or ms pointer?
    function isPointer() {
        return !!window.PointerEvent;
    }

    function isMSPointer() {
        return !!window.MSPointerEvent;
    }


    //get angle between two points
    function getAngle(p1, p2) {
            var dx = p2.x - p1.x;
            var dy = p2.y - p1.y;

            return (Math.atan2(dy, dx)) * (180 / Math.PI);
    }

    function getDistance(p1, p2) {
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;

        return Math.sqrt((dx * dx) + (dy * dy));
    }


    /*to map numbers to a specific range*/
    Number.prototype.map = function (in_min, in_max, out_min, out_max) {
        return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    };


})();

//TODO ms pointer ansehen
//TODO indieEvents settings sind zurzeit lokal, sollte es doch lieber global, sein...macht das sinn?
//TODO Browser compatibilität testen (vielleicht gibt es tester online?)
//TODO on controller or keyboard hide touch interface


/*Custom Events (IE support)*/
(function () {
    if ( typeof window.CustomEvent === "function" ) return false; //If not IE

    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();