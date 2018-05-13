"use strict";

//OWN LIBRARY:
/*****************/
/*IndieGameEvents*/
/*****************/

//IIFE (JS - Module Pattern)
//Main library Object
var indieGameEvents = (function () {

    var _standardSettings,       /* standard settings for the library, they will be used when an setting is not stated in the register-function */
        _Hammer = Hammer,        /* hammer js */
        _gamepads,               /*in this variable there will be saved the connected gamepads */
        _gamepadAPI,             /* if the normal gamepad api is needed */
        _webkitGamepadAPI,       /*if the webkit gamepad api is needed */
        _gamepadPolling,         /* if you are already polling for the gamepad Events*/
        _gn,                     /* gyronorm js normalises gyroscope values */
        _gyroSettings,           /* settings for the gyronorm API */
        _gyroCalibration,        /* calibration values for the gyroscope */
        _openMenuAllowed,        /* do not trigger open menu every frame */
        _openMapAllowed,         /* do not trigger open map every frame */
        _dismissAllowed;         /* do not trigger dismiss every frame */


    //sets the standard settings that will be overwritten with the settings object of the user
    _standardSettings = {
        events: ['move-all', 'action-1', 'action-2', 'action-3', 'action-4'],                       /* values are available */
        physicalInputs: ['keyboard', 'mouse', 'touch', 'controller'],                               /* all possible devices will be used */
        useWASDDirections: false,                                                                   /* the W A S D keys will not be used for keyboard movement controls */
        useArrowDirections: true,                                                                   /* use the arrow keyboard keys for the move-events */
        useEightTouchDirections: true,                                                              /* all values are available */
        touchDirectionController: 'joystick',                                                       /* a virtual joystick will be used for the touch overlay for the movement controls buttons would also be an option) */
        touchJoystickAccuracy: 'standard',                                                          /* when a joystick is used, use the standard accuracy (smooth would also be an option) */
        touchDismissButton: true,                                                                   /* there should be a dismiss button when a menu is opened (only works when touch interface is active) */
        menuButton: true,                                                                           /* there should be a menu button (only works when touch interface is active and open-menu event is registered) */
        useGyroscope: false,                                                                        /* by default dont use the gyroscope for the move-events (if activated no virtual move button or joystick will be awailable for touc */
        useSpaceStrgAltShiftActions: true,                                                          /* true use the space key for action 1, strg for action 2, alt for action 3 and shift for action 4 - else the action keys on a keyboard are 1,2,3,4 numbers and h,j,k,l */
        enterAction1Key: false,                                                                     /* to support remote controls better: adds the enter key to trigger the action1 event */
    };

    /*init of gyronorm.js*/
     _gn = new GyroNorm();

    /* sets the settings for the gyronorm js api */
     _gyroSettings = {
         frequency: 15,                 /* how often the data will be refreshed*/
         gravityNormalized: true,       /* how often the data will be refreshed*/
         orientationBase:GyroNorm.GAME, /* how the alpha values should be (based on absolute or relative values) */
         decimalCount:2,                /* number accuracy */
         screenAdjusted: true           /* if set to true it will return screen adjusted values.*/
     };


     /* is used for the calibration of the gyroscope */
     _gyroCalibration = {
         calibrate: true,
         alpha: 0,
         beta: 0,
         gamma: 0,
     };


     /* check if you can use gamepads */
    _gamepadAPI = 'GamepadEvent' in window;
    _webkitGamepadAPI = 'WebKitGamepadEvent' in window;

    /*----Main Initialisation API Function-----
     * @param element: HTML5-Canvas element (no other is allowed)
     * @param settings: a settings object to override the standard settings
     * @returs: an object that represents the input abstraction for this element (can be used on other API functions to refer to the registered canvas and its abstraction
     * */

    function registerIndieGameEvents (element, settings) {
        var indieGameEventsObject;

        //error handling
        if(!(element instanceof HTMLCanvasElement)) {
            throw new TypeError("IndieGameEvents: You can only register HTML5 Canvas Elements");
        }

        if(element.classList.contains("indie-game-events")) {
            throw new Error("IndieGameEvents: Element is already registerd")
        }

        element.classList.add("indie-game-events");

        //creates an empty object for the library
        indieGameEventsObject = {};

        if(!settings){
            settings = {};
        }

        //sets the settings for the events (either standard settings or user settings when defined)
        indieGameEventsObject.settings = {
            events: settings.events || _standardSettings.events,
            physicalInputs: settings.physicalInputs || _standardSettings.physicalInputs,
            useWASDDirections: settings.useWASDDirections || _standardSettings.useWASDDirections,
            useArrowDirections: settings.useArrowDirections || _standardSettings.useArrowDirections,
            touchDirectionController: settings.touchDirectionController || _standardSettings.touchDirectionController,
            touchJoystickAccuracy: settings.touchJoystickAccuracy || _standardSettings.touchJoystickAccuracy,
            useEightTouchDirections: settings.useEightTouchDirections || _standardSettings.useEightTouchDirections,
            touchDismissButton: settings.touchDismissButton || _standardSettings.touchDismissButton,
            menuButton: settings.menuButton || _standardSettings.menuButton,
            useGyroscope: settings.useGyroscope || _standardSettings.useGyroscope,
            useSpaceStrgAltShiftActions: settings.useSpaceStrgAltShiftActions || _standardSettings.useSpaceStrgAltShiftActions,
            rotateRightMouse: settings.rotateRightMouse || _standardSettings.rotateRightMouse,
            enterAction1Key: settings.enterAction1Key || _standardSettings.enterAction1Key

        };

        //refer in the abstraction object to the canvas element
        indieGameEventsObject.canvas = element;

        //hammer js
        indieGameEventsObject.hammer = new _Hammer(element, {preventDefault: true});    //registers Hammer.js for the canvas
        indieGameEventsObject.hammer.get('pinch').set({ enable: true });                //enable pinch for touch zoom
        indieGameEventsObject.hammer.get('rotate').set({ enable: true });               // enable rotate

        //adds the event states array (used for the API function getEventState() to get an state of an event)
        indieGameEventsObject.eventStates = prepareEventStateArray();

        window.addEventListener('keyup', function(e) {keyboardUpEvents(e, indieGameEventsObject)});

        //main function: translates the physical inputs to the abstracted events
        eventTranslator(element, indieGameEventsObject);

        //returns the API object that represents the abstraction
        return indieGameEventsObject;
    }

    /*----API function to hide the touch overlay-----
     * @param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
     * */
    function hideIndieGameTouchInterface(indieGameEventsObject) {
        if (indieGameEventsObject && indieGameEventsObject.touchInterface && indieGameEventsObject.touchInterface.domElements && indieGameEventsObject.touchInterface.domElements.overlay) {
            indieGameEventsObject.touchInterface.domElements.overlay.style.display = 'none';

            if (indieGameEventsObject.touchInterface.domElements.dismissButton) {
                indieGameEventsObject.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    }

    /*----API function to show the touch overlay-----
     * @param indieGameEvents: an indie game events abstraction object (will be returned on the initialisation)
     * */
    function showIndieGameTouchInterface (indieGameEventsObject) {
        if (indieGameEventsObject && indieGameEventsObject.touchInterface && indieGameEventsObject.touchInterface.domElements && indieGameEventsObject.touchInterface.domElements.overlay) {
            indieGameEventsObject.touchInterface.domElements.overlay.style.display = 'block';

            if (indieGameEventsObject.touchInterface.domElements.dismissButton) {
                indieGameEventsObject.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    }
    /*----API function to hide the touch overlay without the dismiss button if it is visible-----
     * @param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
     * */
    function hideIndieGameTouchInterfaceWithoutX (indieGameEventsObject) {
        if (indieGameEventsObject && indieGameEventsObject.touchInterface && indieGameEventsObject.touchInterface.domElements && indieGameEventsObject.touchInterface.domElements.overlay) {
            indieGameEventsObject.touchInterface.domElements.overlay.style.display = 'none';

            if (indieGameEventsObject.touchInterface.domElements.dismissButton) {
                indieGameEventsObject.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    }

    /*----API function to show the touch dismiss button-----
     * @param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
     * */
    function showTouchDismissButton(indieGameEventsObject) {
        if (indieGameEventsObject.touchInterface && indieGameEventsObject.touchInterface.domElements && indieGameEventsObject.touchInterface.domElements.overlay) {
            if (indieGameEventsObject.touchInterface.domElements.dismissButton) {
                indieGameEventsObject.touchInterface.domElements.dismissButton.style.display = 'block';
            }
        }
    }

    /*----API function to toggle the touch interface-----
     * @param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
     * */
    function toggleTouchInterface(indieGameEventsObject) {
        if(indieGameEventsObject && indieGameEventsObject.touchInterface && indieGameEventsObject.touchInterface.domElements && indieGameEventsObject.touchInterface.domElements.overlay) {
            if(indieGameEventsObject.touchInterface.domElements.overlay.style.display === 'none'){
                showIndieGameTouchInterface(indieGameEventsObject);
            } else {
                hideIndieGameTouchInterface(indieGameEventsObject);
            }
        }
    }

    /*----API function to hide the button for opening a map on the touch interface-----
     * @param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
     * */
    function hideTouchMapButton(indieGameEventsObject) {
        if(indieGameEventsObject.touchInterface && indieGameEventsObject.touchInterface.domElements && indieGameEventsObject.touchInterface.domElements.mapButton) {
            indieGameEventsObject.touchInterface.domElements.mapButton.style.display = "none";
        }
    }

    /*----API function to show the button for opening a map on the touch interface-----
     * @param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
     * */
    function showTouchMapButton(indieGameEventsObject) {
        if(indieGameEventsObject.touchInterface && indieGameEventsObject.touchInterface.domElements && indieGameEventsObject.touchInterface.domElements.mapButton) {
            indieGameEventsObject.touchInterface.domElements.mapButton.style.display = "block";
        }
    }

    /*----API function to hide the button for opening a menu on the touch interface-----
     * @param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
     * */
    function hideTouchMenuButton(indieGameEventsObject) {
        if(indieGameEventsObject.touchInterface && indieGameEventsObject.touchInterface.domElements && indieGameEventsObject.touchInterface.domElements.menuButton) {
            indieGameEventsObject.touchInterface.domElements.menuButton.style.display = "none";
        }
    }

    /*----API function to show the button for opening a menu on the touch interface----- */
    /*@param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation) */
    function showTouchMenuButton(indieGameEventsObject) {
        if(indieGameEventsObject.touchInterface && indieGameEventsObject.touchInterface.domElements && indieGameEventsObject.touchInterface.domElements.menuButton) {
            indieGameEventsObject.touchInterface.domElements.menuButton.style.display = "block";
        }
    }

    /*----API function to hide the dismiss button on the touch interface----- */
    /*@param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation) */
    function hideTouchDismissButton(indieGameEventsObject) {
        if(indieGameEventsObject.touchInterface && indieGameEventsObject.touchInterface.domElements && indieGameEventsObject.touchInterface.domElements.dismissButton) {
            indieGameEventsObject.touchInterface.domElements.dismissButton.style.display = "none";
        }
    }

    /*----- API function to get an event state in an game draw loop -----*/
    /* can be used in an draw-Loop to poll event states
     * @param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
     * @param event: the event for that information about its state is needed
     * @returns true (or the strenght or the zoom/scale factor) if an action is active (Button is pressed), returns undifined if event is not recognized
     * and false on inactive event states
     *  */
    function getEventState(indieGameEventsObject, event) {
        if(indieGameEventsObject) {
            return indieGameEventsObject.eventStates[event];
        } else {
            throw new TypeError("Given Value must be from type canvas and has be registered for the indieGameEventsObject");
        }
    }


    /*----- The heart of the library, the main enty point: Abstracts inputs form different devices to uniformal events -----*/
    /* @param canvas: an canvas element for that the input will be listened and the events will be dispatched
     * @param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
     * */
    function eventTranslator(canvas, indieGameEventsObject) {
        var events = indieGameEventsObject.settings.events,
            physicalInput = indieGameEventsObject.settings.physicalInputs,
            boundingRect = canvas.getBoundingClientRect();

        indieGameEventsObject.oldBoundingRect = boundingRect;


        /*truns on directions in the abstraction object if needed*/
        if (events.indexOf('move-all') !== -1 || events.indexOf('move-up') !== -1 || events.indexOf('move-down') !== -1 || events.indexOf('move-down') !== -1 || events.indexOf('move-left') !== -1 || events.indexOf('move-right') !== -1) {
            indieGameEventsObject.directions = true;
        }

        //zooming and rotating on touch
        if(events.indexOf('zoom') !== -1) {
            registerZoom(canvas, boundingRect, indieGameEventsObject);
        }

        if(events.indexOf('rotate') !== -1) {
            registerRotate(canvas, boundingRect, indieGameEventsObject);
        }


        /* gamepads (poll gamepad states) */
        if((_gamepadAPI || _webkitGamepadAPI) && (physicalInput.indexOf('controller') !== -1 || physicalInput.indexOf('gamepad') !== -1)) {
            indieGameEventsObject.gamepad = {};

            //gets the connected gamepads and polls the button of it (only the first connected gamepad)
            registerConnectionGamepadEvents(indieGameEventsObject);

            //if there is already a gamepad connected poll the buttons of it (only the first connected gamepad)
            if(isGamepadConnected()) {
                getConnectedGamepadsAndPoll(canvas, indieGameEventsObject);
            }
        }


        /* keyboard */
        if(physicalInput.indexOf('keyboard') !== -1) {
            registerKeyboardEvents(canvas, events, indieGameEventsObject);
        }

        /* if gyroscope mode is enabled */
        if (indieGameEventsObject.settings.useGyroscope === true && isTouchDevice()) {
            registerGyroscope(canvas, indieGameEventsObject)
            //https://github.com/tomgco/gyro.js
        }

        /* touch */
        /*create an interface for touch devices when the device has an touch input and no controller is connected*/
        if (!isGamepadConnected() && (physicalInput.indexOf('touch') !== -1 || physicalInput.contains('touchscreen')) && isTouchDevice()) {
            createTouchInterface(canvas, boundingRect, indieGameEventsObject);

            //when fullscreen is activated
            document.addEventListener("fullscreenchange", function() {touchInterfaceFullscreenHandler(indieGameEventsObject.touchInterface.domElements, canvas)});
            document.addEventListener("webkitfullscreenchange", function() {touchInterfaceFullscreenHandler(indieGameEventsObject.touchInterface.domElements, canvas)});
            document.addEventListener("mozfullscreenchange", function() {touchInterfaceFullscreenHandler(indieGameEventsObject.touchInterface.domElements, canvas)});
            document.addEventListener("MSFullscreenChange", function() {touchInterfaceFullscreenHandler(indieGameEventsObject.touchInterface.domElements, canvas)});

            //handle resize of canvas for the touch overlay
            window.addEventListener("resize", function () {handleResize(canvas, indieGameEventsObject.touchInterface)});
            window.addEventListener("orientationchange", function () {handleResize(canvas, indieGameEventsObject.touchInterface)});

        }


        /*----- Handles the window resize event for the touch overlay -----
         * @param canvas: an canvas element for that the input will be listened and the events will be dispatched
         * @param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
         * */
        function handleResize(canvas, touchInterface) {
            var newBoundingRect = canvas.getBoundingClientRect(),
                oldBoundingRect = indieGameEventsObject.oldBoundingRect,
                visibleJoystick,
                visibleDirectionButtons;

            if(newBoundingRect.width !== oldBoundingRect.width || newBoundingRect.height !== oldBoundingRect.height) {
                //hide joystick at the beginning until the gyroscope is loaded
                if(indieGameEventsObject.touchInterface) {
                    if(indieGameEventsObject.touchInterface.domElements.joystick) {
                        (indieGameEventsObject.touchInterface.domElements.joystick.wrapper.style.display !== 'none') ? visibleJoystick = true : visibleJoystick = false;
                    }

                    else if(indieGameEventsObject.touchInterface.domElements.directionButtons) {
                        (indieGameEventsObject.touchInterface.domElements.directionButtons.wrapper.style.display !== 'none') ? visibleDirectionButtons = true : visibleDirectionButtons = false;
                    }
                }

                //remove old touch interface
                document.body.removeChild(touchInterface.domElements.overlay);
                delete canvas.touchInterface;
                touchInterface = null;

                //create new touch interface
                createTouchInterface(canvas, newBoundingRect, indieGameEventsObject);

                visibleJoystick ? indieGameEventsObject.touchInterface.domElements.joystick.wrapper.style.display = "block" : '';
                visibleDirectionButtons ? indieGameEventsObject.touchInterface.domElements.directionButtons.wrapper.style.display = "block" : '';

                indieGameEventsObject.oldBoundingRect = newBoundingRect;
            }
        }


        /* mouse events */
        if(physicalInput.indexOf('mouse') !== -1) {
            registerMouseEvents(canvas, events, indieGameEventsObject.settings, indieGameEventsObject);
        }


        /*not continuous events should not be piped down to the user under certain circumstances */
        setSinglePressEvents(canvas);

    }


    /*----- Translates the Mouse Events -----*/
    //@param canvas: an canvas element for that the input will be listened and the events will be dispatched
    //@param events: the user settings which events should be supported
    //@param settings: user settings (or standard settings if option is not given by the user)
    //@param indieGameEvents: an indie game events abstraction object that represents a canvas and its input abstraction (will be returned on the initialisation)
    function registerMouseEvents(canvas, events, settings, indieGameEventsObject) {
        var oldClientX = 0, clickPosition, data, eventDispatchID, point, wheeling;

        //adds small point to enhance UI on rotation and move events via mouse (is visible when a mouse rotation or movement user-action is active)
        point = document.createElement("div");
        point.setAttribute("style",
            "position: absolute; " +
            "width:" + 10 + "px; " +
            "height:" + 10 + "px; " +
            "background-color: " + "black;" +
            "opacity: " + 0.3 + ";" +
            "border-radius: 100%;" +
            "display: " + "none;" +
            "top: " + "0;" +
            "left: " + "0;"
        );

        document.body.appendChild(point);


        //zoom
        if (events.indexOf("zoom") !== -1) {
            wheeling = false;
            canvas.addEventListener("wheel", function (e) {
                translateMouseWheelAction(e, canvas, events, settings, indieGameEventsObject, wheeling)
            });
        }

        //rotate
        if (events.indexOf("rotate")) {
            canvas.addEventListener('mousedown', mouseDown, false);
            window.addEventListener('mouseup', mouseUp, false);
        }

        /* Mouse up Handler: cancels running mouse events
         * @param e: MouseEvent Object
         */
        function mouseUp(e) {
            window.removeEventListener('mousemove', moveRotate, true);

            indieGameEventsObject.eventStates["rotate"] = false;

            //only on middle mouse button
            if (e.which === 2) {
                if (eventDispatchID) {
                    window.cancelAnimationFrame(eventDispatchID);
                    eventDispatchID = null;
                }

                //removes rotation point and the mouseMove Event Handler
                removePoint();
                window.removeEventListener('mousemove', moveMove, true);

                //resets mouse movement event states
                indieGameEventsObject.eventStates["move-up"] = false;
                indieGameEventsObject.eventStates["move-left"] = false;
                indieGameEventsObject.eventStates["move-down"] = false;
                indieGameEventsObject.eventStates["move-right"] = false;
            }

            canvas.style.cursor = "default";
        }

        /* mousedown Handler
         * @param e: MouseEvent Object
         */
        function mouseDown(e) {
            clickPosition = {x: e.clientX, y: e.clientY};
            oldClientX = e.clientX;

            //when mouse is down and moved then the moveRotate function will be executed
            window.addEventListener('mousemove', moveRotate, true);

            //middle mouse button
            if (e.which === 2) {
                //makes a small point vsible for better UX
                setPoint(clickPosition);
                //when mouse is moved on the move events
                window.addEventListener('mousemove', moveMove, true);

                //dont execute the default event for the middle mouse button
                return e.preventDefault();
            }
        }

        /* Handler for mouse move on an rotation action
         * @param e: MouseEvent Object
         */
        function moveRotate(e) {
            var event, deltaX;

            //only works if shift is pressed
            if (e.shiftKey) {
                canvas.style.cursor = "e-resize";       //change cursor style
                deltaX = e.clientX - oldClientX;        //get the difference from the old mouse position (last frame) to the new mouse position (current frame)

                event = new CustomEvent('rotate');      //creates a new Custom Event
                event.rotation = deltaX / 100;          //sets the rotation value on the event object

                indieGameEventsObject.eventStates["rotate"] = event.rotation; //refresehes the event states array with the new rotation value

                canvas.dispatchEvent(event);                //dispatches the event
            } else {
                indieGameEventsObject.eventStates["rotate"] = false;        //resets the event states array (the specific user action is no longer active)
            }
            oldClientX = e.clientX;   //new position becomes old position
        }

        /* Handler for mouse move on an move action
         * @param e: MouseEvent Object
         */
        function moveMove(e) {
            var distance, strength, angle;

            distance = getDistance({x: e.clientX, y: e.clientY}, clickPosition);    //gets the distance from the mouse position when the event started
            strength = Math.min(~~distance.map(0, 400, 0, 100), 100);               //calculates the strength out of the distance for the custom event out of the distance
            angle = getAngle(clickPosition, {x: e.clientX, y: e.clientY});          //calculates the angle from the current point to the point now for a dampening effect on the dispatched event

            //cancels the old AnimationFrame
            if (eventDispatchID) {
                window.cancelAnimationFrame(eventDispatchID);
                eventDispatchID = null;
            }

            //Creates an Animation frame Loop for the mouse move actions (every frame an event will be dispatched)
            eventDispatchID = window.requestAnimationFrame(function() {moveLoop(distance, strength, angle)});
        }

        /* Sets an point (makes it visible) over the Canvas for better UX */
        function setPoint() {
            if(point) {
                point.style.display = "block";
                point.style.top = clickPosition.y + "px";
                point.style.left = clickPosition.x + "px";
            }
        }

        /* Removes the point (makes it invisible) of that was set with the setPoint */
        function removePoint() {
            if(point) {
                point.style.display = "none";
            }
        }

        /* Dispatches move events in every Animation frame (when the mouse action for moving is active)
         * @param distance: Distance from the initial point (to calculate the strength)
         * @param strength: Current strength of the event
         * @param angle: Angle from the inital point (to dampen the strengtht)
         */
        function moveLoop(distance, strength, angle) {
            var event, strengthDampen;

            //smallest deviations dont trigger events
            if (distance > 10) {
                //right
                if (angle < 90 && angle > -90 && (events.indexOf('move-right') !== -1 || events.indexOf('move-all') !== -1)) {
                    event = new CustomEvent('move-right');

                    //keep 100 strength for a time then fall off when angle is to low/high
                    if(angle > 45 || angle < -45) {
                        strengthDampen = (angle > 0) ? angle.map(90, 45, 0, 1): angle.map(-90, -45, 0, 1);
                    } else {strengthDampen = 1}

                    event.strength = strength * strengthDampen;
                    canvas.dispatchEvent(event);

                    indieGameEventsObject.eventStates["move-left"] = false;
                    indieGameEventsObject.eventStates["move-right"] = event.strength;
                }

                //down
                if (angle < 180 && angle > 0 && (events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1)) {
                    // console.log('down');
                    event = new CustomEvent('move-down');

                    //keep 100 strength for a time then fall off when angle is to low/high
                    if(angle > 135 || angle < 45) {
                        strengthDampen = (angle > 90) ? angle.map(180, 135, 0, 1): angle.map(0, 45, 0, 1);
                    } else {strengthDampen = 1}

                    event.strength = strength * strengthDampen;
                    canvas.dispatchEvent(event);

                    indieGameEventsObject.eventStates["move-up"] = false;
                    indieGameEventsObject.eventStates["move-down"] = event.strength;
                }

                //left
                if (((angle < -90 && angle < 0) || (angle > 0 && angle > 90)) && (events.indexOf('move-left') !== -1 || events.indexOf('move-all') !== -1)) {
                    event = new CustomEvent('move-left');

                    if((angle > -135 && angle < 0) || (angle < 135 && angle > 0)) {
                        strengthDampen = (angle < -90) ? angle.map(-90, -135, 0, 1): angle.map(90, 135, 0, 1);
                    } else {strengthDampen = 1}

                    event.strength = strength * strengthDampen;
                    canvas.dispatchEvent(event);

                    indieGameEventsObject.eventStates["move-right"] = false;
                    indieGameEventsObject.eventStates["move-left"] = event.strength;
                    // console.log(angle);
                }

                //up
                if (angle < 0 && angle > -180 && (events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1)) {
                    //console.log('up');
                    event = new CustomEvent('move-up');

                    //keep 100 strength for a time then fall off when angle is to low/high
                    if(angle > -45 || angle < -135) {
                        strengthDampen = (angle < -90) ? angle.map(-180, -135, 0, 1): angle.map(0, -45, 0, 1);
                    } else {strengthDampen = 1}

                    event.strength = strength * strengthDampen;
                    canvas.dispatchEvent(event);

                    indieGameEventsObject.eventStates["move-down"] = false;
                    indieGameEventsObject.eventStates["move-up"] = event.strength;
                }
            }

            else {
                indieGameEventsObject.eventStates["move-left"] = false;
                indieGameEventsObject.eventStates["move-right"] = false;
                indieGameEventsObject.eventStates["move-up"] = false;
                indieGameEventsObject.eventStates["move-down"] = false;
            }

            eventDispatchID = window.requestAnimationFrame(function() {moveLoop(distance, strength, angle)});
        }
    }


    /* Translates actions triggered with the mouse wheel
     * @param e: MouseEvent Object
     * @param canvas: Current canvas element
     * @param events: Array of events that should be translated
     * @param settings: Settings active for this abstraction
     * @param indieGameEventsObject: Object representing the abstraction
     * @param wheeling: TimeoutID to reset the eventStates object
     */
    function translateMouseWheelAction(e, canvas, events, settings, indieGameEventsObject, wheeling) {
        var event;

        //zooming is possible with alt and strg  and shift key
        if(e.altKey || e.ctrlKey || e.shiftKey) {
            event = new CustomEvent('zoom');
            event.scale = e.deltaY / -1000;    //calculates scale value

            canvas.dispatchEvent(event);

            indieGameEventsObject.eventStates["zoom"] = event.scale;


            //event states array should reset after 250ms after the last wheel action
            //clears the timeout for the wheeling effect
            clearTimeout(wheeling);

            //after 250 ms reset the event states array
            wheeling = setTimeout(function() {
                indieGameEventsObject.eventStates["zoom"] = false;
                wheeling = undefined;
            }, 250);

            //prevents the default action
            e.preventDefault();
        }
    }

    /*
     * Intercepts single Events (like open-map)
     * @param canvas: current canvas element for that the abstraction should take place (only gets triggered every 750 ms)
     */
    function setSinglePressEvents(canvas) {
        _openMapAllowed = true;
        _openMenuAllowed = true;
        _dismissAllowed = true;

        /*open map*/
        canvas.addEventListener('open-map', function(e) {
            if(!_openMapAllowed) {
                e.stopImmediatePropagation();
            } else {
                _openMapAllowed = false;

                setTimeout(function () {
                    _openMapAllowed = true;
                }, 750);
            }
        });

        /*dismiss*/
        canvas.addEventListener('dismiss', function(e) {
            if(!_dismissAllowed) {
                //stop event
                e.stopImmediatePropagation();
            } else {
                _dismissAllowed = false;

                setTimeout(function () {
                    _dismissAllowed = true;
                }, 750);
            }
        });

        /*open menu*/
        canvas.addEventListener('open-menu', function(e) {
            if(!_openMenuAllowed) {
                //stop event
                e.stopImmediatePropagation();
            } else {
                _openMenuAllowed = false;

                setTimeout(function () {
                    _openMenuAllowed = true;
                }, 750);
            }
        });
    }


    /* KEYBOARD
     * Translates Keyboard events
     * @param canvas: current canvas
     * @param events: events that should get translated
     * @param indieGameEventsObject: abstraction object
     */
    function registerKeyboardEvents(canvas, events, indieGameEventsObject) {
        var event, keyBoardEvents, keyMapping, keyEventMap;

        keyBoardEvents = {};
        keyMapping = {};
        keyEventMap = {};

        //creates a key mapping for for the keyboard events

        //when useWASDDirections option is active us wasd keys
        if (indieGameEventsObject.settings.useWASDDirections) {
            keyMapping.left = 65;
            keyMapping.right = 68;
            keyMapping.down = 83;
            keyMapping.up = 87;

        //else use arrow keys
        } else {
            keyMapping.left = 37;
            keyMapping.right = 39;
            keyMapping.down = 38;
            keyMapping.up = 40;
        }

        //action keys
        //when useSpaceStrgAltShiftActions is active use that keys
        if(indieGameEventsObject.settings.useSpaceStrgAltShiftActions) {
            keyMapping.action1Space = 32;
            keyMapping.action2Strg = 17;
            keyMapping.action3Alt = 18;
            keyMapping.action4Shift = 16;
        }


        //additionally when enterAction1Key is active use also the enter key for action1
        if(indieGameEventsObject.settings.enterAction1Key) {
            keyMapping.action1Enter = 13;
        }

        //numpad
        keyMapping.action1NP = 97;
        keyMapping.action2NP = 98;
        keyMapping.action3NP = 99;
        keyMapping.action4NP = 100;

        //numbers
        keyMapping.action1N = 49;
        keyMapping.action2N = 50;
        keyMapping.action3N = 51;
        keyMapping.action4N = 52;

        //letters
        keyMapping.action1L = 72;
        keyMapping.action2L = 74;
        keyMapping.action3L = 75;
        keyMapping.action4L = 76;


        //basic remote control support (color keys on an remote control)
        keyMapping.action1R = 403;
        keyMapping.action2R = 404;
        keyMapping.action3R = 405;
        keyMapping.action4R = 406;

        //zooming
        //numpad
        keyMapping.zoomInNP = 107;
        keyMapping.zoomOutNP = 109;

        //letters
        keyMapping.zoomInL = 187;
        keyMapping.zoomOutL = 189;

        //remote
        keyMapping.zoomInR = 56;
        keyMapping.zoomOutR = 57;


        //rotating
        //numpad (/ and *)
        keyMapping.rotateLeftNP = 111;
        keyMapping.rotateRightNP = 106;

        //lettters (i and o)
        keyMapping.rotateLeftL = 73;
        keyMapping.rotateRightL = 79;

        //remote
        keyMapping.rotateLeftR = 427;
        keyMapping.rotateRightR = 427;

        //p for pause (open menu)
        keyMapping.openMenu = 80;
        keyMapping.openMenu2 = 19;

        //m for map
        keyMapping.openMap = 77;

        //backspace or escape for dismiss action
        keyMapping.dismissBS = 8;
        keyMapping.dismissES = 27;


        //to get the key up right, sets the keyEvents for the keys in an separate array
        keyEventMap[keyMapping.left] = "move-left";
        keyEventMap[keyMapping.right] = "move-right";
        keyEventMap[keyMapping.up] = "move-up";
        keyEventMap[keyMapping.down] = "move-down";
        keyEventMap[keyMapping.action1Space] = keyEventMap[keyMapping.action1NP] = keyEventMap[keyMapping.action1N] = keyEventMap[keyMapping.action1L] = keyEventMap[keyMapping.action1R] = keyEventMap[keyMapping.action1Enter] = "action-1";
        keyEventMap[keyMapping.action2Strg] = keyEventMap[keyMapping.action2NP] = keyEventMap[keyMapping.action2N] = keyEventMap[keyMapping.action2L] = keyEventMap[keyMapping.action2R] = "action-2";
        keyEventMap[keyMapping.action3Alt] = keyEventMap[keyMapping.action3NP] = keyEventMap[keyMapping.action3N] = keyEventMap[keyMapping.action3L] = keyEventMap[keyMapping.action3R] = "action-3";
        keyEventMap[keyMapping.action4Shift] = keyEventMap[keyMapping.action4NP] = keyEventMap[keyMapping.action4N] = keyEventMap[keyMapping.action4L] = keyEventMap[keyMapping.action4R] = "action-4";
        keyEventMap[keyMapping.zoomInNP] = keyEventMap[keyMapping.zoomInL] = keyEventMap[keyMapping.zoomOutNP] = keyEventMap[keyMapping.zoomOutL] = keyEventMap[keyMapping.zoomInR] = keyEventMap[keyMapping.zoomOutR] = "zoom";
        keyEventMap[keyMapping.rotateLeftNP] =  keyEventMap[keyMapping.rotateLeftL] = keyEventMap[keyMapping.rotateRightNP] =  keyEventMap[keyMapping.rotateRightL] =  keyEventMap[keyMapping.rotateRightR] =keyEventMap[keyMapping.rotateLeftR]  = "rotate";

        //adds the specific key dispatch function to the keyBoardEvents on the index place of the key code
        if (events.indexOf('move-all') !== -1 || events.indexOf('move-left') !== -1) {
            keyBoardEvents[keyMapping.left] = function () {              //left
                event = new CustomEvent('move-left');
                event.strength = 100;                               //on keyboard the strength is always max
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['move-left'] = 100;
            }
        }

        if (events.indexOf('move-all') !== -1 || events.indexOf('move-right') !== -1) {
            keyBoardEvents[keyMapping.right] = function () {              //right
                event = new CustomEvent('move-right');
                event.strength = 100;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['move-right'] = 100;
            }
        }

        if (events.indexOf('move-all') !== -1 || events.indexOf('move-up') !== -1) {
            keyBoardEvents[keyMapping.up] = function () {              //right
                event = new CustomEvent('move-up');
                event.strength = 100;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['move-up'] = 100;
            }
        }

        if (events.indexOf('move-all') !== -1 || events.indexOf('move-down') !== -1) {
            keyBoardEvents[keyMapping.down] = function () {              //right
                event = new CustomEvent('move-down');
                event.strength = 100;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['move-down'] = 100;
            }
        }

        if(events.indexOf('action-1')) {
            keyBoardEvents[keyMapping.action1L] = keyBoardEvents[keyMapping.action1N] = keyBoardEvents[keyMapping.action1NP] = keyBoardEvents[keyMapping.action1Space] = keyBoardEvents[keyMapping.action1R] = keyBoardEvents[keyMapping.action1Enter] = function () {
                event = new CustomEvent('action-1');
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['action-1'] = true;
            }
        }

        if(events.indexOf('action-2')) {
            keyBoardEvents[keyMapping.action2L] = keyBoardEvents[keyMapping.action2N] = keyBoardEvents[keyMapping.action2NP] = keyBoardEvents[keyMapping.action2Strg] = keyBoardEvents[keyMapping.action2R] = function () {
                event = new CustomEvent('action-2');
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['action-2'] = true;
            }
        }

        if(events.indexOf('action-3')) {
            keyBoardEvents[keyMapping.action3L] = keyBoardEvents[keyMapping.action3N] = keyBoardEvents[keyMapping.action3NP] = keyBoardEvents[keyMapping.action3Alt] = keyBoardEvents[keyMapping.action3R] = function () {
                event = new CustomEvent('action-3');
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['action-3'] = true;
            }
        }

        if(events.indexOf('action-4')) {
            keyBoardEvents[keyMapping.action4L] = keyBoardEvents[keyMapping.action4N] = keyBoardEvents[keyMapping.action4NP] = keyBoardEvents[keyMapping.action4R] = keyBoardEvents[keyMapping.action4Space] = function () {
                event = new CustomEvent('action-4');
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['action-4'] = true;
            }
        }

        //zooming
        if(events.indexOf('zoom')) {
            keyBoardEvents[keyMapping.zoomInNP] = keyBoardEvents[keyMapping.zoomInL] = keyBoardEvents[keyMapping.zoomOutR] = function () {
                event = new CustomEvent('zoom');
                event.scale = 0.1;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['zoom'] = 0.1;

            };

            keyBoardEvents[keyMapping.zoomOutNP] = keyBoardEvents[keyMapping.zoomOutL] = keyBoardEvents[keyMapping.zoomOutR] = function () {
                event = new CustomEvent('zoom');
                event.scale = -0.1;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['zoom'] = -0.1;
            }
        }

        //rotating
        if(events.indexOf('rotate')) {
            keyBoardEvents[keyMapping.rotateRightNP] = keyBoardEvents[keyMapping.rotateRightL] = keyEventMap[keyMapping.rotateRightR] = function () {
                event = new CustomEvent('rotate');
                event.rotation = 0.1;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['rotate'] = 0.1;
            };

            keyBoardEvents[keyMapping.rotateLeftNP] = keyBoardEvents[keyMapping.rotateLeftL] = keyBoardEvents[keyMapping.rotateLeftR] = function () {
                event = new CustomEvent('rotate');
                event.rotation = -0.1;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates['rotate'] = -0.1;
            }
        }


        //open menu
        if(events.indexOf('open-menu')) {
            keyBoardEvents[keyMapping.openMenu] = keyBoardEvents[keyMapping.openMenu2] = function (e) {
                event = new CustomEvent('open-menu');
                canvas.dispatchEvent(event);

                //hide touch menu button and touch map button if they are there
                hideTouchMenuButton(indieGameEventsObject);
                hideTouchMapButton(indieGameEventsObject);
                showTouchDismissButton(indieGameEventsObject);

                e.preventDefault();
            }
        }

        //open map
        if(events.indexOf('open-map')) {
            keyBoardEvents[keyMapping.openMap] = function () {
                event = new CustomEvent('open-map');
                canvas.dispatchEvent(event);

                hideTouchMapButton(indieGameEventsObject);
                showTouchDismissButton(indieGameEventsObject);
            }
        }

        //dismiss
        if(events.indexOf('dismiss')) {
            keyBoardEvents[keyMapping.dismissBS] = keyBoardEvents[keyMapping.dismissES] = function () {
                event = new CustomEvent('dismiss');
                canvas.dispatchEvent(event);

                showTouchMapButton(indieGameEventsObject);
                showTouchMenuButton(indieGameEventsObject);
                hideTouchDismissButton(indieGameEventsObject);
            }
        }

        // document.addEventListener('keydown', function (e) {
        //     console.log(e.keyCode);
        // });


        //registeres the Keyboard Controller (to get rid of the delay of the first received Event and the next one on held down keys)
        KeyboardController(keyBoardEvents, indieGameEventsObject.eventStates, keyEventMap);
    }

    /*
     * Adds the functionality to toggle the touchInterface when pressed F7
     * (comes handy on devices with keyboards and touch to hide the touch- overlay when played with the keyboard)
     * @param e: Keyboard Event
     * @param indieGameEventsObject: Abstraction Object
     */
    function keyboardUpEvents(e, indieGameEventsObject) {
        switch (e.keyCode) {
            case 118:
                toggleTouchInterface(indieGameEventsObject);
                break;
        }
    }

    /*GAMEPAD */
    /*
     * Polls for connecting a keyboard and when one is found then it checks every frame the status of the input of that device
     * only one gamepad is supported
     * @param canvas: current canvas
     * @param indieGameEventsObject: abstraction object
     */
    function getConnectedGamepadsAndPoll(canvas, indieGameEventsObject) {
        var gamepadKey, gamepad;

        //gets the connected gamepads
        _gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

        //iterates over the gamepad list
        for (gamepadKey in _gamepads) {
            if (_gamepads.hasOwnProperty(gamepadKey) && _gamepads[gamepadKey]) {
                gamepad = _gamepads[gamepadKey];

                //warns if the used gamepad has no standard mapping
                if (gamepad.mapping !== 'standard') {
                    console.warn('Gamepad with the id "'+ gamepad.id +'" has no standard key mapping and might not work properly');
                }
            }
        }

        //if a gamepad is connected put no action polling takes place
        if(isGamepadConnected() && !_gamepadPolling){
            //action polling takes place (every frame the state of the controller will be checked and reacted to)
           _gamepadPolling = true;

           //polls for the user action (checks the state of the first controller every frame
           pollGamepadEvents(canvas, indieGameEventsObject);
        }
        //if no gamepads are connected set gamepad polling to falce
        else if(!isGamepadConnected() && _gamepadPolling) {
            _gamepadPolling = false;
        }
    }


    /*
     * Listen for gamepad connections and execute the gamepadConnectHandler that calls the getConnectedGamepadsAndPoll-Function
     * to listen for user input of the controller (only the primary (first) connected one)
     * @param indieGameEventsObject: abstraction object
     */
    function registerConnectionGamepadEvents(indieGameEventsObject) {
        var canvas = indieGameEventsObject.canvas;

        //if gamepad there that you can listen to when a gamepad is connected
        if (_gamepadAPI) {
            window.addEventListener("gamepadconnected", function() {gamepadConnectHandler(canvas, indieGameEventsObject)});
            window.addEventListener("gamepaddisconnected", function() {gamepadConnectHandler(canvas, indieGameEventsObject)});
        } else if (_webkitGamepadAPI) {
            window.addEventListener("webkitgamepadconnected", function() {gamepadConnectHandler(canvas, indieGameEventsObject)});
            window.addEventListener("webkitgamepaddisconnected", function() {gamepadConnectHandler(canvas, indieGameEventsObject)});
            //else just ask every 500 ms if a new gamepad is connected and execute the getConnectedGamepadsAndPoll-Function to poll for the user input
        } else {
            setInterval(function () {
                getConnectedGamepadsAndPoll(canvas, indieGameEventsObject);
            }, 500);
        }
    }

    /*
     * Gamepad connection handler: will be called when a new gamepad is connected
     * calls getConnectedGamepadsAndPoll to listen to the gamepad actions
     * @param canvas: current canvas
     * @param indieGameEventsObject: abstraction object
     */
    function gamepadConnectHandler(canvas, indieGameEventsObject) {
        getConnectedGamepadsAndPoll(canvas, indieGameEventsObject);
    }

    /*
     * Translates the first gamepad (primary gamepad) input actions to the uniform events
     * @param canvas: current canvas
     * @param indieGameEventsObject: abstraction object
     */
    function pollGamepadEvents(canvas, indieGameEventsObject) {
        var gamepadKey, gamepad, i, button, pressed, strength, events, leftRightTriggered, upDownTriggered, action1Triggered, action2Triggered, action3Triggered ,action4Triggered, zoomTriggered, rotateTriggered;

        //gets user settings (or predefined settings)
        events = indieGameEventsObject.settings.events;

        //if you should listen for the input user actions
        if(_gamepadPolling) {
            _gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
            //for(gamepadKey in _gamepads) {
              //  if(_gamepads.hasOwnProperty(gamepadKey)){

                     //only first gamepad is supported
                    gamepad = _gamepads[0];

                    //used for the eventStateArray to turn back the values to false when a gamepad button is released
                    action1Triggered = false;
                    action2Triggered = false;
                    action3Triggered = false;
                    action4Triggered = false;
                    zoomTriggered = false;
                    rotateTriggered = false;
                    leftRightTriggered = false;
                    upDownTriggered = false;

                    if(gamepad && typeof(gamepad) === 'object') {
                        //iterate over every button and depending on that state dispatch an associated event or not
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
                                standardGamepadButtonActions(i, canvas, events, indieGameEventsObject);

                                //if  a certain action key is pressed then save it in an value
                                if(i === 0) {action1Triggered = true;}
                                else if(i === 2) {action2Triggered = true;}
                                else if(i === 1) {action3Triggered = true;}
                                else if(i === 3) {action4Triggered = true;}
                                else if(i === 11 || i === 10) {zoomTriggered = true;}
                                else if(i === 5 || i === 4) {rotateTriggered = true;}

                                //oh oh not good (non standard) will be mapped for the thrustmaster dual analog 4
                            } else if (pressed) {
                                nonStandardGamepadButtonActions(i, canvas, events, indieGameEventsObject);

                                if(i === 0) {action1Triggered = true;}
                                else if(i === 1) {action2Triggered = true;}
                                else if(i === 2) {action3Triggered = true;}
                                else if(i === 3) {action4Triggered = true;}
                                else if(i === 11 || i === 10) {zoomTriggered = true;}
                                else if(i === 6 || i === 4) {rotateTriggered = true;}
                            }
                        } //endfor

                        //if there are axes on the gamepad
                        if(gamepad.axes){
                            //standard mapping
                            if (gamepad.mapping === 'standard') {
                                //iterates over every joystick and axis and check their state (to trigger specific events or not)
                                for (i = 0; i < gamepad.axes.length; i++) {
                                    if ((gamepad.axes[i] > 0.1 || gamepad.axes[i] < -0.1) && (gamepad.axes[i] <= 1 && gamepad.axes[i] >= -1)) {
                                        standardGamepadAxisActions(i, canvas, events, gamepad.axes[i], indieGameEventsObject);

                                        if (i === 0) {
                                            leftRightTriggered = true;
                                        } else if (i === 1) {
                                            upDownTriggered = true;
                                        }
                                    }
                                }
                                //not standard mapping (use thrustmaster dual analog 4 mapping)
                            } else {
                                for (i = 0; i < gamepad.axes.length; i++) {

                                    if ((gamepad.axes[i] > 0.1 || gamepad.axes[i] < -0.1) && (gamepad.axes[i] <= 1 && gamepad.axes[i] >= -1)) {
                                        //map to non standard Thrustmaster Dual Analog 4
                                        nonStandardGamepadAxisActions(i, canvas, events, gamepad.axes[i], indieGameEventsObject);

                                        if (i === 0 || i === 5 || i === 2) {
                                            leftRightTriggered = true;
                                        } else if (i === 1 || i === 3 || i === 6) {
                                            upDownTriggered = true;
                                        }
                                    }
                                }
                            }

                            //if a specific button was released or the axis movement is inactive (for an specific event) than reset the action array entry for that event
                            if(!leftRightTriggered) {
                                indieGameEventsObject.eventStates["move-right"] = false;
                                indieGameEventsObject.eventStates["move-left"] = false;
                            }

                            if(!upDownTriggered) {
                                indieGameEventsObject.eventStates["move-down"] = false;
                                indieGameEventsObject.eventStates["move-up"] = false;
                            }


                            if(!action1Triggered) {
                                indieGameEventsObject.eventStates["action-1"] = false;
                            }
                            if(!action2Triggered) {
                                indieGameEventsObject.eventStates["action-2"] = false;
                            }
                            if(!action3Triggered) {
                                indieGameEventsObject.eventStates["action-3"] = false;
                            }
                            if(!action4Triggered) {
                                indieGameEventsObject.eventStates["action-4"] = false;
                            }
                            if(!rotateTriggered) {
                                indieGameEventsObject.eventStates["rotate"] = false;
                            }
                            if(!zoomTriggered) {
                                indieGameEventsObject.eventStates["zoom"] = false;
                            }
                        }
                    }
                //}
            //}

            //poll the gamepad button and axis states for every frame
            indieGameEventsObject.gamepad.pollingID = window.requestAnimationFrame(function () { pollGamepadEvents(canvas, indieGameEventsObject) });
        }
        //if you should not poll the gamepad events stop the requestAnimationFrame-Loop
        else {
            window.cancelAnimationFrame(indieGameEventsObject.gamepad.pollingID);
        }

    }

    /*
     * Translates the user actions from the joysticks to uniform evens with the gamepad mapping of an non standard gamepad (thrustmaster dual analog 4)
     * @param i: index value uf the axis from the mapping
     * @param canvas: current canvas
     * @param axis value for that specific joystick axis
     * @param indieGameEventsObject: abstraction object
     */
    function nonStandardGamepadAxisActions(i, canvas, events, gamepadAxes, indieGameEventsObject) {
        var event;

        //only left knob supported (so no double dispatching two events in one frame is possible)
        if(i === 0) { //left and right
            if(gamepadAxes < -0.1) { //0.1 for tolearance
                event = new CustomEvent('move-left');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100); //calculates the strength (maps it from 0-1 what we get from the gamepad to 0 - 100 to make it uniformal with other input methods)
                canvas.dispatchEvent(event);

                //to get the event states array right (if you move left it is impossible to move right so turn of that eventState)
                indieGameEventsObject.eventStates["move-right"] = false;
                indieGameEventsObject.eventStates["move-left"] = event.strength;

            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-right');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["move-left"] = false;
                indieGameEventsObject.eventStates["move-right"] = event.strength;
            }
        }

        if(i === 1) { //up and down
            if(gamepadAxes < -0.1) {
                event = new CustomEvent('move-up');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["move-down"] = false;
                indieGameEventsObject.eventStates["move-up"] = event.strength;
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-down');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["move-up"] = false;
                indieGameEventsObject.eventStates["move-down"] = event.strength;
            }
        }

        //Only one joystick will be supported
        // if(i === 2) { //left and right
        //     if(gamepadAxes < -0.1) {
        //         event = new CustomEvent('move-left');
        //         event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
        //         canvas.dispatchEvent(event);
        //
        //         indieGameEventsObject.eventStates["move-right"] = false;
        //         indieGameEventsObject.eventStates["move-left"] = event.strength;
        //
        //     } else if(gamepadAxes > 0.1) {
        //         event = new CustomEvent('move-right');
        //         event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
        //         canvas.dispatchEvent(event);
        //
        //         indieGameEventsObject.eventStates["move-left"] = false;
        //         indieGameEventsObject.eventStates["move-right"] = event.strength;
        //     }
        // }
        //
        // if(i === 3) { //up and down
        //     if(gamepadAxes < -0.1) {
        //         event = new CustomEvent('move-up');
        //         event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
        //         canvas.dispatchEvent(event);
        //
        //         indieGameEventsObject.eventStates["move-down"] = false;
        //         indieGameEventsObject.eventStates["move-up"] = event.strength;
        //
        //     } else if(gamepadAxes > 0.1) {
        //         event = new CustomEvent('move-down');
        //         event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
        //         canvas.dispatchEvent(event);
        //
        //         indieGameEventsObject.eventStates["move-up"] = false;
        //         indieGameEventsObject.eventStates["move-down"] = event.strength;
        //     }
        // }

        //knob three (non standard thrustmaster mapping)
        // if(i === 5) { //left and right
        //     if(gamepadAxes < -0.1) {
        //         event = new CustomEvent('move-left');
        //         event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
        //         canvas.dispatchEvent(event);
        //
        //         indieGameEventsObject.eventStates["move-right"] = false;
        //         indieGameEventsObject.eventStates["move-left"] = event.strength;
        //
        //     } else if(gamepadAxes > 0.1) {
        //         event = new CustomEvent('move-right');
        //         event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
        //         canvas.dispatchEvent(event);
        //
        //         indieGameEventsObject.eventStates["move-left"] = false;
        //         indieGameEventsObject.eventStates["move-right"] = event.strength;
        //     }
        // }
        //
        // if(i === 6) { //up and down
        //     if(gamepadAxes < -0.1) {
        //         event = new CustomEvent('move-up');
        //         event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
        //         canvas.dispatchEvent(event);
        //
        //         indieGameEventsObject.eventStates["move-down"] = false;
        //         indieGameEventsObject.eventStates["move-up"] = event.strength;
        //
        //     } else if(gamepadAxes > 0.1) {
        //         event = new CustomEvent('move-down');
        //         event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
        //         canvas.dispatchEvent(event);
        //
        //         indieGameEventsObject.eventStates["move-up"] = false;
        //         indieGameEventsObject.eventStates["move-down"] = event.strength;
        //     }
        // }

    }

    /*
    * Translates the user actions from the joysticks to uniform events with the w3c standard gamepad mapping
    * @param i: index value uf the axis from the mapping
    * @param canvas: current canvas
    * @param axis value for that specific joystick axis
    * @param indieGameEventsObject: abstraction object
    */
    function standardGamepadAxisActions(i, canvas, events, gamepadAxes, indieGameEventsObject) {
        var event;

        //knob one (only left knob supported)
        if(i === 0) { //left and right
            if(gamepadAxes < -0.1) {
                event = new CustomEvent('move-left');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["move-right"] = false;
                indieGameEventsObject.eventStates["move-left"] = event.strength;
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-right');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["move-left"] = false;
                indieGameEventsObject.eventStates["move-right"] = event.strength;
            }
        }

        if(i === 1) { //up and down
            if(gamepadAxes < -0.1) {
                event = new CustomEvent('move-up');
                event.strength = gamepadAxes.map(-0.1 , -1 , 0, 100);
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["move-down"] = false;
                indieGameEventsObject.eventStates["move-up"] = event.strength;
            } else if(gamepadAxes > 0.1) {
                event = new CustomEvent('move-down');
                event.strength = gamepadAxes.map(0.1 , 1 , 0, 100);
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["move-up"] = false;
                indieGameEventsObject.eventStates["move-down"] = event.strength;
            }
        }

    }

    /*
    * Translates the user actions from the controller buttons to uniform events with the gamepad mapping of an non standard gamepad (thrustmaster dual analog 4)
    * @param i: index value uf the axis from the mapping
    * @param canvas: current canvas
    * @param events: registered events
    * @param indieGameEventsObject: abstraction object
    */
    function nonStandardGamepadButtonActions(i, canvas, events, indieGameEventsObject) {
        var event;

        // console.log('nonstandard ' + (i + 1));
        //action keys
        //action one
        if (events.indexOf('action-1') !== -1 && i === 0) {
            event = new CustomEvent('action-1');
            canvas.dispatchEvent(event);
            indieGameEventsObject.eventStates["action-1"] = true; //sets events state array on action place to true (no relevant information for action keys)
        }

        //action two
        if (events.indexOf('action-2') !== -1 && i === 1) {
            event = new CustomEvent('action-2');
            canvas.dispatchEvent(event);
            indieGameEventsObject.eventStates["action-2"] = true;
        }

        //action three
        if (events.indexOf('action-3') !== -1 && i === 2) {
            event = new CustomEvent('action-3');
            canvas.dispatchEvent(event);
            indieGameEventsObject.eventStates["action-3"] = true;
        }

        //action four
        if (events.indexOf('action-4') !== -1 && i === 3) {
            event = new CustomEvent('action-4');
            canvas.dispatchEvent(event);
            indieGameEventsObject.eventStates["action-4"] = true;
        }



        //use back button for dismiss
        if(events.indexOf('dismiss') !== -1 && i === 8) {
            event = new CustomEvent('dismiss');
            canvas.dispatchEvent(event);

            showTouchMapButton(indieGameEventsObject);
            showTouchMenuButton(indieGameEventsObject);
            hideTouchDismissButton(indieGameEventsObject);
        }

        //use menu button for opening a menu
        if(events.indexOf('open-menu') !== -1 && i === 9) {
            event = new CustomEvent('open-menu');
            canvas.dispatchEvent(event);

            //hide touch menu button and touch map button if they are there
            hideTouchMenuButton(indieGameEventsObject);
            hideTouchMapButton(indieGameEventsObject);
            showTouchDismissButton(indieGameEventsObject);
        }

        //use the left trigger button to open the map
        if(events.indexOf('open-map') !== -1 && i === 5) {
            console.log(i);
            event = new CustomEvent('open-map');
            canvas.dispatchEvent(event);

            hideTouchMapButton(indieGameEventsObject);
            showTouchDismissButton(indieGameEventsObject);
        }


        //use the joystick buttons for zooming (left + and right -)
        if(events.indexOf('zoom') !== -1) {
            if(i === 11) {
                event = new CustomEvent('zoom');
                event.scale = 0.1;                              //zoom factor
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["zoom"] = 0.1;
            } else if (i === 10) {
                event = new CustomEvent('zoom');
                event.scale = -0.1;                             //zoom factor
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["zoom"] = -0.1;
            }
        }

        //use "R1" and "L1" for rotating
        if(events.indexOf('rotate') !== -1) {
            if(i === 6) {
                event = new CustomEvent('rotate');
                event.rotation = 0.2;                           //rotation angle
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["rotate"] = 0.2;

            } else if (i === 4) {
                event = new CustomEvent('rotate');
                event.rotation = -0.2;                              //rotation angle
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["rotate"] = -0.2;
            }
        }
    }

    /*
    * Translates the user actions from the controller buttons to uniform events with the w3c standard gamepad mapping
    * @param i: index value uf the axis from the mapping
    * @param canvas: current canvas
    * @param events: registered events
    * @param indieGameEventsObject: abstraction object
    */
    function standardGamepadButtonActions(i, canvas, events, indieGameEventsObject) {
        var event;

        // console.log('nonstandard ' + (i + 1));
        //action keys
        //action one
        if (events.indexOf('action-1') !== -1 && i === 0) {
            event = new CustomEvent('action-1');
            canvas.dispatchEvent(event);
            indieGameEventsObject.eventStates["action-1"] = true;
        }

        //action two
        if (events.indexOf('action-2') !== -1 && i === 2) {
            event = new CustomEvent('action-2');
            canvas.dispatchEvent(event);
            indieGameEventsObject.eventStates["action-2"] = true;
        }

        //action three
        if (events.indexOf('action-3') !== -1 && i === 1) {
            event = new CustomEvent('action-3');
            canvas.dispatchEvent(event);
            indieGameEventsObject.eventStates["action-3"] = true;
        }

        //action four
        if (events.indexOf('action-4') !== -1 && i === 3) {
            event = new CustomEvent('action-4');
            canvas.dispatchEvent(event);
            indieGameEventsObject.eventStates["action-4"] = true;
        }



        //dismiss on back button
        if(events.indexOf('dismiss') !== -1 && i === 8) {
            event = new CustomEvent('dismiss');
            canvas.dispatchEvent(event);

            showTouchMapButton(indieGameEventsObject);
            showTouchMenuButton(indieGameEventsObject);
            hideTouchDismissButton(indieGameEventsObject);
        }

        //open menu with the manu button
        if(events.indexOf('open-menu') !== -1 && i === 9) {
            event = new CustomEvent('open-menu');
            canvas.dispatchEvent(event);

            //hide touch menu button and touch map button if they are there
            hideTouchMenuButton(indieGameEventsObject);
            hideTouchMapButton(indieGameEventsObject);
            showTouchDismissButton(indieGameEventsObject);
        }

        //open map with the left arrow key of the gamepad direction buttons
        if(events.indexOf('open-map') !== -1 && i === 14) {
            event = new CustomEvent('open-map');
            canvas.dispatchEvent(event);

            hideTouchMapButton(indieGameEventsObject);
            showTouchDismissButton(indieGameEventsObject);
        }


        //zoom with the joystick buttons
        if(events.indexOf('zoom') !== -1) {
            if(i === 11) {
                event = new CustomEvent('zoom');
                event.scale = 0.1;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["zoom"] = 0.1;
            } else if (i === 10) {
                event = new CustomEvent('zoom');
                event.scale = -0.1;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["zoom"] = -0.1;
            }
        }

        //use "R1" and "L1" for rotating
        if(events.indexOf('rotate') !== -1) {
            if(i === 5) {
                event = new CustomEvent('rotate');
                event.rotation = 0.2;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["rotate"] = -0.2;
            } else if (i === 4) {
                event = new CustomEvent('rotate');
                event.rotation = -0.2;
                canvas.dispatchEvent(event);

                indieGameEventsObject.eventStates["rotate"] = -0.2;
            }
        }
    }


    /* ZOOMING */
  /* Registeres the zooming actions with multitouch and creates uniformal events out of it
  * @param canvas: current canvas
  * @param boundingRect: bounding rectangle object of the canvas
  * @param indieGameEventsObject: abstraction object
  */
    function registerZoom(canvas, boundingRect, indieGameEventsObject) {
        var hammer = indieGameEventsObject.hammer,  //gets the hammer object from the abstraction object
            event,                                  //event that will be dispatched
            lastScale;                              //scale value of the last scale

        event = new CustomEvent('zoom');

        /*touch*/
        hammer.on('pinchstart', function (e) {
            lastScale = e.scale;
        });

        hammer.on('pinchmove', function (e) {
                event.scale = (e.scale - lastScale);                                                          //relative scale value (positive on zoom in and negative on zoom out)
                lastScale = e.scale;
                event.center = {x: e.center.x - boundingRect.left, y: e.center.y - boundingRect.top};
                canvas.dispatchEvent(event);
        });
    }

    /* ROTATION */
    /* Registers the rotating actions with multitouch and creates uniformal events out of it
    * @param canvas: current canvas
    * @param boundingRect: bounding rectangle object of the canvas
    * @param indieGameEventsObject: abstraction object
    */
    function registerRotate(canvas, boundingRect, indieGameEventsObject) {
        var hammer = indieGameEventsObject.hammer,
            event,
            lastRotation;

        /*touch*/
        event = new CustomEvent('rotate');

        hammer.on('rotatestart', function (e) {
           lastRotation = e.rotation;
        });

        hammer.on('rotatemove', function (e) {
            event.rotation = (e.rotation - lastRotation);               //relative rotation value from the last frame to the current frame
            lastRotation = e.rotation;
            canvas.dispatchEvent(event);
        });
    }


    /*GYROSCOPE*/
    /* Registeres the gyroscope movement actions when they are set active by the user
   * @param canvas: current canvas
   * @param indieGameEventsObject: abstraction object
   */
    function registerGyroscope(canvas, indieGameEventsObject) {
        var joystickHidden = true, buttonsHidden = true, counter; //joysticks are hidden on standard and showed when device orientation and rotation rate is not supported

        //asks a couple of times if a gyroscope is available (sometimes it takes a while to recognize the gyroscope)
        counter = 0;

        //uses gyronorm with the gyroSettings
        _gn.init(_gyroSettings).then(function() {
            //starts the gyroscope data polling
            _gn.start(function(data){
                //gets the current orientation of the device
                var orientation = screen.orientation.type || screen.mozOrientation.type || screen.msOrientation.type;

                //hides gamepad or direction buttons when gyroscope is detected (rotation of gyroscope and the device orientation)
                if(_gn.isAvailable(GyroNorm.DEVICE_ORIENTATION) && orientation && indieGameEventsObject.touchInterface || counter < 50) {
                    //if the joystick is available hide it, we dont neeed it on gyroMode
                    if(!joystickHidden && indieGameEventsObject.touchInterface.domElements.joystick) {
                        indieGameEventsObject.touchInterface.domElements.joystick.wrapper.style.display = 'none';
                        joystickHidden = true;
                    }

                    //same for direction buttons
                    else if(!buttonsHidden && indieGameEventsObject.touchInterface.domElements.directionButtons) {
                        indieGameEventsObject.touchInterface.domElements.directionButtons.wrapper.style.display = 'none';
                        buttonsHidden = true;
                    }

                    //starts to interprete the gyroscope data and translate it to uniformal events
                   translateGyroscopeValues(data, canvas, orientation, indieGameEventsObject);

                    //else show the virtual joystick
                } else if (indieGameEventsObject.touchInterface){
                    if(joystickHidden && indieGameEventsObject.touchInterface.domElements.joystick) {
                        indieGameEventsObject.touchInterface.domElements.joystick.wrapper.style.display = 'block';
                        joystickHidden = false;
                    }

                    //or direction buttons
                    else if(buttonsHidden && indieGameEventsObject.touchInterface.domElements.directionButtons) {
                        indieGameEventsObject.touchInterface.domElements.directionButtons.wrapper.style.display = 'block';
                        buttonsHidden = false;
                    }
                    _gn.end(); //stop if rotation rate and device orientation is not supported (fallback to touch buttons or joystick)
                }

                counter++;
            });
        });

        //initialize the current direction as initial rotation
        _gn.setHeadDirection()
    }

    /* Translates the gyroscope data to uniformal events and prepares the data for the events
    * @param data: gyroscope data
   * @param canvas: current canvas
   * @param orientation: current orientation of the device
   * @param indieGameEventsObject: abstraction object
   */
    function translateGyroscopeValues(data, canvas, orientation, indieGameEventsObject) {
        var alpha, beta, gamma, event;

        //calibrate gyroscope to get the standard position of the device
        if(_gyroCalibration.calibrate) {
            _gyroCalibration.alpha = data.do.alpha;
            _gyroCalibration.beta = data.do.beta;
            _gyroCalibration.gamma = data.do.gamma;
            _gyroCalibration.calibrate = false;
            //console.log('calibrate');
        }

            //gets the calibrated gyroscope values
            alpha = data.do.alpha - _gyroCalibration.alpha;
            beta = data.do.beta - _gyroCalibration.beta;
            gamma = data.do.gamma - _gyroCalibration.gamma;


        //use gamma and beta to interpret as movement actions
        //gamma between -10deg (smallest changes dont trigger a movement) and -90deg -> move left
        if (gamma < -10 && gamma > -90) {
            event = new CustomEvent('move-left');
            //better mapping for the strenght of the gyroscope
            if(gamma > -30) {
                event.strength = gamma.map(-10, -30, 0, 100);           //gets the strength (on small tilt (unitil -30deg) there is an gradation
            } else {
                event.strength = 100;                                      //else use the full strength
            }
            canvas.dispatchEvent(event);

            //if you are moving left it is impossible to move right
            indieGameEventsObject.eventStates['move-right'] = false;
            indieGameEventsObject.eventStates['move-left'] = event.strength;
        }

        //move right
        else if (gamma > 10 && gamma < 90) {
            event = new CustomEvent('move-right');

            if(gamma < 30) {
                event.strength = gamma.map(10, 30, 0, 100);
            } else {
                event.strength = 100;
            }

            canvas.dispatchEvent(event);

            indieGameEventsObject.eventStates['move-left'] = false;
            indieGameEventsObject.eventStates['move-right'] = event.strength;
        }
        //if you are not moving left, reset the event state array
        else {
            indieGameEventsObject.eventStates['move-right'] = false;
            indieGameEventsObject.eventStates['move-left'] = false;
        }

        //move up
        if (beta < -10 && beta > -90) {
            event = new CustomEvent('move-up');

            if(beta > -30) {
                event.strength = beta.map(-10, -30, 0, 100);
            } else {
                event.strength = 100;
            }

            canvas.dispatchEvent(event);

            indieGameEventsObject.eventStates['move-down'] = false;
            indieGameEventsObject.eventStates['move-up'] = event.strength;
        }

        //move down
        else if (beta > 10 && beta < 90) {
            event = new CustomEvent('move-down');

            if(beta < 30) {
                event.strength = beta.map(10, 30, 0, 100);
            } else {
                event.strength = 100;
            }


            canvas.dispatchEvent(event);

            indieGameEventsObject.eventStates['move-up'] = false;
            indieGameEventsObject.eventStates['move-down'] = event.strength;
        }

        else {
            indieGameEventsObject.eventStates['move-up'] = false;
            indieGameEventsObject.eventStates['move-down'] = false;
        }

    }


    /*THE TOUCH INTERFACE*/
    /* Creates the touch interface when the user set touch active and touch is recognized
   * @param canvas: current canvas
   * @param boundingRect: bounding rectangle of the current canvas
   * @param indieGameEventsObject: abstraction object
   */
    function createTouchInterface(canvas, boundingRect, indieGameEventsObject) {            //Touch interface will be overlaid over the canvas
        var smallestJoystickValue = 100,                                                    //min and max values so the touchpad isnt to big or small
            highestJoystickValue = 350,
            overlayRectSize = boundingRect,                                                //gets the correct overlayRect position and size;
            events = indieGameEventsObject.settings.events;

        /*object for the touch interface is saved in the abstraction object*/
        indieGameEventsObject.touchInterface = {};
        var dom = indieGameEventsObject.touchInterface.domElements = {};

        //creates the touch interface (div)
        dom.overlay = document.createElement('div');
        dom.overlay.className += 'touchInterface';

        //sets the css style for the overlay for positioning
        setTouchOverlayStyle(overlayRectSize, dom);

        /*if we use a joystick for the arrow directions and at least one direction event is enabled */
        if (indieGameEventsObject.settings.touchDirectionController === 'joystick' && indieGameEventsObject.directions) {
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

            //sets the style for the joystich
            setJoystickStyle(dom, joystickSize);

            //hide joystick at the beginning until no gyrosope is detected
            if(indieGameEventsObject.settings.useGyroscope) {
                dom.joystick.wrapper.style.display = 'none';
            }

            //sticks everything together in the dom
            dom.overlay.appendChild(dom.joystick.wrapper).appendChild(dom.joystick.outerCircle).parentNode.appendChild(dom.joystick.innerCircle);                           //appends the joystick to the overlay

            //start interpreting the user interactions and translates them to uniformal events (uses pointer and touch api)
            if (isTouchDevice()) {
                dom.joystick.wrapper.addEventListener('touchstart', function (e) {
                    joystickTouchStartAction(e, canvas, indieGameEventsObject);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('touchmove', function (e) {
                    joystickMoveAction(e, canvas, indieGameEventsObject);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('touchend', function (e) {
                    joystickReleaseAction(e, canvas, indieGameEventsObject);
                }, {passive: true});
            } else if (isPointer()) {
                dom.joystick.wrapper.addEventListener('pointerdown', function (e) {
                    joystickTouchStartAction(e, canvas, indieGameEventsObject);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('pointermove', function (e) {
                    joystickMoveAction(e, canvas, indieGameEventsObject);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('pointerup', function (e) {
                    joystickReleaseAction(e, canvas, indieGameEventsObject);
                }, {passive: true});
            } else if (isMSPointer()) {
                dom.joystick.wrapper.addEventListener('MSPointerDown', function (e) {
                    joystickTouchStartAction(e, canvas, indieGameEventsObject);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('MSPointerMove', function (e) {
                    joystickMoveAction(e, canvas, indieGameEventsObject);
                }, {passive: true});
                dom.joystick.wrapper.addEventListener('MSPointerUp', function (e) {
                    joystickReleaseAction(e, canvas, indieGameEventsObject);
                }, {passive: true});
            }
        }

        /* if we use virtual buttons for the touch movements */
        else if ((indieGameEventsObject.settings.touchDirectionController === 'buttons' || indieGameEventsObject.settings.touchDirectionController === 'button' ) && indieGameEventsObject.directions) {
            var directionButtonSize, smallestDirectionButtonsSize = 75, highestDirectionButtonSize = 130,
                directionButtonMargin = 2, buttonEvents;

            //buttons should not be to big or to small
            directionButtonSize = Math.min(Math.max(smallestDirectionButtonsSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), highestDirectionButtonSize);


            dom.directionButtons = {};

            //creates a wrapper object for the buttons
            dom.directionButtons.wrapper = document.createElement('div');

            //creates the buttons (only if user set the corresponding events active
            //move up
            if (events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1) {
                dom.directionButtons.up = document.createElement('button');
                dom.directionButtons.up.innerHTML = "🡹";                                            //to know which direction will be used for the button (for the user)
                dom.directionButtons.up.name += dom.directionButtons.up.className += 'up-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.up);                  //appends the button to the wrapper
            }
            //move down
            if (events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1) {
                dom.directionButtons.down = document.createElement('button');
                dom.directionButtons.down.innerHTML = "🡻";
                dom.directionButtons.down.name += dom.directionButtons.down.className += 'down-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.down);
            }
            //move left
            if (events.indexOf('move-left') !== -1 || events.indexOf('move-all') !== -1) {
                dom.directionButtons.left = document.createElement('button');
                dom.directionButtons.left.innerHTML = "🡸";
                dom.directionButtons.left.name += dom.directionButtons.left.className += 'left-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.left);
            }
            //move right
            if (events.indexOf('move-right') !== -1 || events.indexOf('move-all') !== -1) {
                dom.directionButtons.right = document.createElement('button');
                dom.directionButtons.right.innerHTML = "🡺";
                dom.directionButtons.right.name += dom.directionButtons.right.className += 'right-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.right);
            }
            //if also directional buttons are needed (set active in the settings) and the corresponding events are active then create them
            if (indieGameEventsObject.settings.useEightTouchDirections) {
                //up left
                if (events.indexOf('move-left') !== -1 && events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1) {
                    dom.directionButtons.leftup = document.createElement('button');
                    dom.directionButtons.leftup.innerHTML = "🡼";
                    dom.directionButtons.leftup.name += dom.directionButtons.leftup.className += 'leftup-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.leftup);
                }

                //right down
                if (events.indexOf('move-right') !== -1 && events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1) {
                    dom.directionButtons.rightdown = document.createElement('button');
                    dom.directionButtons.rightdown.innerHTML = "🡾";
                    dom.directionButtons.rightdown.name += dom.directionButtons.rightdown.className += 'rightdown-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.rightdown);
                }

                //right up
                if (events.indexOf('move-right') !== -1 && events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1) {
                    dom.directionButtons.rightup = document.createElement('button');
                    dom.directionButtons.rightup.innerHTML = "🡽";
                    dom.directionButtons.rightup.name += dom.directionButtons.rightup.className += 'rightup-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.rightup);
                }

                //left down
                if (events.indexOf('move-left') !== -1 && events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1) {
                    dom.directionButtons.leftdown = document.createElement('button');
                    dom.directionButtons.leftdown.innerHTML = "🡿";
                    dom.directionButtons.leftdown.name += dom.directionButtons.leftdown.className += 'leftdown-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.leftdown);
                }
            }

            //which button corresponds to which event(s) (needed to translate the actions)
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

            //adds the direction buttons to the touch overlay (also set the style [positioning])
            dom.directionButtons.wrapper.className += 'direction-buttons-wrapper';
            setTouchDirectionButtonsStyle(dom, directionButtonSize, directionButtonMargin, events);
            dom.overlay.appendChild(dom.directionButtons.wrapper);

            //starts the translation for the touch button movement actions
            translateDirectionButtonEvents(dom.directionButtons.wrapper, buttonEvents, canvas, indieGameEventsObject);

            //hide direction buttons at the beginning until no gyrosope is detected when gyroscope mode is activated in the settings
            if(indieGameEventsObject.settings.useGyroscope) {
                dom.directionButtons.wrapper.style.display = 'none';
            }
        }

        //adds action buttons to the overlay if the corresponding action is set by the user for the abstraction
        if ((events.indexOf('action-1') !== -1) || events.indexOf('action-2') !== -1 || events.indexOf('action-3') !== -1 || events.indexOf('action-4') !== -1) {
            var smallestActionButtonValue = 70, highestActionButtonValue = 140, actionButtonSize;

            //set the right size for the buttons
            actionButtonSize = Math.min(Math.max(smallestActionButtonValue, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), highestActionButtonValue);

            //if the orientation is on portrait then calculate the button size differently
            if(overlayRectSize.width < overlayRectSize.height) {
                actionButtonSize = Math.min(Math.min(smallestActionButtonValue, overlayRectSize.height * 0.14), highestActionButtonValue);
            }


            //creates the wrapper for the action buttons
            dom.actionButtons = {};
            dom.actionButtons.wrapper = document.createElement('div');
            dom.actionButtons.wrapper.className += 'action-buttons-wrapper';

            //action one
            if (events.indexOf('action-1') !== -1) {
                dom.actionButtons.action1 = document.createElement('button'); //creates the butotn element
                dom.actionButtons.action1.name = 'action-1';                    //names the button element for the action
                dom.actionButtons.action1.className += 'action-1-button';
                dom.actionButtons.action1.innerHTML += "1";                     //sets an lable for the button (1 for action one)

                dom.actionButtons.wrapper.appendChild(dom.actionButtons.action1);
            }

            //action two
            if (events.indexOf('action-2') !== -1) {
                dom.actionButtons.action2 = document.createElement('button');
                dom.actionButtons.action2.name = 'action-2';
                dom.actionButtons.action2.className += 'action-2-button';
                dom.actionButtons.action2.innerHTML += "2";

                dom.actionButtons.wrapper.appendChild(dom.actionButtons.action2);
            }

            //action three
            if (events.indexOf('action-3') !== -1) {
                dom.actionButtons.action3 = document.createElement('button');
                dom.actionButtons.action3.name = 'action-3';
                dom.actionButtons.action3.className += 'action-3-button';
                dom.actionButtons.action3.innerHTML += "3";

                dom.actionButtons.wrapper.appendChild(dom.actionButtons.action3);
            }

            //action four
            if (events.indexOf('action-4') !== -1) {
                dom.actionButtons.action4 = document.createElement('button');
                dom.actionButtons.action4.name = 'action-4';
                dom.actionButtons.action4.className += 'action-4-button';
                dom.actionButtons.action4.innerHTML += "4";

                dom.actionButtons.wrapper.appendChild(dom.actionButtons.action4);
            }

            //sets the style for the touch buttons (mostly positioning things) and adds the buttons to the overlay
            setActionButtonsStyle(dom.actionButtons, actionButtonSize, directionButtonMargin);
            dom.overlay.appendChild(dom.actionButtons.wrapper);

            //starts the translation of the touch button user actions
            translateActionButtonEvents(dom.actionButtons.wrapper, canvas, indieGameEventsObject);
        }

        //adss the open map button if the corresponding event is selected by the user in the settings
        if (events.indexOf('open-map') !== -1) {
            var mapButtonSize, minMapButtonSize = 60, maxMapButtonSize = 130, mapButtonPosition;

            //sets the size
            mapButtonSize = ~~Math.min(Math.max(minMapButtonSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), maxMapButtonSize);

            //sets the position (different on portrait and landscape)
            if (overlayRectSize.height < overlayRectSize.width - 200 && overlayRectSize.width > 600) {
                mapButtonPosition = {left: overlayRectSize.width / 2 - mapButtonSize - 10, bottom: 20};
            }

            else {
                mapButtonPosition = {
                    left: overlayRectSize.width - mapButtonSize - 30,
                    bottom: overlayRectSize.height - mapButtonSize * 2 - 70
                };
            }

            //creates the element
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

            //adds the element to the touch overlay
            dom.overlay.appendChild(dom.mapButton);

            //starts translating the button action to uniformal events
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

        //dismiss button
        if (events.indexOf('dismiss') !== -1 && indieGameEventsObject.settings.touchDismissButton) {
            var dismissButtonSize, dismissButtonMinSize = 60, dismissButtonMaxSize = 130;

            //size
            dismissButtonSize = ~~Math.min(Math.max(dismissButtonMinSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), dismissButtonMaxSize);

            //creates the button
            dom.dismissButton = document.createElement('button');
            dom.dismissButton.className += 'dismiss-button';
            dom.dismissButton.innerHTML += "X";

            //sets the style
            dom.dismissButton.setAttribute('style',
                "width:" + dismissButtonSize + "px; " +
                "height:" + dismissButtonSize + "px; " +
                "left:" + (20 + overlayRectSize.left) + "px; " +
                "top:" + (20 + overlayRectSize.top) + "px; " +
                "font-size:" + mapButtonSize / 2.5 + "px; " +
                "pointer-events: all; position: absolute; color: white; background-color: black; opacity: 0.5; border: none; z-index: 210; display: none;"
            );

            //adds the button to the overlay
            dom.overlay.appendChild(dom.dismissButton);
            //document.body.appendChild(dom.dismissButton);

            //starts translating the button action
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

        //menu button
        if (events.indexOf('open-menu') && indieGameEventsObject.settings.menuButton) {
            var menuButtonSize, menuButtonMinSize = 60, menuButtonMaxSize = 130, menuButtonPosition;

            //size
            menuButtonSize = ~~Math.min(Math.max(dismissButtonMinSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), dismissButtonMaxSize);

            //position
            if (overlayRectSize.height < overlayRectSize.width  - 200 && overlayRectSize.width > 600) {
                menuButtonPosition = {left: overlayRectSize.width / 2 + 10, bottom: 20};
            }

            else {
                menuButtonPosition = {
                    left: overlayRectSize.width - menuButtonSize - 30,
                    bottom: overlayRectSize.height - menuButtonSize - 50
                };
            }

            //creates the element
            dom.menuButton = document.createElement('button');
            dom.menuButton.className += 'menu-button';
            dom.menuButton.innerHTML += "&#9776;";                                                   //hamburger symbol: &#9776;

            //set style
            dom.menuButton.setAttribute('style',
                "width:" + menuButtonSize + "px; " +
                "height:" + menuButtonSize + "px; " +
                "left:" + menuButtonPosition.left + "px; " +
                "bottom:" + menuButtonPosition.bottom + "px; " +
                "font-size:" + menuButtonSize / 2.5 + "px; " +
                "pointer-events: all; position: absolute; color: white; background-color: black; opacity: 0.5; border: none;"
            );

            //adding to overlay
            dom.overlay.appendChild(dom.menuButton);

            //starting translating actions (pointer and touch API is supported)
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


        dom.overlay.addEventListener("touchend", function (e) {
            //prevent default on touch api
            e.preventDefault();
        });

        //appends the interface directly in the body tag to prevent position relative interference
        document.body.appendChild(dom.overlay);

    }

    /*on fullscreen mode, change position of canvas overlay (and also the z-index)
     * @param dom: helds all dom elements from the library
     * @param canvas: current canvas
     */
    function touchInterfaceFullscreenHandler(dom, canvas) {
        var canvasPosRect;

        //after 100ms
        setTimeout(function () {
            canvasPosRect  = canvas.getBoundingClientRect();

            //overlay has max z index then reset the z index and reposition the canvas
            if (parseInt(dom.overlay.style.zIndex) === 2147483647) {   //2147483647 is the max z-index value
                dom.overlay.style.zIndex = dom.overlay.oldStyle.zIndex;
                dom.overlay.style.top = canvasPosRect.top + "px";
                dom.overlay.style.left = canvasPosRect.left + "px";
            } else {
                //else set the max z-index and reposition the canvas
                dom.overlay.oldStyle = JSON.parse(JSON.stringify(dom.overlay.style));
                dom.overlay.style.zIndex = 2147483647;
                dom.overlay.style.top = canvasPosRect.top + "px";
                dom.overlay.style.left = canvasPosRect.left + "px";
            }
        }, 100);
    }

    /* When the menu button is clicked
     * @param e: Event object
     * @param canvas: current canvas
     * @param dom: all dom elements creaated for this abstraction
     * @param events: user set events (or default setting event array)
     */
    function menuButtonStartAction(e, canvas, dom, events) {
        //gets the right target (function is needed because different APIs are in use to get the target
        var target = prepareTarget(e);

        //if the target is a button
        if (target instanceof HTMLButtonElement) {
            //creates the open menu event, dispatches it and hides the menu button
            canvas.dispatchEvent(new CustomEvent('open-menu'));
            dom.menuButton.style.display = 'none';

           //also hides the map button, to hide the remaining touch interface objects use canvas.hideIndieGameTouchInterfaceWithoutX();
            if (dom.mapButton) {
                dom.mapButton.style.display = 'none';
            }

            //shows the dismiss button automatically
            if (events.indexOf('dismiss') !== -1 && dom.dismissButton) {
                dom.dismissButton.style.display = 'block';
            }
        }
    }

    /* When the dismiss button is clicked
     * @param e: Event object
     * @param canvas: current canvas
     * @param dom: all dom elements creaated for this abstraction
     */
    function dismissButtonAction(e, canvas, dom) {
        var target = prepareTarget(e);

        //dispatches the uniformal dismiss event
        if (target instanceof HTMLButtonElement) {
            canvas.dispatchEvent(new CustomEvent('dismiss'));
            //hides the dismiss button
            dom.dismissButton.style.display = 'none';

            //shows the menu and map buttons
            if (dom.mapButton) {
                dom.mapButton.style.display = 'block';
            }
            if (dom.menuButton) {
                dom.menuButton.style.display = 'block';
            }
        }
    }

    /* When the open-map button is clicked
     * @param e: Event object
     * @param canvas: current canvas
     * @param dom: all dom elements creaated for this abstraction
     */
    function mapButtonStartAction(e, canvas, events, dom) {
        var target = prepareTarget(e);

        //creates and dispatches the event
        if (target instanceof HTMLButtonElement) {
            canvas.dispatchEvent(new CustomEvent('open-map'));

            //hides the map-button
            dom.mapButton.style.display = 'none';

            //if(dom.menuButton) {dom.menuButton.style.display = 'none'};

            //shows the dismiss button
            if (events.indexOf('dismiss') !== -1 && dom.dismissButton) {
                dom.dismissButton.style.display = 'block';
            }
        }
    }

    /* Sets the styles for the action buttons of the touch overlay
     * @param actionButtons: action buttons dom wrapper element
     * @param actionsButtonSize: size how big the action buttons should be
     */
    function setActionButtonsStyle(actionButtons, actionButtonSize) {
        var key, i = 0, positions, normalButtonSize;

        //sets the default size for the action buttons (variates on how many buttons are visible -> how many action events are needed by the user)
        normalButtonSize = actionButtonSize;

        //if only action 1 and action 2 are set by the user for the recogniztion
        if (actionButtons.action1 && actionButtons.action2 && !actionButtons.action3 && !actionButtons.action4) {
            //bigger button size
            actionButtonSize *= 1.2;
            //sets the position relative to the button overlay of the two buttons
            positions = [{top: actionButtonSize * 1.5, left: 0}, {
                top: actionButtonSize / 1.5,
                left: actionButtonSize * 1.5
            }];
        }
        //else if two buttons are needed by the user
        else if (countPropertiesInObject(actionButtons) === 2) {
            //bigger button size
            actionButtonSize *= 1.5;
            //sets the position relative to the button overlay
            positions = [{top: actionButtonSize, left: actionButtonSize / 2}];
        }

        //else dont set another button size, only set the position of the buttons relative to the button overlay
        else {
            positions = [{top: actionButtonSize * 2, left: actionButtonSize}, {
                top: actionButtonSize,
                left: 0
            }, {top: actionButtonSize, left: actionButtonSize * 2}, {top: 0, left: actionButtonSize}]
        }

        //sets the styles (with the calculated sizes and positions for the buttons)
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

        //resets the action button size for the button wrapper
        actionButtonSize = normalButtonSize;

        //sets the style of the button wrapper (depending of the initial buttons size)
        actionButtons.wrapper.setAttribute('style',
            "position: absolute; " +
            "width:" + actionButtonSize * 3 + "px; " +         //size
            "height:" + actionButtonSize * 3 + "px;" +
            "bottom:" + 30 + "px;" +                        //relative position to the touch overlay
            "right:" + 35 + "px"
        );
    }

    /* translates the user actions of the action buttons, uses touch and pointer API
     * @param buttonField: wrapper containing the buttons
     * @param canvas: current canvas
     * @param indieGameEventsObject: abstraction object
     */
    function translateActionButtonEvents(buttonField, canvas, indieGameEventsObject) {
        //only if the device has touch
        if (isTouchDevice()) {
            buttonField.addEventListener('touchstart', function (e) {
                actionTouchButtonStartAction(e, buttonField, canvas, indieGameEventsObject)
            }, {passive: true});
            buttonField.addEventListener('touchend', function (e) {
                actionTouchButtonEndAction(e, buttonField, canvas, indieGameEventsObject)
            }, {passive: true});
        } else if (isPointer()) {
            buttonField.addEventListener('pointerdown', function (e) {
                actionTouchButtonStartAction(e, buttonField, canvas, indieGameEventsObject)
            }, {passive: true});
            buttonField.addEventListener('pointerup', function (e) {
                actionTouchButtonEndAction(e, buttonField, canvas, indieGameEventsObject)
            }, {passive: true});
        } else if (isMSPointer()) {
            buttonField.addEventListener('MSPointerDown', function (e) {
                actionTouchButtonStartAction(e, buttonField, canvas, indieGameEventsObject)
            }, {passive: true});
            buttonField.addEventListener('MSPointerUp', function (e) {
                actionTouchButtonEndAction(e, buttonField, canvas, indieGameEventsObject)
            }, {passive: true});
        }
    }

    /* when the user started touching an action button
     * @param e: eventObject
     * @param buttonField: wrapper containing the buttons
     * @param canvas: current canvas
     * @param indieGameEventsObject: abstraction object
     */
    function actionTouchButtonStartAction(e, buttonField, canvas, indieGameEventsObject) {
        var targets = {}, i;

        //different apis have different access to the main target objects
        //gets the targets of the touch points
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

        //for every target
        for (var target in targets) {
            if (targets.hasOwnProperty(target)) {
                //start dispatching the corresponding events for the targets (the name property is here used to get the right action from the buttons)
                //saves the state in the eventStates array
                indieGameEventsObject.eventStates[targets[target].name] = true;
                //dispatch loop (every frame until the button will be released)
                targets[target].buttonPressed = window.requestAnimationFrame(function () {
                    actionTouchButtonEventDispatchLoop(targets[target], buttonField, canvas)
                });
            }

        }
    }

    /* event dispatch loop for the action buttons, when one is held down by the user
     * @param target: targetElement - touched dom element
     * @param buttonField: wrapper containing the buttons
     * @param canvas: current canvas
     */
    function actionTouchButtonEventDispatchLoop(target, buttonField ,canvas) {
        var event;

        //if the element is a button and has an action name
        if (target instanceof HTMLButtonElement && target.name) {
            //dispatch the corresponding action
            event = new CustomEvent(target.name);
            event.strength = 100;                   //no gradation, use max strength
            canvas.dispatchEvent(event);

            //keep loop running if the button is still pressed
            if(target.buttonPressed){
                target.buttonPressed = window.requestAnimationFrame(function () {actionTouchButtonEventDispatchLoop(target, buttonField, canvas)});
            }
        }
    }

    /* when the user releases a touch butotn
     * @param e: eventObject
     * @param buttonField: wrapper containing the buttons
     * @param canvas: current canvas
     * @param indieGameEventsObject: abstraction object
     */
    function actionTouchButtonEndAction(e, buttonField, canvas, indieGameEventsObject) {
        var targets = {}, i;

        //gets the targets right (because we are using different APIs for that event handler
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

        //cancel all event frame loops from the action button with all targets that were released
        for(var target in targets) {
            if(targets.hasOwnProperty(target)) {
                if (targets[target].buttonPressed) {
                    //also set the eventStaate array to false again
                    indieGameEventsObject.eventStates[targets[target].name] = false;
                    window.cancelAnimationFrame(targets[target].buttonPressed);
                    targets[target].buttonPressed = false;
                }
            }
        }
    }

    /* sets the style for the touch overlay to fit perfect over the canvas
     * @param overlayRectSize: size and position of the underlying canvas
     * @param dom: dom elements created for the current abstraction
     */
    function setTouchOverlayStyle(overlayRectSize, dom) {
        //sets the style for the interface overlay
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

    /* sets the style for the virtual joystick on the overlay (position and size mostly)
     * @param dom: dom elements created for the current abstraction
     * @param joystickSize: size the joystick should have
     */
    function setJoystickStyle(dom, joystickSize) {
        //wrapper
        dom.joystick.wrapper.setAttribute("style",
            "position: absolute; " +
            "width:" + joystickSize + "px; " +
            "height:" + joystickSize + "px; " +
            "left:" + 20 + "px; " +
            "bottom:" + 20 + "px; " +
            "border-radius: 50%;"
        );

        //outer circle
        dom.joystick.outerCircle.setAttribute("style", "pointer-events: all; border-radius: 50%; width: 100%; height: 100%; position: absolute; background: black; opacity: 0.4;");                  //joystick values can be styled from outside with !important
        //inner circle in outer circle
        dom.joystick.innerCircle.setAttribute("style", "pointer-events: all; border-radius: 50%; width: 50%; height: 50%; position: absolute; background: black; opacity: 0.3; transform: translate(-50%, -50%); top: 50%; left:50%;");
    }


    /* starts the translation of the movement user actions of the virtual joystick (touch start (pointer down...) handler)
     * @param e: eventObject
     * @param canvas: current canvas
     * @param indieGameEventsObject: abstraction object
    */
    function joystickTouchStartAction(e, canvas, indieGameEventsObject) {
        //gets all relevant data out of the touch start (pointer down...) event (like position
        var data = getJoystickTouchData(e);

        //out of bounce check (if touch takes place in outer circle)
        if (data.yPos > 0 && data.yPos < data.parentPosition.height && data.xPos > 0 && data.xPos < data.parentPosition.width) {
            //set the inner circle position to the touch point position
            data.innerCircle.style.left = data.xPos + "px";
            data.innerCircle.style.top = data.yPos + "px";
        }

        //if there isnt already a dispatch loop for the joystick running, then start one
        if (!data.innerCircle.eventDispatchID) {
            data.innerCircle.eventDispatchID = window.requestAnimationFrame(function() {triggerJoystickDirectionEvents(data, canvas, indieGameEventsObject)});
        }

    }

    function joystickMoveAction(e, canvas, indieGameEventsObject) {
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

        data.innerCircle.eventDispatchID = window.requestAnimationFrame(function() {triggerJoystickDirectionEvents(data, canvas, indieGameEventsObject)});


        data.innerCircle.style.left = data.xPos + "px";
        data.innerCircle.style.top = data.yPos + "px";
    }

    function joystickReleaseAction(e, canvas, indieGameEventsObject) {
        var data = getJoystickTouchData(e);

        data.innerCircle.style.transition = '0.2s ease';
        data.innerCircle.style.left = 50 + "%";
        data.innerCircle.style.top = 50 + "%";

        setTimeout(function () {
            data.innerCircle.style.transition = "";
        }, 200);

        window.cancelAnimationFrame(data.innerCircle.eventDispatchID);
        data.innerCircle.eventDispatchID = null;

        indieGameEventsObject.eventStates["move-left"] = false;
        indieGameEventsObject.eventStates["move-right"] = false;
        indieGameEventsObject.eventStates["move-up"] = false;
        indieGameEventsObject.eventStates["move-down"] = false;
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

    function triggerJoystickDirectionEvents(data, canvas, indieGameEventsObject) {                                     //aufzeichnen wie kreis aussieht?
        var touchPoint = {x: data.xPos, y: data.yPos},
            events = indieGameEventsObject.settings.events,
            distance = getDistance(touchPoint, data.midPoint),
            strength = ~~distance.map(0, data.midPoint.x, 0, 100),
            event,
            strengthDampen;

        //less accurate (standard mode)
        if(indieGameEventsObject.settings.touchJoystickAccuracy === 'standard' || !indieGameEventsObject.settings.touchJoystickAccuracy) {
            if (distance > data.parentPosition.width / 9) {
                angle = getAngle(data.midPoint, touchPoint);

                if (angle < 67.5 && angle > -67.5 && (events.indexOf('move-right') !== -1 || events.indexOf('move-all') !== -1)) {
                    //console.log('right');
                    event = new CustomEvent('move-right');
                    event.strength = strength;
                    canvas.dispatchEvent(event);

                    indieGameEventsObject.eventStates["move-left"] = false;
                    indieGameEventsObject.eventStates["move-right"] = strength;

                }

                if (angle < 151.5 && angle > 22.5 && (events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1)) {
                    // console.log('down');
                    event = new CustomEvent('move-down');
                    event.strength = strength;
                    canvas.dispatchEvent(event);

                    indieGameEventsObject.eventStates["move-up"] = false;
                    indieGameEventsObject.eventStates["move-down"] = strength;
                }

                if (((angle < -112.5 && angle < 0) || (angle > 0 && angle > 112.5)) && (events.indexOf('move-left') !== -1 || events.indexOf('move-all') !== -1)) {
                    //console.log('left');
                    event = new CustomEvent('move-left');
                    event.strength = strength;
                    canvas.dispatchEvent(event);

                    indieGameEventsObject.eventStates["move-right"] = false;
                    indieGameEventsObject.eventStates["move-left"] = strength;
                }

                if (angle < -28.5 && angle > -157.5 && (events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1)) {
                    //console.log('up');
                    event = new CustomEvent('move-up');
                    event.strength = strength;
                    canvas.dispatchEvent(event);

                    indieGameEventsObject.eventStates["move-down"] = false;
                    indieGameEventsObject.eventStates["move-up"] = strength;
                }
            }

            else {
                indieGameEventsObject.eventStates["move-left"] = false;
                indieGameEventsObject.eventStates["move-right"] = false;
                indieGameEventsObject.eventStates["move-up"] = false;
                indieGameEventsObject.eventStates["move-down"] = false;
            }
        }

        //accurate mode (smooth)
        else if(indieGameEventsObject.settings.touchJoystickAccuracy === 'smooth' || indieGameEventsObject.settings.touchJoystickAccuracy === 'Smooth') {
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

                    indieGameEventsObject.eventStates["move-left"] = false;
                    indieGameEventsObject.eventStates["move-right"] = event.strength;
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

                    indieGameEventsObject.eventStates["move-up"] = false;
                    indieGameEventsObject.eventStates["move-down"] = event.strength;
                }

                if (((angle < -90 && angle < 0) || (angle > 0 && angle > 90)) && (events.indexOf('move-left') !== -1 || events.indexOf('move-all') !== -1)) {
                    event = new CustomEvent('move-left');

                    if((angle > -135 && angle < 0) || (angle < 135 && angle > 0)) {
                        strengthDampen = (angle < -90) ? angle.map(-90, -135, 0, 1): angle.map(90, 135, 0, 1);
                    } else {strengthDampen = 1}

                    event.strength = strength * strengthDampen;
                    canvas.dispatchEvent(event);

                    indieGameEventsObject.eventStates["move-right"] = false;
                    indieGameEventsObject.eventStates["move-left"] = event.strength;
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

                    indieGameEventsObject.eventStates["move-down"] = false;
                    indieGameEventsObject.eventStates["move-up"] = event.strength;
                }
            }

            else {
                indieGameEventsObject.eventStates["move-left"] = false;
                indieGameEventsObject.eventStates["move-right"] = false;
                indieGameEventsObject.eventStates["move-up"] = false;
                indieGameEventsObject.eventStates["move-down"] = false;
            }
        }

        data.innerCircle.eventDispatchID = window.requestAnimationFrame(function() {triggerJoystickDirectionEvents(data, canvas, indieGameEventsObject)});
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
                    dom.directionButtons[key].setAttribute("style", "pointer-events: all; position: absolute; color: white; background-color: black; width:" + (buttonSize + leftRightBig / 4 + upDownBig * 2) + "px; height:" + (buttonSize + (leftRightBig * 2) + upDownBig / 4) + "px; border: none; margin: " + margin + "px; opacity: 0.5; border-radius: 3px; top:" + (positions[key].top - leftRightBig) + "px; left:" + (positions[key].left - upDownBig) + "px; font-size:" + ~~(buttonSize/4) +"px;");
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
    function translateDirectionButtonEvents(buttonField, buttonEvents, canvas, indieGameEventsObject) {
        if (isTouchDevice()) {
            buttonField.addEventListener('touchstart', function (e) {
                buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents, indieGameEventsObject)
            }, {passive: true});
            // buttonField.addEventListener('touchmove', function(e) {buttonFieldTouchMoveAction(e, buttonField, canvas, buttonEvents)});
            buttonField.addEventListener('touchend', function (e) {
                buttonFieldTouchEndAction(e, buttonField, canvas, buttonEvents, indieGameEventsObject)
            }, {passive: true});
        } else if (isPointer()) {
            buttonField.addEventListener('pointerdown', function (e) {
                buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents, indieGameEventsObject)
            }, {passive: true});
            // buttonField.addEventListener('pointermove', function(e) {buttonFieldTouchMoveAction(e, buttonField, canvas, buttonEvents)});
            buttonField.addEventListener('pointerup', function (e) {
                buttonFieldTouchEndAction(e, buttonField, canvas, buttonEvents, indieGameEventsObject)
            }, {passive: true});
        } else if (isMSPointer()) {
            buttonField.addEventListener('MSPointerDown', function (e) {
                buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents, indieGameEventsObject)
            }, {passive: true});
            //  buttonField.addEventListener('MSPointerMove', function(e) {buttonFieldTouchMoveAction(e, buttonField, canvas, buttonEvents)});
            buttonField.addEventListener('MSPointerUp', function (e) {
                buttonFieldTouchEndAction(e, buttonField, canvas, buttonEvents, indieGameEventsObject)
            }, {passive: true});
        }
    }

    function buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents, indieGameEventsObject) {
        var target = prepareTarget(e);

        if (!buttonField.eventDispatcherID) {

            if (target.name) {
                for (var key in buttonEvents[target.name]) {
                    if (buttonEvents[target.name].hasOwnProperty(key)) {
                        indieGameEventsObject.eventStates[buttonEvents[target.name][key]] = 100;
                    }
                }
            }

            buttonField.eventDispatcherID = window.requestAnimationFrame(function () {
                dispatchMoveButtonEvents(target, canvas, buttonEvents, buttonField)
            });           //only one touch counts
        }
    }

    function buttonFieldTouchEndAction(e, buttonField, canvas, buttonEvents, indieGameEventsObject) {
        var target = prepareTarget(e);

        if (target.name) {
            for (var key in buttonEvents[target.name]) {
                if (buttonEvents[target.name].hasOwnProperty(key)) {
                    indieGameEventsObject.eventStates[buttonEvents[target.name][key]] = false;
                }
            }
        }


        window.cancelAnimationFrame(buttonField.eventDispatcherID);
        buttonField.eventDispatcherID = null;
    }

    function dispatchMoveButtonEvents(target, canvas, buttonEvents, buttonField) {
        var event;

        if (target.name) {
            for (var key in buttonEvents[target.name]) {
                if (buttonEvents[target.name].hasOwnProperty(key)) {
                    event = new CustomEvent(buttonEvents[target.name][key]);
                    event.strength = 100;
                    canvas.dispatchEvent(event);
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
        return 'ontouchstart' in window;
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


    //This function is used to get the available events with the pressed down states (true for active, false for inactive)
    function prepareEventStateArray () {
        return {
            "action-1" : false,
            "action-2" : false,
            "action-3" : false,
            "action-4" : false,
            "move-up" : false,
            "move-left" : false,
            "move-down" : false,
            "move-right" : false,
            "zoom" : false,
            "rotate" : false,
        }
    }

    function countPropertiesInObject(obj) {
        var count = 0;

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                ++count;
        }

        return count;
    }

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


    /* rewrites the keyboard controller so you get rid of the delay */
    function KeyboardController(keys, eventStates, keyEventMap) {
        var timers, repeatAction;

        timers = {};

        document.onkeydown = function (event) {
            var key = (event || window.event).keyCode;
            if (!(key in keys))
                return true;
            if (!(key in timers)) {
                timers[key] = requestAnimationFrame(function () {
                    repeatAction(key, keys, event);
                });
            }
            return false;
        };

        // Cancel timeout and mark key as released on keyup
        document.onkeyup = function (event) {
            var key = (event || window.event).keyCode;
            if (key in timers) {
                if (timers[key] !== null) {
                    if(keyEventMap[key] !== null) {
                        eventStates[keyEventMap[key]] = false;
                    }
                    cancelAnimationFrame(timers[key]);
                }
                timers[key] = null;
                delete timers[key];
            }
        };

        // When window is unfocused we may not get key events. To prevent this
        // causing a key to 'get stuck down', cancel all held keys
        window.onblur = function () {
            for (var key in timers) {
                if (timers[key] !== null) {
                    if(keyEventMap[key] !== null) {
                        eventStates[keyEventMap[key]] = false;
                    }
                    cancelAnimationFrame(timers[key]);
                    timers[key] = null;
                }
            }

            timers = {};
        };

        repeatAction = function (key, keys, e) {
            keys[key](e);
            timers[key] = requestAnimationFrame(function () {
                repeatAction(key, keys, e)
            });

        }

    }

    //returns the API functions of the library (to make them accessible in the global module)
    return {
        register: registerIndieGameEvents,
        showTouchInterface: showIndieGameTouchInterface,
        hideTouchInterface: hideIndieGameTouchInterface,
        hideTouchInterfaceWithoutX: hideIndieGameTouchInterfaceWithoutX,
        showTouchDismissButton: showTouchDismissButton,
        getEventState: getEventState,
        hideTouchMapButton: hideTouchMapButton,
        showTouchMapButton: showTouchMapButton,
        hideTouchMenuButton: hideTouchMenuButton,
        showTouchMenuButton: showTouchMenuButton
    }


})();

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