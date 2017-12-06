"use strict";

//TODO add external libraries

//OWN LIBRARY
//self invoking functions und closures erklären (JA)
(function () {
    //standard settings for the library
    var _standardSettings,
        //Add Hammer.js to library
        _Hammer = Hammer,
        _gamepads,
        gyroMode;


    //sets the standard settings that will be overwritten with the settings object of the user
    _standardSettings = {
        events: [],
        physicalInputs: ['keyboard', 'mouse', 'touch', 'controller'],                    //joystick?
        useWASDDirections: false,
        useArrowDirections: true,
        useEightTouchDirections: true,
        touchDirectionController: 'joystick',                                                       //virtual joystick... buttons would also be an option
        joystickType: 'static',                                                                        //when a joystick is used there are two types static and dynamic (generates joystick on touch)
        doubleTabAction1: false,                                                                    //when double tabbed on the screen the action 1 event will be triggered and on the touch interface the action 1 button does not appear
        touchDismissButton: true,                                                                   //if there should be a dismiss button when a menu is opened (only works when touch interface is active)
        menuButton: true,                                                                            //if there should be a menu button (only works when touch interface is active and open-menu event is registered)
        useGyroscope: false                                                                            //TODO gyroscope mit anfangsmeldung wenn gyroscpe verwendet
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
            useEightTouchDirections: settings.useEightTouchDirections || _standardSettings.useEightTouchDirections,
            doubleTapAction1: settings.doubleTabAction1 || _standardSettings.doubleTabAction1,
            touchDismissButton: settings.touchDismissButton || _standardSettings.touchDismissButton,
            menuButton: settings.menuButton || _standardSettings.menuButton,
            useGyroscope: settings.useGyroscope || _standardSettings.useGyroscope,

        };

        _gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

        //TODO on keyboardpress f7 turn off touch or turn it on again when turned off

        this.indieGameEvents.hammer = new _Hammer(this); //registers Hammer.js for the canvas
        this.indieGameEvents.hammer.get('pinch').set({ enable: true }); //enable pinch for touch zoom


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

        gyroMode = false;

        /* touch */
        if((physicalInput.indexOf('touch') !== -1 || physicalInput.contains('touchscreen')) && isTouchDevice()) {
            /*if gyroscopoe is set in the settings and a gyroscope and touch is detected, then use it else create the touch interface*/
            if (canvas.indieGameEvents.settings.useGyroscope === true && isTouchDevice()) { //TODO gyroscope erkennen
                gyroMode = true;
                registerGyroscope(canvas);
                //https://github.com/tomgco/gyro.js
                //TODO register gyroscope (ACHTUNG funktioniert bei firefox und chrome anders)
            }

            /*create an interface for touch devices when the device has an touch input*/
            if (!isGamepadConnected()) {
                createTouchInterface(canvas, boundingRect);
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
            event;

        /*touch*/
        hammer.on('pinch', function (e) {
            if(e.additionalEvent === 'pinchout') {
                event = new CustomEvent('zoom-in');
                event.scale = e.scale;
                event.center = {x: e.center.x - boundingRect.left, y: e.center.y - boundingRect.top};
                canvas.dispatchEvent(event);
            }

            else if(e.additionalEvent === 'pinchin') {
                event = new CustomEvent('zoom-out');
                event.scale = e.scale;
                event.center = {x: e.center.x - boundingRect.left, y: e.center.y - boundingRect.top};
                canvas.dispatchEvent(event);
            }
        });

        //TODO zoom on keyboard must be different then the native chrome and zoom
        //TODO strg scroll
        //TODO zoom buttons on touch interface? (controller l1 r1 ?)
        //TODO bei tastatur scale wert ist 1.5
    }

    /* ROTATION */
    function registerRotate(canvas, boundingRect) {

    }


    /*GYROSCOPE*/
    function registerGyroscope(canvas) {

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
        if (canvas.indieGameEvents.settings.touchDirectionController === 'joystick' && canvas.indieGameEvents.directions && !gyroMode) {
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
        else if ((canvas.indieGameEvents.settings.touchDirectionController === 'buttons' || canvas.indieGameEvents.settings.touchDirectionController === 'button' ) && canvas.indieGameEvents.directions && !gyroMode) {
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
        } else if (isPointer()) {
            buttonField.addEventListener('pointerdown', function (e) {
                actionTouchButtonStartAction(e, buttonField, canvas)
            }, {passive: true});
        } else if (isMSPointer()) {
            buttonField.addEventListener('MSPointerDown', function (e) {
                actionTouchButtonStartAction(e, buttonField, canvas)
            }, {passive: true});
        }
    }

    function actionTouchButtonStartAction(e, buttonField, canvas) {
        var target = prepareTarget(e);                                                                   //TODO should also work with multitoch?

        if (target instanceof HTMLButtonElement && target.name) {
            canvas.dispatchEvent(createNewEvent(target.name));
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

        if (distance > data.midPoint.x) {
            var vectorA = {x: data.xPos - data.midPoint.x, y: data.yPos - data.midPoint.x};
            vectorA.x = vectorA.x * data.midPoint.x / distance;
            vectorA.y = vectorA.y * data.midPoint.x / distance;

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
            event;

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

    //is gyroscope available?
    function gyroscopeAvailable() {
        if (window.DeviceOrientationEvent) {

        }
        return false;
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
//TODO gyroscope?

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