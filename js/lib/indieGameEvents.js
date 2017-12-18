"use strict";

//TODO add external libraries

//OWN LIBRARY
//self invoking functions und closures erklären (JA)
(function () {
    /*GLOBALS*/
    //standard settings for the library
    var _standardSettings,
        //Add Hammer.js to library
        _Hammer = Hammer,  /* hammer js */
        _gamepads,
        _gamepadAPI,        /* if the normal gamepad api is needed */
        _webkitGamepadAPI,  /*if the webkit gamepad api is neddid */
        _gamepadPolling,    /* if you are already polling for the gamepad Events*/
        _gn,            /* gyronorm js normalises gyroscope values */
        _gyroSettings,
        _fps,            /* inaccurate value of the fps */
        _lastLoop,         /* needed for the fps metering */
        _gyroCalibration;  /* calibration values for the gyroscope */


    //sets the standard settings that will be overwritten with the settings object of the user
    _standardSettings = {
        events: [],
        physicalInputs: ['keyboard', 'mouse', 'touch', 'controller'],                    //joystick?
        useWASDDirections: false,
        useArrowDirections: true,
        useEightTouchDirections: true,
        touchDirectionController: 'joystick',                                                       //virtual joystick... buttons would also be an option
        touchJoystickAccuracy: 'standard',                                                                        //when a joystick is used there are two types static and dynamic (generates joystick on touch)
        doubleTabAction1: false,                                                                    //when double tabbed on the screen the action 1 event will be triggered and on the touch interface the action 1 button does not appear
        touchDismissButton: true,                                                                   //if there should be a dismiss button when a menu is opened (only works when touch interface is active)
        menuButton: true,                                                                            //if there should be a menu button (only works when touch interface is active and open-menu event is registered)
        useGyroscope: true                                                                            //TODO gyroscope mit anfangsmeldung wenn gyroscpe verwendet
    };

    /*init of gyronorm.js*/
     _gn = new GyroNorm();

     _gyroSettings = {
         frequency: 15,
         gravityNormalized: true,
         orientationBase:GyroNorm.GAME,
         decimalCount:2,
         screenAdjusted: true
     };


     _gyroCalibration = {
         calibrate: true,
         alpha: 0,
         beta: 0,
         gamma: 0,
     };


     /* check if you can use gamepads */
    _gamepadAPI = 'GamepadEvent' in window;
    _webkitGamepadAPI = 'WebKitGamepadEvent' in window;


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
            touchJoystickAccuracy: settings.touchJoystickAccuracy || _standardSettings.touchJoystickAccuracy,
            useEightTouchDirections: settings.useEightTouchDirections || _standardSettings.useEightTouchDirections,
            doubleTapAction1: settings.doubleTabAction1 || _standardSettings.doubleTabAction1,
            touchDismissButton: settings.touchDismissButton || _standardSettings.touchDismissButton,
            menuButton: settings.menuButton || _standardSettings.menuButton,
            useGyroscope: settings.useGyroscope || _standardSettings.useGyroscope,

        };

        //TODO on keyboardpress f7 turn off touch or turn it on again when turned off

        this.indieGameEvents.hammer = new _Hammer(this, {preventDefault: true}); //registers Hammer.js for the canvas
        this.indieGameEvents.hammer.get('pinch').set({ enable: true }); //enable pinch for touch zoom
        this.indieGameEvents.hammer.get('rotate').set({ enable: true }); // enable rotate

        eventTranslator(this);                                                              //main function, translates the physical events to the right events

        return this.indieGameEvents; //the object where you can do something with //TODO should be there or not?
    };

    HTMLCanvasElement.prototype.hideIndieGameTouchInterface = function () {
        if (this.indieGameEvents.touchInterface && this.indieGameEvents.touchInterface.domElements && this.indieGameEvents.touchInterface.domElements.overlay) {
            this.indieGameEvents.touchInterface.domElements.overlay.style.display = 'none';

            if (this.indieGameEvents.touchInterface.domElements.dismissButton) {
                this.indieGameEvents.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    };

    HTMLCanvasElement.prototype.showIndieGameTouchInterface = function () {
        if (this.indieGameEvents.touchInterface && this.indieGameEvents.touchInterface.domElements && this.indieGameEvents.touchInterface.domElements.overlay) {
            this.indieGameEvents.touchInterface.domElements.overlay.style.display = 'block';

            if (this.indieGameEvents.touchInterface.domElements.dismissButton) {
                this.indieGameEvents.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    };

    HTMLCanvasElement.prototype.hideIndieGameTouchInterfaceWithoutX = function () {
        if (this.indieGameEvents.touchInterface && this.indieGameEvents.touchInterface.domElements && this.indieGameEvents.touchInterface.domElements.overlay) {
            this.indieGameEvents.touchInterface.domElements.overlay.style.display = 'none';

            if (this.indieGameEvents.touchInterface.domElements.dismissButton) {
                this.indieGameEvents.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    };

    HTMLCanvasElement.prototype.showTouchDismissButton = function () {
        if (this.indieGameEvents.touchInterface && this.indieGameEvents.touchInterface.domElements && this.indieGameEvents.touchInterface.domElements.overlay) {
            if (this.indieGameEvents.touchInterface.domElements.dismissButton) {
                this.indieGameEvents.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    };


    /*MAIN*/
    function eventTranslator(canvas) {
        var events = canvas.indieGameEvents.settings.events,
            physicalInput = canvas.indieGameEvents.settings.physicalInputs,
            boundingRect = canvas.getBoundingClientRect();


        /*directions*/
        if (events.indexOf('move-all') !== -1) {                                                     //for directions (naming scheme with -)
            registerMoveUp(canvas);
            registerMoveDown(canvas);
            registerMoveLeft(canvas);
            registerMoveRight(canvas);
        }

        else {
            if (events.indexOf('move-up') !== -1) {
                registerMoveUp(canvas);
            }

            if (events.indexOf('move-down') !== -1) {
                registerMoveDown(canvas);
            }

            if (events.indexOf('move-left') !== -1) {
                registerMoveLeft(canvas);
            }

            if (events.indexOf('move-right') !== -1) {
                registerMoveRight(canvas);
            }
        }

        if(events.indexOf('zoom') !== -1) {
            registerZoom(canvas, boundingRect);
        }

        if(events.indexOf('rotate') !== -1) {
            registerRotate(canvas, boundingRect);
        }


        //Gamepads
        if((_gamepadAPI || _webkitGamepadAPI) && (physicalInput.indexOf('controller') !== -1 || physicalInput.indexOf('gamepad') !== -1)) {
            canvas.indieGameEvents.gamepad = {};

            registerConnectionGamepadEvents(canvas);

            //if there is already a gamepad in use
            if(isGamepadConnected()) {
                getConnectedGamepadsAndPoll(canvas);
            }
        }

        //if gyroscope mode is enabled
        if (canvas.indieGameEvents.settings.useGyroscope === true && isTouchDevice()) {
            registerGyroscope(canvas);
            //https://github.com/tomgco/gyro.js
            //TODO register gyroscope (ACHTUNG funktioniert bei firefox und chrome anders deswegen gyronorm.js)
        }

        /* touch */
        /*create an interface for touch devices when the device has an touch input and no controller is connected*/
        if (!isGamepadConnected() && (physicalInput.indexOf('touch') !== -1 || physicalInput.contains('touchscreen')) && isTouchDevice()) {
            createTouchInterface(canvas, boundingRect);

            //when it fullscreen is activated
            document.addEventListener("fullscreenchange", function() {touchInterfaceFullscreenHandler(canvas.indieGameEvents.touchInterface.domElements, canvas)});
            document.addEventListener("webkitfullscreenchange", function() {touchInterfaceFullscreenHandler(canvas.indieGameEvents.touchInterface.domElements, canvas)});
            document.addEventListener("mozfullscreenchange", function() {touchInterfaceFullscreenHandler(canvas.indieGameEvents.touchInterface.domElements, canvas)});
            document.addEventListener("MSFullscreenChange", function() {touchInterfaceFullscreenHandler(canvas.indieGameEvents.touchInterface.domElements, canvas)});
        }

    }

    /*GAMEPAD */
    function getConnectedGamepadsAndPoll(canvas) {
        var gamepadKey, gamepad;

        _gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

        for (gamepadKey in _gamepads) {
            if (_gamepads.hasOwnProperty(gamepadKey) && _gamepads[gamepadKey]) {
                gamepad = _gamepads[gamepadKey];
                if (gamepad.mapping !== 'standard') {
                    console.warn('Gamepad with the id "'+ gamepad.id +'" has no standard key mapping and might not work properly');
                }
            }
        }

        //only poll gamepad events when they are available
        if(isGamepadConnected() && !_gamepadPolling){
           _gamepadPolling = true;
           pollGamepadEvents(canvas);
        }
        else if(!isGamepadConnected() && _gamepadPolling) {
            _gamepadPolling = false;
        }
    }

    //https://github.com/luser/gamepadtest/blob/master/gamepadtest.js
    function registerConnectionGamepadEvents(canvas) {
        if (_gamepadAPI) {
            window.addEventListener("gamepadconnected", function() {gamepadConnectHandler(canvas)});
            window.addEventListener("gamepaddisconnected", function() {gamepadConnectHandler(canvas)});
        } else if (_webkitGamepadAPI) {
            window.addEventListener("webkitgamepadconnected", function() {gamepadConnectHandler(canvas)});
            window.addEventListener("webkitgamepaddisconnected", function() {gamepadConnectHandler(canvas)});
        } else {
            setInterval(function () {
                getConnectedGamepadsAndPoll(canvas);
            }, 500);
        }
    }
    
    function gamepadConnectHandler(canvas) {
        getConnectedGamepadsAndPoll(canvas);
    }
    
    function pollGamepadEvents(canvas) {
        var gamepadKey, gamepad, i, button, pressed, strength, events;

        events = canvas.indieGameEvents.settings.events;

        if(_gamepadPolling) {
            _gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
            for(gamepadKey in _gamepads) {
                if(_gamepads.hasOwnProperty(gamepadKey)){
                    gamepad = _gamepads[gamepadKey];

                    if(gamepad && typeof(gamepad) === 'object') {
                        for (i = 0; i < gamepad.buttons.length; i++) {
                                button = gamepad.buttons[i];

                                pressed = button === 1.0;
                                strength = button;


                            if (typeof(button) === "object") {
                                pressed = button.pressed;
                                strength = button.value;
                            }

                            //standard key mapping...we are good to go (@see https://w3c.github.io/gamepad/#remapping)
                            if(pressed && gamepad.mapping === 'standard'){
                                standardGamepadButtonActions(i, canvas, events);
                            } else if (pressed) {                                 //oh oh not good (non standard) will be mapped for the thrustmaster dual analog 4
                                nonStandardGamepadButtonActions(i, canvas, events);
                            }
                        }

                        if(gamepad.axes){
                            if (gamepad.mapping === 'standard') {
                                for (i = 0; i < gamepad.axes.length; i++) {
                                    if ((gamepad.axes[i] > 0.1 || gamepad.axes[i] < -0.1) && (gamepad.axes[i] <= 1 && gamepad.axes[i] >= -1)) {
                                        standardGamepadAxisActions(i, canvas, events, gamepad.axes[i]);
                                    }
                                }
                            } else { //not standard key mapping
                                for (i = 0; i < gamepad.axes.length; i++) {
                                    if ((gamepad.axes[i] > 0.1 || gamepad.axes[i] < -0.1) && (gamepad.axes[i] <= 1 && gamepad.axes[i] >= -1)) {
                                        //TODO map to non standard Thrustmaster Dual Analog 4
                                        nonStandardGamepadAxisActions(i, canvas, events, gamepad.axes[i]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            canvas.indieGameEvents.gamepad.pollingID = window.requestAnimationFrame(function () { pollGamepadEvents(canvas) });
        }
        else {
            window.cancelAnimationFrame(canvas.indieGameEvents.gamepad.pollingID);
        }

    }


    function nonStandardGamepadAxisActions(i, canvas, events, gamepadAxes) {
        var event;

        //knob one
        if(i === 0) { //left and right
            if(gamepadAxes < -0.1) { //0.1 for tolearance
                event = new CustomEvent('move-left');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-right');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);
            }
        }

        if(i === 1) { //up and down
            if(gamepadAxes < -0.1) {
                event = new CustomEvent('move-up');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-down');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);
            }
        }

        //todo knob 2 use for lookaround?
        //knob two (try standard mapping)
        if(i === 2) { //left and right
            if(gamepadAxes < -0.1) {
                event = new CustomEvent('move-left');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-right');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);
            }
        }

        if(i === 3) { //up and down
            if(gamepadAxes < -0.1) {
                event = new CustomEvent('move-up');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-down');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);
            }
        }

        //knob three (non standard thrustmaster mapping)
        if(i === 5) { //left and right
            if(gamepadAxes < -0.1) {
                event = new CustomEvent('move-left');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-right');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);
            }
        }

        if(i === 6) { //up and down
            if(gamepadAxes < -0.1) {
                event = new CustomEvent('move-up');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-down');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);
            }
        }


        //knob three (non standard thrustmaster mapping)

    }

    function standardGamepadAxisActions(i, canvas, events, gamepadAxes) {
        var event;

        //knob one
        if(i === 0) { //left and right
            if(gamepadAxes < -0.1) {
                event = new CustomEvent('move-left');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-right');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);
            }
        }

        if(i === 1) { //up and down
            if(gamepadAxes < -0.1) {
                event = new CustomEvent('move-up');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-down');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);
            }
        }

    }

    function nonStandardGamepadButtonActions(i, canvas, events) {
        var event;

        // console.log('nonstandard ' + (i + 1));
        if (events.indexOf('action-1') !== -1 && i === 0) {
            event = new CustomEvent('action-1');
            canvas.dispatchEvent(event);
        }
        if (events.indexOf('action-2') !== -1 && i === 1) {
            event = new CustomEvent('action-2');
            canvas.dispatchEvent(event);
        }
        if (events.indexOf('action-3') !== -1 && i === 2) {
            event = new CustomEvent('action-3');
            canvas.dispatchEvent(event);
        }
        if (events.indexOf('action-4') !== -1 && i === 3) {
            event = new CustomEvent('action-4');
            canvas.dispatchEvent(event);
        }



        if(events.indexOf('dismiss') !== -1 && i === 8) {
            event = new CustomEvent('dismiss');
            canvas.dispatchEvent(event);

            showTouchMapButton();
            showTouchMenuButton();
            hideTouchDismissButton();
        }

        if(events.indexOf('open-menu') !== -1 && i === 9) {
            event = new CustomEvent('open-menu');
            canvas.dispatchEvent(event);

            //hide touch menu button and touch map button if they are there
            hideTouchMenuButton();
            hideTouchMapButton();
            showTouchDismissButton();
        }

        if(events.indexOf('open-map') !== -1 && i === 5) {
            event = new CustomEvent('open-map');
            canvas.dispatchEvent(event);

            hideTouchMapButton();
            showTouchDismissButton();
        }



        if(events.indexOf('zoom') !== -1) {
            if(i === 11) {
                event = new CustomEvent('zoom');
                event.scale = 0.1;
                canvas.dispatchEvent(event);
            } else if (i === 10) {
                event = new CustomEvent('zoom');
                event.scale = -0.1;
                canvas.dispatchEvent(event);
            }
        }

        if(events.indexOf('rotate') !== -1) {
            if(i === 6) {
                event = new CustomEvent('rotate');
                event.rotation = 0.1;
                canvas.dispatchEvent(event);
            } else if (i === 4) {
                event = new CustomEvent('rotate');
                event.rotation = -0.1;
                canvas.dispatchEvent(event);
            }
        }
    }

    function standardGamepadButtonActions(i, canvas, events) {
        var event;

        // console.log('nonstandard ' + (i + 1));
        if (events.indexOf('action-1') !== -1 && i === 0) {
            event = new CustomEvent('action-1');
            canvas.dispatchEvent(event);
        }
        if (events.indexOf('action-2') !== -1 && i === 2) {
            event = new CustomEvent('action-2');
            canvas.dispatchEvent(event);
        }
        if (events.indexOf('action-3') !== -1 && i === 1) {
            event = new CustomEvent('action-3');
            canvas.dispatchEvent(event);
        }
        if (events.indexOf('action-4') !== -1 && i === 3) {
            event = new CustomEvent('action-4');
            canvas.dispatchEvent(event);
        }



        if(events.indexOf('dismiss') !== -1 && i === 8) {
            event = new CustomEvent('dismiss');
            canvas.dispatchEvent(event);

            showTouchMapButton();
            showTouchMenuButton();
            hideTouchDismissButton();
        }

        if(events.indexOf('open-menu') !== -1 && i === 9) {
            event = new CustomEvent('open-menu');
            canvas.dispatchEvent(event);

            //hide touch menu button and touch map button if they are there
            hideTouchMenuButton();
            hideTouchMapButton();
            showTouchDismissButton();
        }

        if(events.indexOf('open-map') !== -1 && i === 14) {
            event = new CustomEvent('open-map');
            canvas.dispatchEvent(event);

            hideTouchMapButton();
            showTouchDismissButton();
        }



        if(events.indexOf('zoom') !== -1) {
            if(i === 11) {
                event = new CustomEvent('zoom');
                event.scale = 0.1;
                canvas.dispatchEvent(event);
            } else if (i === 10) {
                event = new CustomEvent('zoom');
                event.scale = -0.1;
                canvas.dispatchEvent(event);
            }
        }

        if(events.indexOf('rotate') !== -1) {
            if(i === 5) {
                event = new CustomEvent('rotate');
                event.rotation = 0.1;
                canvas.dispatchEvent(event);
            } else if (i === 4) {
                event = new CustomEvent('rotate');
                event.rotation = -0.1;
                canvas.dispatchEvent(event);
            }
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


    /* ZOOMING */
    function registerZoom(canvas, boundingRect) {
        var hammer = canvas.indieGameEvents.hammer,
            event,
            lastScale;

        event = new CustomEvent('zoom');

        /*touch*/
        hammer.on('pinchstart', function (e) {
            lastScale = e.scale;
        });

        hammer.on('pinchmove', function (e) {
                event.scale = e.scale - lastScale;                                                          //relative scale value (positive on zoom in and negative on zoom out)
                lastScale = e.scale;
                event.center = {x: e.center.x - boundingRect.left, y: e.center.y - boundingRect.top};
                canvas.dispatchEvent(event);
        });

        //TODO zoom on keyboard must be different then the native chrome and zoom
        //TODO strg scroll
        //TODO zoom buttons on touch interface?
        //TODO bei tastatur scale wert ist +0.5 und -0.5
    }

    /* ROTATION */
    function registerRotate(canvas, boundingRect) {
        var hammer = canvas.indieGameEvents.hammer,
            event,
            lastRotation;

        /*touch*/
        event = new CustomEvent('rotate');

        hammer.on('rotatestart', function (e) {
           lastRotation = e.rotation;
        });

        hammer.on('rotatemove', function (e) {
            event.rotation = e.rotation - lastRotation;               //relative rotation value
            lastRotation = e.rotation;
            canvas.dispatchEvent(event);
        });
    }


    /*GYROSCOPE*/
    function registerGyroscope(canvas) {
        var joystickHidden = true, buttonsHidden = true; //joysticks are hidden on standard and showed when device orientation and rotation rate is not supported

        _gn.init(_gyroSettings).then(function() {
            _gn.start(function(data){
                var orientation = screen.orientation.type || screen.mozOrientation.type || screen.msOrientation.type;

                //hides gamepad or direction buttons when gyroscope is detected (rotation of gyroscope and the device orientation)
                if(_gn.isAvailable(GyroNorm.DEVICE_ORIENTATION) !== null && _gn.isAvailable(GyroNorm.ROTATION_RATE) !== null && orientation && canvas.indieGameEvents.touchInterface) {
                    //if the joystick is available hide it, we dont neeed it on gyroMode
                    if(!joystickHidden && canvas.indieGameEvents.touchInterface.domElements.joystick) {
                        canvas.indieGameEvents.touchInterface.domElements.joystick.wrapper.style.display = 'none';
                        joystickHidden = true;
                    }

                    //same for direction buttons
                    else if(!buttonsHidden && canvas.indieGameEvents.touchInterface.domElements.directionButtons) {
                        canvas.indieGameEvents.touchInterface.domElements.directionButtons.wrapper.style.display = 'none';
                        buttonsHidden = true;
                    }

                   translateGyroscopeValues(data, canvas, orientation);

                } else if (canvas.indieGameEvents.touchInterface){
                    if(joystickHidden && canvas.indieGameEvents.touchInterface.domElements.joystick) {
                        canvas.indieGameEvents.touchInterface.domElements.joystick.wrapper.style.display = 'block';
                        joystickHidden = false;
                    }

                    //same for direction buttons
                    else if(buttonsHidden && canvas.indieGameEvents.touchInterface.domElements.directionButtons) {
                        canvas.indieGameEvents.touchInterface.domElements.directionButtons.wrapper.style.display = 'block';
                        buttonsHidden = false;
                    }
                    _gn.end(); //stop if rotation rate and device orientation is not supported (fallback to touch buttons or joystick)
                }
            });
        });
    }


    function translateGyroscopeValues(data, canvas, orientation) {
        var alpha, beta, gamma, event;

        if(_gyroCalibration.calibrate) {
            _gyroCalibration.alpha = data.do.alpha;
            _gyroCalibration.beta = data.do.beta;
            _gyroCalibration.gamma = data.do.gamma;
            _gyroCalibration.calibrate = false;
            console.log('calibrate');
        }


            alpha = data.do.alpha - _gyroCalibration.alpha;
            beta = data.do.beta - _gyroCalibration.beta;
            gamma = data.do.gamma - _gyroCalibration.gamma;


        //console.log(gamma);

        if (gamma < -10 && gamma > -90) {
            event = new CustomEvent('move-left');
            //better mapping for the strenght of the gyroscope
            if(gamma > -45) {
                event.strength = gamma.map(-10, -45, 0, 100);
            } else {
                event.strength = 100;
            }
            canvas.dispatchEvent(event);
        }
        else if (gamma > 10 && gamma < 90) {
            event = new CustomEvent('move-right');

            if(gamma < 30) {
                event.strength = gamma.map(10, 45, 0, 100);
            } else {
                event.strength = 100;
            }

            canvas.dispatchEvent(event);
        }

        if (beta < -10 && beta > -90) {
            event = new CustomEvent('move-up');

            if(beta > -30) {
                event.strength = beta.map(-10, -45, 0, 100);
            } else {
                event.strength = 100;
            }

            canvas.dispatchEvent(event);
        }
        else if (beta > 10 && beta < 90) {
            event = new CustomEvent('move-down');

            if(beta < 30) {
                event.strength = beta.map(10, 45, 0, 100);
            } else {
                event.strength = 100;
            }

            console.log(event.strength);

            canvas.dispatchEvent(event);
        }

    }


    /*THE TOUCH INTERFACE*/
    function createTouchInterface(canvas, boundingRect) {                                                                 //Touch interface will be overlaid over the canvas
        var smallestJoystickValue = 100,    //min and max values so the touchpad isnt to big or small
            highestJoystickValue = 350,
            overlayRectSize = boundingRect,                                                //gets the correct overlayRect position and size;
            events = canvas.indieGameEvents.settings.events;

        /*object for the touch interface*/
        canvas.indieGameEvents.touchInterface = {};
        var dom = canvas.indieGameEvents.touchInterface.domElements = {};

        dom.overlay = document.createElement('div');
        dom.overlay.className += 'touchInterface';

        setTouchOverlayStyle(overlayRectSize, dom);                                                          //to position the overlay

        /*if we use a joystick for the arrow directions and at least one direction event is enabled */
        if (canvas.indieGameEvents.settings.touchDirectionController === 'joystick' && canvas.indieGameEvents.directions) {
            var joystickSize = Math.min(Math.max(smallestJoystickValue, Math.min(overlayRectSize.width * 0.3, overlayRectSize.height * 0.3)), highestJoystickValue);
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

            if(canvas.indieGameEvents.settings.useGyroscope) {
                dom.joystick.wrapper.style.display = 'none';
            }

            dom.overlay.appendChild(dom.joystick.wrapper).appendChild(dom.joystick.outerCircle).parentNode.appendChild(dom.joystick.innerCircle);                           //appends the joystick to the overlay

            if (isTouchDevice()) {
                dom.joystick.wrapper.addEventListener('touchstart', function (e) {
                    joystickTouchStartAction(e, canvas);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('touchmove', function (e) {
                    joystickMoveAction(e, canvas);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('touchend', function (e) {
                    joystickReleaseAction(e, canvas);
                }, {passive: true});
            } else if (isPointer()) {
                dom.joystick.wrapper.addEventListener('pointerdown', function (e) {
                    joystickTouchStartAction(e);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('pointermove', function (e) {
                    joystickMoveAction(e, canvas);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('pointerup', function (e) {
                    joystickReleaseAction(e, canvas);
                }, {passive: true});
            } else if (isMSPointer()) {
                dom.joystick.wrapper.addEventListener('MSPointerDown', function (e) {
                    joystickTouchStartAction(e, canvas);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('MSPointerMove', function (e) {
                    joystickMoveAction(e, canvas);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('MSPointerUp', function (e) {
                    joystickReleaseAction(e, canvas);
                }, {passive: true});
            }
        }

        /* if we use buttons for the touch movements */
        else if ((canvas.indieGameEvents.settings.touchDirectionController === 'buttons' || canvas.indieGameEvents.settings.touchDirectionController === 'button' ) && canvas.indieGameEvents.directions) {
            var directionButtonSize, smallestDirectionButtonsSize = 75, highestDirectionButtonSize = 110,
                directionButtonMargin = 2, buttonEvents;

            directionButtonSize = Math.min(Math.max(smallestDirectionButtonsSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), highestDirectionButtonSize);

            dom.directionButtons = {};
            dom.directionButtons.wrapper = document.createElement('div');
            if (events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1) {
                dom.directionButtons.up = document.createElement('button');
                dom.directionButtons.up.innerHTML = "🡹";
                dom.directionButtons.up.name += dom.directionButtons.up.className += 'up-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.up);
            }
            if (events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1) {
                dom.directionButtons.down = document.createElement('button');
                dom.directionButtons.down.innerHTML = "🡻";
                dom.directionButtons.down.name += dom.directionButtons.down.className += 'down-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.down);
            }

            if (events.indexOf('move-left') !== -1 || events.indexOf('move-all') !== -1) {
                dom.directionButtons.left = document.createElement('button');
                dom.directionButtons.left.innerHTML = "🡸";
                dom.directionButtons.left.name += dom.directionButtons.left.className += 'left-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.left);
            }

            if (events.indexOf('move-right') !== -1 || events.indexOf('move-all') !== -1) {
                dom.directionButtons.right = document.createElement('button');
                dom.directionButtons.right.innerHTML = "🡺";
                dom.directionButtons.right.name += dom.directionButtons.right.className += 'right-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.right);
            }

            if (canvas.indieGameEvents.settings.useEightTouchDirections) {
                if (events.indexOf('move-left') !== -1 && events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1) {
                    dom.directionButtons.leftup = document.createElement('button');
                    dom.directionButtons.leftup.innerHTML = "🡼";
                    dom.directionButtons.leftup.name += dom.directionButtons.leftup.className += 'leftup-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.leftup);
                }

                if (events.indexOf('move-right') !== -1 && events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1) {
                    dom.directionButtons.rightdown = document.createElement('button');
                    dom.directionButtons.rightdown.innerHTML = "🡾";
                    dom.directionButtons.rightdown.name += dom.directionButtons.rightdown.className += 'rightdown-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.rightdown);
                }

                if (events.indexOf('move-right') !== -1 && events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1) {
                    dom.directionButtons.rightup = document.createElement('button');
                    dom.directionButtons.rightup.innerHTML = "🡽";
                    dom.directionButtons.rightup.name += dom.directionButtons.rightup.className += 'rightup-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.rightup);
                }

                if (events.indexOf('move-left') !== -1 && events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1) {
                    dom.directionButtons.leftdown = document.createElement('button');
                    dom.directionButtons.leftdown.innerHTML = "🡿";
                    dom.directionButtons.leftdown.name += dom.directionButtons.leftdown.className += 'leftdown-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.leftdown);
                }
            }

            buttonEvents = {
                "up-button": ["move-up"],
                "down-button": ["move-down"],
                "left-button": ["move-left"],
                "right-button": ["move-right"],
                "leftup-button": ["move-left", "move-up"],
                "rightup-button": ["move-right", "move-up"],
                "leftdown-button": ["move-left", "move-down"],
                "rightdown-button": ["move-right", "move-down"]

            };

            dom.directionButtons.wrapper.className += 'direction-buttons-wrapper';
            setTouchDirectionButtonsStyle(dom, directionButtonSize, directionButtonMargin, events);
            dom.overlay.appendChild(dom.directionButtons.wrapper);
            translateDirectionButtonEvents(dom.directionButtons.wrapper, buttonEvents, canvas);

            if(canvas.indieGameEvents.settings.useGyroscope) {
                dom.directionButtons.wrapper.style.display = 'none';
            }
        }

        if ((events.indexOf('action-1') !== -1 && !canvas.indieGameEvents.settings.doubleTabAction1) || events.indexOf('action-2') !== -1 || events.indexOf('action-3') !== -1 || events.indexOf('action-4') !== -1) {
            var smallestActionButtonValue = 60, highestActionButtonValue = 100, actionButtonSize;

            actionButtonSize = Math.min(Math.max(smallestActionButtonValue, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), highestActionButtonValue);

            dom.actionButtons = {};
            dom.actionButtons.wrapper = document.createElement('div');
            dom.actionButtons.wrapper.className += 'action-buttons-wrapper';

            if (events.indexOf('action-1') !== -1 && !canvas.indieGameEvents.settings.doubleTabAction1) {
                dom.actionButtons.action1 = document.createElement('button');
                dom.actionButtons.action1.name = 'action-1';
                dom.actionButtons.action1.className += 'action-1-button';
                dom.actionButtons.action1.innerHTML += "1";

                dom.actionButtons.wrapper.appendChild(dom.actionButtons.action1);
            }

            if (events.indexOf('action-2') !== -1) {
                dom.actionButtons.action2 = document.createElement('button');
                dom.actionButtons.action2.name = 'action-2';
                dom.actionButtons.action2.className += 'action-2-button';
                dom.actionButtons.action2.innerHTML += "2";

                dom.actionButtons.wrapper.appendChild(dom.actionButtons.action2);
            }

            if (events.indexOf('action-3') !== -1) {
                dom.actionButtons.action3 = document.createElement('button');
                dom.actionButtons.action3.name = 'action-3';
                dom.actionButtons.action3.className += 'action-3-button';
                dom.actionButtons.action3.innerHTML += "3";

                dom.actionButtons.wrapper.appendChild(dom.actionButtons.action3);
            }

            if (events.indexOf('action-4') !== -1) {
                dom.actionButtons.action4 = document.createElement('button');
                dom.actionButtons.action4.name = 'action-4';
                dom.actionButtons.action4.className += 'action-4-button';
                dom.actionButtons.action4.innerHTML += "4";

                dom.actionButtons.wrapper.appendChild(dom.actionButtons.action4);
            }


            setActionButtonsStyle(dom.actionButtons, actionButtonSize, directionButtonMargin);
            dom.overlay.appendChild(dom.actionButtons.wrapper);
            translateActionButtonEvents(dom.actionButtons.wrapper, canvas);
        }

        if (events.indexOf('open-map') !== -1) {
            var mapButtonSize, minMapButtonSize = 60, maxMapButtonSize = 100, mapButtonPosition;

            mapButtonSize = ~~Math.min(Math.max(minMapButtonSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), maxMapButtonSize);


            if (overlayRectSize.height < overlayRectSize.width && overlayRectSize.width > 600) {
                mapButtonPosition = {left: overlayRectSize.width / 2 - mapButtonSize - 10, bottom: 20};
            }

            else {
                mapButtonPosition = {
                    left: overlayRectSize.width - mapButtonSize - 30,
                    bottom: overlayRectSize.height - mapButtonSize * 2 - 50
                };
            }

            dom.mapButton = document.createElement('button');
            dom.mapButton.className += 'map-button';
            dom.mapButton.innerHTML += "M";
            dom.mapButton.setAttribute('style',
                "width:" + mapButtonSize + "px; " +
                "height:" + mapButtonSize + "px; " +
                "left:" + mapButtonPosition.left + "px; " +
                "bottom:" + mapButtonPosition.bottom + "px; " +
                "font-size:" + mapButtonSize / 2.5 + "px; " +
                "pointer-events: all; position: absolute; color: white; background-color: black; opacity: 0.5; border: none;"
            );

            dom.overlay.appendChild(dom.mapButton);

            if (isTouchDevice()) {
                dom.mapButton.addEventListener('touchstart', function (e) {
                    mapButtonStartAction(e, canvas, events, dom)
                }, {passive: true});
            } else if (isPointer()) {
                dom.mapButton.addEventListener('pointerdown', function (e) {
                    mapButtonStartAction(e, canvas, events, dom)
                }, {passive: true});
            } else if (isMSPointer()) {
                dom.mapButton.addEventListener('MSPointerDown', function (e) {
                    mapButtonStartAction(e, canvas, events, dom)
                }, {passive: true});
            }
        }


        if (events.indexOf('dismiss') !== -1 && canvas.indieGameEvents.settings.touchDismissButton) {
            var dismissButtonSize, dismissButtonMinSize = 60, dismissButtonMaxSize = 100;

            dismissButtonSize = ~~Math.min(Math.max(dismissButtonMinSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), dismissButtonMaxSize);

            dom.dismissButton = document.createElement('button');
            dom.dismissButton.className += 'dismiss-button';
            dom.dismissButton.innerHTML += "X";

            dom.dismissButton.setAttribute('style',
                "width:" + dismissButtonSize + "px; " +
                "height:" + dismissButtonSize + "px; " +
                "left:" + (20 + overlayRectSize.left) + "px; " +
                "top:" + (20 + overlayRectSize.top) + "px; " +
                "font-size:" + mapButtonSize / 2.5 + "px; " +
                "pointer-events: all; position: absolute; color: white; background-color: black; opacity: 0.5; border: none; z-index: 210; display: none;"
            );

            document.body.appendChild(dom.dismissButton);

            if (isTouchDevice()) {
                dom.dismissButton.addEventListener('touchstart', function (e) {
                    dismissButtonAction(e, canvas, dom)
                }, {passive: true});
            } else if (isPointer()) {
                dom.dismissButton.addEventListener('pointerdown', function (e) {
                    dismissButtonAction(e, canvas, dom)
                }, {passive: true});
            } else if (isMSPointer()) {
                dom.dismissButton.addEventListener('MSPointerDown', function (e) {
                    dismissButtonAction(e, canvas, dom)
                }, {passive: true});
            }
        }


        if (events.indexOf('open-menu') && canvas.indieGameEvents.settings.menuButton) {
            var menuButtonSize, menuButtonMinSize = 60, menuButtonMaxSize = 100, menuButtonPosition;

            menuButtonSize = ~~Math.min(Math.max(dismissButtonMinSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), dismissButtonMaxSize);

            if (overlayRectSize.height < overlayRectSize.width && overlayRectSize.width > 600) {
                menuButtonPosition = {left: overlayRectSize.width / 2 + 10, bottom: 20};
            }

            else {
                menuButtonPosition = {
                    left: overlayRectSize.width - menuButtonSize - 30,
                    bottom: overlayRectSize.height - menuButtonSize - 50
                };
            }

            dom.menuButton = document.createElement('button');
            dom.menuButton.className += 'menu-button';
            dom.menuButton.innerHTML += "&#9776;";                                                   //hamburger symbol: &#9776;

            dom.menuButton.setAttribute('style',
                "width:" + menuButtonSize + "px; " +
                "height:" + menuButtonSize + "px; " +
                "left:" + menuButtonPosition.left + "px; " +
                "bottom:" + menuButtonPosition.bottom + "px; " +
                "font-size:" + menuButtonSize / 2.5 + "px; " +
                "pointer-events: all; position: absolute; color: white; background-color: black; opacity: 0.5; border: none;"
            );

            dom.overlay.appendChild(dom.menuButton);

            if (isTouchDevice()) {
                dom.menuButton.addEventListener('touchstart', function (e) {
                    menuButtonStartAction(e, canvas, dom, events)
                }, {passive: true});
            } else if (isPointer()) {
                dom.menuButton.addEventListener('pointerdown', function (e) {
                    menuButtonStartAction(e, canvas, dom, events)
                }, {passive: true});
            } else if (isMSPointer()) {
                dom.menuButton.addEventListener('MSPointerDown', function (e) {
                    menuButtonStartAction(e, canvas, dom, events)
                }, {passive: true});
            }
        }


        document.body.appendChild(dom.overlay);                                                     //appends the interface directly in the body tag to prevent position relative interference
    }

    //on fullscreen change position of canvas
    function touchInterfaceFullscreenHandler(dom, canvas) {
        var canvasPosRect;

        setTimeout(function () {
            canvasPosRect  = canvas.getBoundingClientRect();

            if (parseInt(dom.overlay.style.zIndex) === 2147483647) {   //2147483647 is the max z-index value
                dom.overlay.style.zIndex = dom.overlay.oldStyle.zIndex;
                dom.overlay.style.top = canvasPosRect.top + "px";
                dom.overlay.style.left = canvasPosRect.left + "px";
            } else {
                dom.overlay.oldStyle = JSON.parse(JSON.stringify(dom.overlay.style));
                dom.overlay.style.zIndex = 2147483647;
                dom.overlay.style.top = canvasPosRect.top + "px";
                dom.overlay.style.left = canvasPosRect.left + "px";
            }
        }, 100);
    }

    function hideTouchMenuButton() {
        if(canvas.indieGameEvents.touchInterface && canvas.indieGameEvents.touchInterface.domElements && canvas.indieGameEvents.touchInterface.domElements.menuButton) {
            canvas.indieGameEvents.touchInterface.domElements.menuButton.style.display = "none";
        }
    }

    function showTouchMenuButton() {
        if(canvas.indieGameEvents.touchInterface && canvas.indieGameEvents.touchInterface.domElements && canvas.indieGameEvents.touchInterface.domElements.menuButton) {
            canvas.indieGameEvents.touchInterface.domElements.menuButton.style.display = "block";
        }
    }

    function hideTouchMapButton() {
        if(canvas.indieGameEvents.touchInterface && canvas.indieGameEvents.touchInterface.domElements && canvas.indieGameEvents.touchInterface.domElements.mapButton) {
            canvas.indieGameEvents.touchInterface.domElements.mapButton.style.display = "none";
        }
    }

    function showTouchMapButton() {
        if(canvas.indieGameEvents.touchInterface && canvas.indieGameEvents.touchInterface.domElements && canvas.indieGameEvents.touchInterface.domElements.mapButton) {
            canvas.indieGameEvents.touchInterface.domElements.mapButton.style.display = "block";
        }
    }

    function showTouchDismissButton() {
        if(canvas.indieGameEvents.touchInterface && canvas.indieGameEvents.touchInterface.domElements && canvas.indieGameEvents.touchInterface.domElements.dismissButton) {
            canvas.indieGameEvents.touchInterface.domElements.dismissButton.style.display = "block";
        }
    }

    function hideTouchDismissButton() {
        if(canvas.indieGameEvents.touchInterface && canvas.indieGameEvents.touchInterface.domElements && canvas.indieGameEvents.touchInterface.domElements.dismissButton) {
            canvas.indieGameEvents.touchInterface.domElements.dismissButton.style.display = "none";
        }
    }

    function menuButtonStartAction(e, canvas, dom, events) {
        var target = prepareTarget(e);

        if (target instanceof HTMLButtonElement) {
            canvas.dispatchEvent(createNewEvent('open-menu'));
            dom.menuButton.style.display = 'none';

            if (dom.mapButton) {
                dom.mapButton.style.display = 'none';                                   //also hides the menu button, to hide the remaining touch interface objects use canvas.hideIndieGameTouchInterfaceWithoutX();
            }

            if (events.indexOf('dismiss') !== -1 && dom.dismissButton) {
                dom.dismissButton.style.display = 'block';
            }
        }
    }


    function dismissButtonAction(e, canvas, dom) {
        var target = prepareTarget(e);

        if (target instanceof HTMLButtonElement) {
            canvas.dispatchEvent(createNewEvent('dismiss'));
            dom.dismissButton.style.display = 'none';

            if (dom.mapButton) {
                dom.mapButton.style.display = 'block';
            }
            if (dom.menuButton) {
                dom.menuButton.style.display = 'block';
            }
        }
    }

    function mapButtonStartAction(e, canvas, events, dom) {
        var target = prepareTarget(e);

        if (target instanceof HTMLButtonElement) {
            canvas.dispatchEvent(createNewEvent('open-map'));

            dom.mapButton.style.display = 'none';

            //if(dom.menuButton) {dom.menuButton.style.display = 'none'};

            if (events.indexOf('dismiss') !== -1 && dom.dismissButton) {
                dom.dismissButton.style.display = 'block';
            }
        }
    }


    function setActionButtonsStyle(actionButtons, actionButtonSize) {
        var key, i = 0, positions, normalButtonSize;

        normalButtonSize = actionButtonSize;

        if (actionButtons.action1 && actionButtons.action2 && !actionButtons.action3 && !actionButtons.action4) {
            actionButtonSize *= 1.2;
            positions = [{top: actionButtonSize * 1.5, left: 0}, {
                top: actionButtonSize / 1.5,
                left: actionButtonSize * 1.5
            }];
        }
        else if (countPropertiesInObject(actionButtons) === 2) {
            actionButtonSize *= 1.5;
            positions = [{top: actionButtonSize, left: actionButtonSize / 2}];
        }
        else {
            positions = [{top: actionButtonSize * 2, left: actionButtonSize}, {
                top: actionButtonSize,
                left: 0
            }, {top: actionButtonSize, left: actionButtonSize * 2}, {top: 0, left: actionButtonSize}]
        }

        for (key in actionButtons) {
            if (actionButtons.hasOwnProperty(key) && actionButtons[key] instanceof HTMLButtonElement) {
                actionButtons[key].setAttribute('style',
                    "position: absolute; " +
                    "width:" + actionButtonSize + "px; " +
                    "height:" + actionButtonSize + "px;" +
                    "left:" + positions[i].left + "px;" +
                    "top:" + positions[i].top + "px; " +
                    "border-radius: 50%; " +
                    "font-size:" + (actionButtonSize - actionButtonSize / 1.5) + "px; " +
                    "border: none; background-color: black; opacity: 0.5; color: white; pointer-events: all;"
                );
                i++;
            }
        }

        actionButtonSize = normalButtonSize;

        actionButtons.wrapper.setAttribute('style',
            "position: absolute; " +
            "width:" + actionButtonSize * 3 + "px; " +
            "height:" + actionButtonSize * 3 + "px;" +
            "bottom:" + 20 + "px;" +
            "right:" + 20 + "px"
        );
    }

    function translateActionButtonEvents(buttonField, canvas) {
        if (isTouchDevice()) {
            buttonField.addEventListener('touchstart', function (e) {
                actionTouchButtonStartAction(e, buttonField, canvas)
            }, {passive: true});
            buttonField.addEventListener('touchend', function (e) {
                actionTouchButtonEndAction(e, buttonField, canvas)
            }, {passive: true});
        } else if (isPointer()) {
            buttonField.addEventListener('pointerdown', function (e) {
                actionTouchButtonStartAction(e, buttonField, canvas)
            }, {passive: true});
            buttonField.addEventListener('pointerup', function (e) {
                actionTouchButtonEndAction(e, buttonField, canvas)
            }, {passive: true});
        } else if (isMSPointer()) {
            buttonField.addEventListener('MSPointerDown', function (e) {
                actionTouchButtonStartAction(e, buttonField, canvas)
            }, {passive: true});
            buttonField.addEventListener('MSPointerUp', function (e) {
                actionTouchButtonEndAction(e, buttonField, canvas)
            }, {passive: true});
        }
    }

    function actionTouchButtonStartAction(e, buttonField, canvas) {
        var targets = {}, i;

        if (e.changedTouches[0].target) {
            i = 0;
            for (var touch in e.changedTouches) {
                if (e.changedTouches.hasOwnProperty(touch) && e.changedTouches[touch].target) {
                    targets[i] = e.changedTouches[touch].target;
                    i++;
                }
            }
        } else if (e.target) {
            targets[0] = e.target;
        }

        for (var target in targets) {
            if (targets.hasOwnProperty(target)) {
                targets[target].buttonPressed = window.requestAnimationFrame(function () {
                    actionTouchButtonEventDispatchLoop(targets[target], buttonField, canvas)
                });
            }

        }
    }

    function actionTouchButtonEventDispatchLoop(target, buttonField ,canvas) {
        if (target instanceof HTMLButtonElement && target.name) {
            canvas.dispatchEvent(createNewEvent(target.name));

            if(target.buttonPressed){
                target.buttonPressed = window.requestAnimationFrame(function () {actionTouchButtonEventDispatchLoop(target, buttonField, canvas)});
            }
        }
    }

    function actionTouchButtonEndAction(e, buttonField, canvas) {
        var targets = {}, i;

        if(e.changedTouches[0].target) {
            i = 0;
            for(var touch in e.changedTouches) {
                if(e.changedTouches.hasOwnProperty(touch) && e.changedTouches[touch].target) {
                   targets[i] = e.changedTouches[touch].target;
                   i++;
                }
            }
        } else if(e.target) {
            targets[0] = e.target;
        }

        //cancel all event frame loops
        for(var target in targets) {
            if(targets.hasOwnProperty(target)) {
                if (targets[target].buttonPressed) {
                    window.cancelAnimationFrame(targets[target].buttonPressed);
                    targets[target].buttonPressed = false;
                }
            }
        }
    }


    function setTouchOverlayStyle(overlayRectSize, dom) {
        //sets the style for the interface overlay                                                      //TODO on resize or orientationChange it also should work
        dom.overlay.setAttribute("style",
            "width:" + overlayRectSize.width + "px; " +
            "height:" + overlayRectSize.height + "px; " +
            "position: absolute; " +
            "z-index: 200; " +
            "left:" + overlayRectSize.left + "px; " +
            "top:" + overlayRectSize.top + "px; " +
            "pointer-events: none;"
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

        dom.joystick.outerCircle.setAttribute("style", "pointer-events: all; border-radius: 50%; width: 100%; height: 100%; position: absolute; background: black; opacity: 0.4;");                  //joystick values can be styled from outside with !important
        dom.joystick.innerCircle.setAttribute("style", "pointer-events: all; border-radius: 50%; width: 50%; height: 50%; position: absolute; background: black; opacity: 0.3; transform: translate(-50%, -50%); top: 50%; left:50%;");
    }


    //joystick actions
    function joystickTouchStartAction(e, canvas) {
        var data = getJoystickTouchData(e);

        //out of bounce check
        if (data.yPos > 0 && data.yPos < data.parentPosition.height && data.xPos > 0 && data.xPos < data.parentPosition.width) {
            data.innerCircle.style.left = data.xPos + "px";
            data.innerCircle.style.top = data.yPos + "px";
        }

        if (!data.innerCircle.eventDispatchID) {
            data.innerCircle.eventDispatchID = window.requestAnimationFrame(function() {triggerJoystickDirectionEvents(data, canvas)});
        }
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

        if (distance > data.midPoint.x) {
            var vectorA = {x: data.xPos - data.midPoint.x, y: data.yPos - data.midPoint.x};
            vectorA.x = vectorA.x * data.midPoint.x / distance;
            vectorA.y = vectorA.y * data.midPoint.x / distance;

            data.xPos = vectorA.x + data.midPoint.x;
            data.yPos = vectorA.y + data.midPoint.y;
        }

        window.cancelAnimationFrame(data.innerCircle.eventDispatchID);

        data.innerCircle.eventDispatchID = window.requestAnimationFrame(function() {triggerJoystickDirectionEvents(data, canvas)});


        data.innerCircle.style.left = data.xPos + "px";
        data.innerCircle.style.top = data.yPos + "px";
    }

    function joystickReleaseAction(e) {
        var data = getJoystickTouchData(e);

        data.innerCircle.style.transition = '0.2s ease';
        data.innerCircle.style.left = 50 + "%";
        data.innerCircle.style.top = 50 + "%";

        setTimeout(function () {
            data.innerCircle.style.transition = "";
        }, 200);

        window.cancelAnimationFrame(data.innerCircle.eventDispatchID);
        data.innerCircle.eventDispatchID = null;
    }

    function getJoystickTouchData(e) {
        var parentPosition = e.target.offsetParent.getBoundingClientRect() || e.changedTouches[0].target.offsetParent.getBoundingClientRect();

        return {
            outerCircle: e.target.offsetParent.firstChild || e.changedTouches[0].target.offsetParent.firstChild,     //always take the first touch (ignore multitouch for this element)
            innerCircle: e.target.offsetParent.lastChild || e.changedTouches[0].target.offsetParent.lastChild,
            parentPosition: parentPosition,
            midPoint: {x: parentPosition.width / 2, y: parentPosition.height / 2},
            xPos: (e.pageX || e.changedTouches[0].pageX) - (parentPosition.x || parentPosition.left),
            yPos: (e.pageY || e.changedTouches[0].pageY) - (parentPosition.y || parentPosition.top)
        };
    }

    function triggerJoystickDirectionEvents(data, canvas) {                                     //aufzeichnen wie kreis aussieht?
        var touchPoint = {x: data.xPos, y: data.yPos},
            events = canvas.indieGameEvents.settings.events,
            distance = getDistance(touchPoint, data.midPoint),
            strength = ~~distance.map(0, data.midPoint.x, 0, 100),
            event,
            strengthDampen;

        //less accurate (standard mode)
        if(canvas.indieGameEvents.settings.touchJoystickAccuracy === 'standard' || !canvas.indieGameEvents.settings.touchJoystickAccuracy) {
            if (distance > data.parentPosition.width / 9) {
                var angle = getAngle(data.midPoint, touchPoint);

                if (angle < 67.5 && angle > -67.5 && (events.indexOf('move-right') !== -1 || events.indexOf('move-all') !== -1)) {
                    //console.log('right');
                    event = new CustomEvent('move-right');
                    event.strength = strength;
                    canvas.dispatchEvent(event);
                }

                if (angle < 151.5 && angle > 22.5 && (events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1)) {
                    // console.log('down');
                    event = new CustomEvent('move-down');
                    event.strength = strength;
                    canvas.dispatchEvent(event);
                }

                if (((angle < -112.5 && angle < 0) || (angle > 0 && angle > 112.5)) && (events.indexOf('move-left') !== -1 || events.indexOf('move-all') !== -1)) {
                    //console.log('left');
                    event = new CustomEvent('move-left');
                    event.strength = strength;
                    canvas.dispatchEvent(event);
                }

                if (angle < -28.5 && angle > -157.5 && (events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1)) {
                    //console.log('up');
                    event = new CustomEvent('move-up');
                    event.strength = strength;
                    canvas.dispatchEvent(event);
                }
            }
        }

        //accurate mode (smooth)
        else if(canvas.indieGameEvents.settings.touchJoystickAccuracy === 'smooth' || canvas.indieGameEvents.settings.touchJoystickAccuracy === 'Smooth') {
            if (distance > data.parentPosition.width / 9) {
                var angle = getAngle(data.midPoint, touchPoint);

                if (angle < 90 && angle > -90 && (events.indexOf('move-right') !== -1 || events.indexOf('move-all') !== -1)) {
                    //console.log('right');
                    event = new CustomEvent('move-right');

                    //keep 100 strength for a time then fall off when angle is to low/high
                    if(angle > 45 || angle < -45) {
                        strengthDampen = (angle > 0) ? angle.map(90, 45, 0, 1): angle.map(-90, -45, 0, 1);
                    } else {strengthDampen = 1}

                    event.strength = strength * strengthDampen;
                    canvas.dispatchEvent(event);
                }

                if (angle < 180 && angle > 0 && (events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1)) {
                    // console.log('down');
                    event = new CustomEvent('move-down');

                    //keep 100 strength for a time then fall off when angle is to low/high
                    if(angle > 135 || angle < 45) {
                        strengthDampen = (angle > 90) ? angle.map(180, 135, 0, 1): angle.map(0, 45, 0, 1);
                    } else {strengthDampen = 1}

                    event.strength = strength * strengthDampen;
                    canvas.dispatchEvent(event);
                }

                if (((angle < -90 && angle < 0) || (angle > 0 && angle > 90)) && (events.indexOf('move-left') !== -1 || events.indexOf('move-all') !== -1)) {
                    event = new CustomEvent('move-left');

                    if((angle > -135 && angle < 0) || (angle < 135 && angle > 0)) {
                        strengthDampen = (angle < -90) ? angle.map(-90, -135, 0, 1): angle.map(90, 135, 0, 1);
                    } else {strengthDampen = 1}

                    event.strength = strength * strengthDampen;
                    canvas.dispatchEvent(event);
                   // console.log(angle);
                }

                if (angle < 0 && angle > -180 && (events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1)) {
                    //console.log('up');
                    event = new CustomEvent('move-up');

                    //keep 100 strength for a time then fall off when angle is to low/high
                    if(angle > -45 || angle < -135) {
                        strengthDampen = (angle < -90) ? angle.map(-180, -135, 0, 1): angle.map(0, -45, 0, 1);
                    } else {strengthDampen = 1}

                    event.strength = strength * strengthDampen;
                    canvas.dispatchEvent(event);
                }
            }
        }

        data.innerCircle.eventDispatchID = window.requestAnimationFrame(function() {triggerJoystickDirectionEvents(data, canvas)});
    }


    /*touch buttons*/
    function setTouchDirectionButtonsStyle(dom, buttonSize, margin, events) {
        var positions, leftRightBig = 0, upDownBig = 0;

        if (!(dom.directionButtons.rightup || dom.directionButtons.up || dom.directionButtons.leftup || dom.directionButtons.leftdown || dom.directionButtons.down || dom.directionButtons.rightdown)) {
            leftRightBig = buttonSize;
        }
        else if (!(dom.directionButtons.rightup || dom.directionButtons.right || dom.directionButtons.leftup || dom.directionButtons.leftdown || dom.directionButtons.left || dom.directionButtons.rightdown)) {
            upDownBig = buttonSize;
        }

        positions = {
            up: {top: 0, left: (buttonSize + margin * 2)},
            down: {top: (buttonSize + margin * 2) * 2 - upDownBig / 4, left: (buttonSize + margin * 2)},
            left: {top: (buttonSize + margin * 2), left: 0},
            right: {top: (buttonSize + margin * 2), left: (buttonSize + margin * 2) * 2 - leftRightBig / 4},
            leftup: {top: 0, left: 0},
            rightdown: {top: (buttonSize + margin * 2) * 2, left: (buttonSize + margin * 2) * 2},
            rightup: {top: 0, left: (buttonSize + margin * 2) * 2},
            leftdown: {top: (buttonSize + margin * 2) * 2, left: 0},
        };

        for (var key in dom.directionButtons) {
            if (dom.directionButtons.hasOwnProperty(key)) {
                if (dom.directionButtons[key] instanceof HTMLButtonElement) {
                    dom.directionButtons[key].setAttribute("style", "pointer-events: all; position: absolute; color: white; background-color: black; width:" + (buttonSize + leftRightBig / 4 + upDownBig * 2) + "px; height:" + (buttonSize + (leftRightBig * 2) + upDownBig / 4) + "px; border: none; margin: " + margin + "px; opacity: 0.5; border-radius: 3px; top:" + (positions[key].top - leftRightBig) + "px; left:" + (positions[key].left - upDownBig) + "px;");
                }
            }
        }

        dom.directionButtons.wrapper.setAttribute("style",
            "position: absolute; " +
            "width:" + (buttonSize + 2 * margin) * 3 + "px; " +
            "height:" + (buttonSize + 2 * margin) * 3 + "px; " +
            "left:" + 20 + "px; " +
            "bottom:" + 20 + "px;"
        );
    }

    //translate the Events of the touch press to abstract events
    function translateDirectionButtonEvents(buttonField, buttonEvents, canvas) {
        if (isTouchDevice()) {
            buttonField.addEventListener('touchstart', function (e) {
                buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents)
            }, {passive: true});
            // buttonField.addEventListener('touchmove', function(e) {buttonFieldTouchMoveAction(e, buttonField, canvas, buttonEvents)});
            buttonField.addEventListener('touchend', function (e) {
                buttonFieldTouchEndAction(e, buttonField, canvas, buttonEvents)
            }, {passive: true});
        } else if (isPointer()) {
            buttonField.addEventListener('pointerdown', function (e) {
                buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents)
            }, {passive: true});
            // buttonField.addEventListener('pointermove', function(e) {buttonFieldTouchMoveAction(e, buttonField, canvas, buttonEvents)});
            buttonField.addEventListener('pointerup', function (e) {
                buttonFieldTouchEndAction(e, buttonField, canvas, buttonEvents)
            }, {passive: true});
        } else if (isMSPointer()) {
            buttonField.addEventListener('MSPointerDown', function (e) {
                buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents)
            }, {passive: true});
            //  buttonField.addEventListener('MSPointerMove', function(e) {buttonFieldTouchMoveAction(e, buttonField, canvas, buttonEvents)});
            buttonField.addEventListener('MSPointerUp', function (e) {
                buttonFieldTouchEndAction(e, buttonField, canvas, buttonEvents)
            }, {passive: true});
        }
    }

    function buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents) {
        var target = prepareTarget(e);

        if (!buttonField.eventDispatcherID) {
            buttonField.eventDispatcherID = window.requestAnimationFrame(function () {
                dispatchMoveButtonEvents(target, canvas, buttonEvents, buttonField)
            });           //only one touch counts
        }
    }

    function buttonFieldTouchEndAction(e, buttonField) {
        window.cancelAnimationFrame(buttonField.eventDispatcherID);
        buttonField.eventDispatcherID = null;
    }

    function dispatchMoveButtonEvents(target, canvas, buttonEvents, buttonField) {

        if (target.name) {
            for (var key in buttonEvents[target.name]) {
                if (buttonEvents[target.name].hasOwnProperty(key)) {
                    canvas.dispatchEvent(createNewEvent(buttonEvents[target.name][key]));
                }
            }
        }

        if (buttonField.eventDispatcherID) {
            window.requestAnimationFrame(function () {
                dispatchMoveButtonEvents(target, canvas, buttonEvents, buttonField)
            });
        }
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

    function prepareTarget(e) {
        return e.target || e.changedTouches[0].target;
    }

    function containsOnlyOne(values, array) {
        var i, valNumber;

        valNumber = 0;

        for (i = 0; i < array.length; i++) {
            if (values.indexOf(array[i]) !== -1) {
                valNumber++;
            }
        }

        return valNumber === 1;
    }

    function countPropertiesInObject(obj) {
        var count = 0;

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                ++count;
        }

        return count;
    }

    /* internet explorer workaround */
    function createNewEvent(eventName) {
        var event;
        if (typeof(Event) === 'function') {
            event = new Event(eventName);
        } else {
            event = document.createEvent('Event');
            event.initEvent(eventName, true, true);
        }

        return event;
    }

    /*https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API*/

    /*Checks if at least one gamepad is connected*/
    function isGamepadConnected() {
        if (_gamepads) {
            for (var i = 0; i < _gamepads.length; i++) {
                if (_gamepads[i]) {
                    return true;
                }
            }
        }
        return false;
    }


    //getInaccureateFPS
    function getInaccurateFPS(lastLoop) {
        return 1000 / new Date - lastLoop;
    }


    //deg to rad
    Math.radians = function(degrees) {
        return degrees * Math.PI / 180;
    };


    /*to map numbers to a specific range*/
    Number.prototype.map = function (in_min, in_max, out_min, out_max) {
        return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    };


})();

//TODO indieEvents settings sind zurzeit lokal, sollte es doch lieber global, sein...macht das sinn?
//TODO Browser compatibilität testen (vielleicht gibt es tester online?)
//TODO on controller or keyboard hide touch interface
//TODO touch listen ansehen!!
//TODO nicht css pointer events vergessen bei den wrappern
//TODO hochformat und querformat bei touch interface beachten
//TODO scrollen und drehen nicht vergessen
//TODO swipe for movements?
//TODO gyroscope doesent work right
//TODO fullscreen?
//TODO testen welche Gamepads funktionieren mit der standard mapping und welche nicht
//TODO pfeiltasten und zweiten controller knopf für look direction verwenden (look-up, look-left, look-down, look-right, look-all) und bei touch zweiten joystick generieren???

/*Custom Events (IE support)*/
(function () {
    if (typeof window.CustomEvent === "function") return false; //If not IE

    function CustomEvent(event, params) {
        params = params || {bubbles: false, cancelable: false, detail: undefined};
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();