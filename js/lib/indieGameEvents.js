"use strict";

//TODO: fragen wie hammer.js einbinden
/*! Hammer.JS - v2.0.8 - 2016-04-23
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
!function(a,b,c,d){"use strict";function e(a,b,c){return setTimeout(j(a,c),b)}function f(a,b,c){return Array.isArray(a)?(g(a,c[b],c),!0):!1}function g(a,b,c){var e;if(a)if(a.forEach)a.forEach(b,c);else if(a.length!==d)for(e=0;e<a.length;)b.call(c,a[e],e,a),e++;else for(e in a)a.hasOwnProperty(e)&&b.call(c,a[e],e,a)}function h(b,c,d){var e="DEPRECATED METHOD: "+c+"\n"+d+" AT \n";return function(){var c=new Error("get-stack-trace"),d=c&&c.stack?c.stack.replace(/^[^\(]+?[\n$]/gm,"").replace(/^\s+at\s+/gm,"").replace(/^Object.<anonymous>\s*\(/gm,"{anonymous}()@"):"Unknown Stack Trace",f=a.console&&(a.console.warn||a.console.log);return f&&f.call(a.console,e,d),b.apply(this,arguments)}}function i(a,b,c){var d,e=b.prototype;d=a.prototype=Object.create(e),d.constructor=a,d._super=e,c&&la(d,c)}function j(a,b){return function(){return a.apply(b,arguments)}}function k(a,b){return typeof a==oa?a.apply(b?b[0]||d:d,b):a}function l(a,b){return a===d?b:a}function m(a,b,c){g(q(b),function(b){a.addEventListener(b,c,!1)})}function n(a,b,c){g(q(b),function(b){a.removeEventListener(b,c,!1)})}function o(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1}function p(a,b){return a.indexOf(b)>-1}function q(a){return a.trim().split(/\s+/g)}function r(a,b,c){if(a.indexOf&&!c)return a.indexOf(b);for(var d=0;d<a.length;){if(c&&a[d][c]==b||!c&&a[d]===b)return d;d++}return-1}function s(a){return Array.prototype.slice.call(a,0)}function t(a,b,c){for(var d=[],e=[],f=0;f<a.length;){var g=b?a[f][b]:a[f];r(e,g)<0&&d.push(a[f]),e[f]=g,f++}return c&&(d=b?d.sort(function(a,c){return a[b]>c[b]}):d.sort()),d}function u(a,b){for(var c,e,f=b[0].toUpperCase()+b.slice(1),g=0;g<ma.length;){if(c=ma[g],e=c?c+f:b,e in a)return e;g++}return d}function v(){return ua++}function w(b){var c=b.ownerDocument||b;return c.defaultView||c.parentWindow||a}function x(a,b){var c=this;this.manager=a,this.callback=b,this.element=a.element,this.target=a.options.inputTarget,this.domHandler=function(b){k(a.options.enable,[a])&&c.handler(b)},this.init()}function y(a){var b,c=a.options.inputClass;return new(b=c?c:xa?M:ya?P:wa?R:L)(a,z)}function z(a,b,c){var d=c.pointers.length,e=c.changedPointers.length,f=b&Ea&&d-e===0,g=b&(Ga|Ha)&&d-e===0;c.isFirst=!!f,c.isFinal=!!g,f&&(a.session={}),c.eventType=b,A(a,c),a.emit("hammer.input",c),a.recognize(c),a.session.prevInput=c}function A(a,b){var c=a.session,d=b.pointers,e=d.length;c.firstInput||(c.firstInput=D(b)),e>1&&!c.firstMultiple?c.firstMultiple=D(b):1===e&&(c.firstMultiple=!1);var f=c.firstInput,g=c.firstMultiple,h=g?g.center:f.center,i=b.center=E(d);b.timeStamp=ra(),b.deltaTime=b.timeStamp-f.timeStamp,b.angle=I(h,i),b.distance=H(h,i),B(c,b),b.offsetDirection=G(b.deltaX,b.deltaY);var j=F(b.deltaTime,b.deltaX,b.deltaY);b.overallVelocityX=j.x,b.overallVelocityY=j.y,b.overallVelocity=qa(j.x)>qa(j.y)?j.x:j.y,b.scale=g?K(g.pointers,d):1,b.rotation=g?J(g.pointers,d):0,b.maxPointers=c.prevInput?b.pointers.length>c.prevInput.maxPointers?b.pointers.length:c.prevInput.maxPointers:b.pointers.length,C(c,b);var k=a.element;o(b.srcEvent.target,k)&&(k=b.srcEvent.target),b.target=k}function B(a,b){var c=b.center,d=a.offsetDelta||{},e=a.prevDelta||{},f=a.prevInput||{};b.eventType!==Ea&&f.eventType!==Ga||(e=a.prevDelta={x:f.deltaX||0,y:f.deltaY||0},d=a.offsetDelta={x:c.x,y:c.y}),b.deltaX=e.x+(c.x-d.x),b.deltaY=e.y+(c.y-d.y)}function C(a,b){var c,e,f,g,h=a.lastInterval||b,i=b.timeStamp-h.timeStamp;if(b.eventType!=Ha&&(i>Da||h.velocity===d)){var j=b.deltaX-h.deltaX,k=b.deltaY-h.deltaY,l=F(i,j,k);e=l.x,f=l.y,c=qa(l.x)>qa(l.y)?l.x:l.y,g=G(j,k),a.lastInterval=b}else c=h.velocity,e=h.velocityX,f=h.velocityY,g=h.direction;b.velocity=c,b.velocityX=e,b.velocityY=f,b.direction=g}function D(a){for(var b=[],c=0;c<a.pointers.length;)b[c]={clientX:pa(a.pointers[c].clientX),clientY:pa(a.pointers[c].clientY)},c++;return{timeStamp:ra(),pointers:b,center:E(b),deltaX:a.deltaX,deltaY:a.deltaY}}function E(a){var b=a.length;if(1===b)return{x:pa(a[0].clientX),y:pa(a[0].clientY)};for(var c=0,d=0,e=0;b>e;)c+=a[e].clientX,d+=a[e].clientY,e++;return{x:pa(c/b),y:pa(d/b)}}function F(a,b,c){return{x:b/a||0,y:c/a||0}}function G(a,b){return a===b?Ia:qa(a)>=qa(b)?0>a?Ja:Ka:0>b?La:Ma}function H(a,b,c){c||(c=Qa);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return Math.sqrt(d*d+e*e)}function I(a,b,c){c||(c=Qa);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return 180*Math.atan2(e,d)/Math.PI}function J(a,b){return I(b[1],b[0],Ra)+I(a[1],a[0],Ra)}function K(a,b){return H(b[0],b[1],Ra)/H(a[0],a[1],Ra)}function L(){this.evEl=Ta,this.evWin=Ua,this.pressed=!1,x.apply(this,arguments)}function M(){this.evEl=Xa,this.evWin=Ya,x.apply(this,arguments),this.store=this.manager.session.pointerEvents=[]}function N(){this.evTarget=$a,this.evWin=_a,this.started=!1,x.apply(this,arguments)}function O(a,b){var c=s(a.touches),d=s(a.changedTouches);return b&(Ga|Ha)&&(c=t(c.concat(d),"identifier",!0)),[c,d]}function P(){this.evTarget=bb,this.targetIds={},x.apply(this,arguments)}function Q(a,b){var c=s(a.touches),d=this.targetIds;if(b&(Ea|Fa)&&1===c.length)return d[c[0].identifier]=!0,[c,c];var e,f,g=s(a.changedTouches),h=[],i=this.target;if(f=c.filter(function(a){return o(a.target,i)}),b===Ea)for(e=0;e<f.length;)d[f[e].identifier]=!0,e++;for(e=0;e<g.length;)d[g[e].identifier]&&h.push(g[e]),b&(Ga|Ha)&&delete d[g[e].identifier],e++;return h.length?[t(f.concat(h),"identifier",!0),h]:void 0}function R(){x.apply(this,arguments);var a=j(this.handler,this);this.touch=new P(this.manager,a),this.mouse=new L(this.manager,a),this.primaryTouch=null,this.lastTouches=[]}function S(a,b){a&Ea?(this.primaryTouch=b.changedPointers[0].identifier,T.call(this,b)):a&(Ga|Ha)&&T.call(this,b)}function T(a){var b=a.changedPointers[0];if(b.identifier===this.primaryTouch){var c={x:b.clientX,y:b.clientY};this.lastTouches.push(c);var d=this.lastTouches,e=function(){var a=d.indexOf(c);a>-1&&d.splice(a,1)};setTimeout(e,cb)}}function U(a){for(var b=a.srcEvent.clientX,c=a.srcEvent.clientY,d=0;d<this.lastTouches.length;d++){var e=this.lastTouches[d],f=Math.abs(b-e.x),g=Math.abs(c-e.y);if(db>=f&&db>=g)return!0}return!1}function V(a,b){this.manager=a,this.set(b)}function W(a){if(p(a,jb))return jb;var b=p(a,kb),c=p(a,lb);return b&&c?jb:b||c?b?kb:lb:p(a,ib)?ib:hb}function X(){if(!fb)return!1;var b={},c=a.CSS&&a.CSS.supports;return["auto","manipulation","pan-y","pan-x","pan-x pan-y","none"].forEach(function(d){b[d]=c?a.CSS.supports("touch-action",d):!0}),b}function Y(a){this.options=la({},this.defaults,a||{}),this.id=v(),this.manager=null,this.options.enable=l(this.options.enable,!0),this.state=nb,this.simultaneous={},this.requireFail=[]}function Z(a){return a&sb?"cancel":a&qb?"end":a&pb?"move":a&ob?"start":""}function $(a){return a==Ma?"down":a==La?"up":a==Ja?"left":a==Ka?"right":""}function _(a,b){var c=b.manager;return c?c.get(a):a}function aa(){Y.apply(this,arguments)}function ba(){aa.apply(this,arguments),this.pX=null,this.pY=null}function ca(){aa.apply(this,arguments)}function da(){Y.apply(this,arguments),this._timer=null,this._input=null}function ea(){aa.apply(this,arguments)}function fa(){aa.apply(this,arguments)}function ga(){Y.apply(this,arguments),this.pTime=!1,this.pCenter=!1,this._timer=null,this._input=null,this.count=0}function ha(a,b){return b=b||{},b.recognizers=l(b.recognizers,ha.defaults.preset),new ia(a,b)}function ia(a,b){this.options=la({},ha.defaults,b||{}),this.options.inputTarget=this.options.inputTarget||a,this.handlers={},this.session={},this.recognizers=[],this.oldCssProps={},this.element=a,this.input=y(this),this.touchAction=new V(this,this.options.touchAction),ja(this,!0),g(this.options.recognizers,function(a){var b=this.add(new a[0](a[1]));a[2]&&b.recognizeWith(a[2]),a[3]&&b.requireFailure(a[3])},this)}function ja(a,b){var c=a.element;if(c.style){var d;g(a.options.cssProps,function(e,f){d=u(c.style,f),b?(a.oldCssProps[d]=c.style[d],c.style[d]=e):c.style[d]=a.oldCssProps[d]||""}),b||(a.oldCssProps={})}}function ka(a,c){var d=b.createEvent("Event");d.initEvent(a,!0,!0),d.gesture=c,c.target.dispatchEvent(d)}var la,ma=["","webkit","Moz","MS","ms","o"],na=b.createElement("div"),oa="function",pa=Math.round,qa=Math.abs,ra=Date.now;la="function"!=typeof Object.assign?function(a){if(a===d||null===a)throw new TypeError("Cannot convert undefined or null to object");for(var b=Object(a),c=1;c<arguments.length;c++){var e=arguments[c];if(e!==d&&null!==e)for(var f in e)e.hasOwnProperty(f)&&(b[f]=e[f])}return b}:Object.assign;var sa=h(function(a,b,c){for(var e=Object.keys(b),f=0;f<e.length;)(!c||c&&a[e[f]]===d)&&(a[e[f]]=b[e[f]]),f++;return a},"extend","Use `assign`."),ta=h(function(a,b){return sa(a,b,!0)},"merge","Use `assign`."),ua=1,va=/mobile|tablet|ip(ad|hone|od)|android/i,wa="ontouchstart"in a,xa=u(a,"PointerEvent")!==d,ya=wa&&va.test(navigator.userAgent),za="touch",Aa="pen",Ba="mouse",Ca="kinect",Da=25,Ea=1,Fa=2,Ga=4,Ha=8,Ia=1,Ja=2,Ka=4,La=8,Ma=16,Na=Ja|Ka,Oa=La|Ma,Pa=Na|Oa,Qa=["x","y"],Ra=["clientX","clientY"];x.prototype={handler:function(){},init:function(){this.evEl&&m(this.element,this.evEl,this.domHandler),this.evTarget&&m(this.target,this.evTarget,this.domHandler),this.evWin&&m(w(this.element),this.evWin,this.domHandler)},destroy:function(){this.evEl&&n(this.element,this.evEl,this.domHandler),this.evTarget&&n(this.target,this.evTarget,this.domHandler),this.evWin&&n(w(this.element),this.evWin,this.domHandler)}};var Sa={mousedown:Ea,mousemove:Fa,mouseup:Ga},Ta="mousedown",Ua="mousemove mouseup";i(L,x,{handler:function(a){var b=Sa[a.type];b&Ea&&0===a.button&&(this.pressed=!0),b&Fa&&1!==a.which&&(b=Ga),this.pressed&&(b&Ga&&(this.pressed=!1),this.callback(this.manager,b,{pointers:[a],changedPointers:[a],pointerType:Ba,srcEvent:a}))}});var Va={pointerdown:Ea,pointermove:Fa,pointerup:Ga,pointercancel:Ha,pointerout:Ha},Wa={2:za,3:Aa,4:Ba,5:Ca},Xa="pointerdown",Ya="pointermove pointerup pointercancel";a.MSPointerEvent&&!a.PointerEvent&&(Xa="MSPointerDown",Ya="MSPointerMove MSPointerUp MSPointerCancel"),i(M,x,{handler:function(a){var b=this.store,c=!1,d=a.type.toLowerCase().replace("ms",""),e=Va[d],f=Wa[a.pointerType]||a.pointerType,g=f==za,h=r(b,a.pointerId,"pointerId");e&Ea&&(0===a.button||g)?0>h&&(b.push(a),h=b.length-1):e&(Ga|Ha)&&(c=!0),0>h||(b[h]=a,this.callback(this.manager,e,{pointers:b,changedPointers:[a],pointerType:f,srcEvent:a}),c&&b.splice(h,1))}});var Za={touchstart:Ea,touchmove:Fa,touchend:Ga,touchcancel:Ha},$a="touchstart",_a="touchstart touchmove touchend touchcancel";i(N,x,{handler:function(a){var b=Za[a.type];if(b===Ea&&(this.started=!0),this.started){var c=O.call(this,a,b);b&(Ga|Ha)&&c[0].length-c[1].length===0&&(this.started=!1),this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:za,srcEvent:a})}}});var ab={touchstart:Ea,touchmove:Fa,touchend:Ga,touchcancel:Ha},bb="touchstart touchmove touchend touchcancel";i(P,x,{handler:function(a){var b=ab[a.type],c=Q.call(this,a,b);c&&this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:za,srcEvent:a})}});var cb=2500,db=25;i(R,x,{handler:function(a,b,c){var d=c.pointerType==za,e=c.pointerType==Ba;if(!(e&&c.sourceCapabilities&&c.sourceCapabilities.firesTouchEvents)){if(d)S.call(this,b,c);else if(e&&U.call(this,c))return;this.callback(a,b,c)}},destroy:function(){this.touch.destroy(),this.mouse.destroy()}});var eb=u(na.style,"touchAction"),fb=eb!==d,gb="compute",hb="auto",ib="manipulation",jb="none",kb="pan-x",lb="pan-y",mb=X();V.prototype={set:function(a){a==gb&&(a=this.compute()),fb&&this.manager.element.style&&mb[a]&&(this.manager.element.style[eb]=a),this.actions=a.toLowerCase().trim()},update:function(){this.set(this.manager.options.touchAction)},compute:function(){var a=[];return g(this.manager.recognizers,function(b){k(b.options.enable,[b])&&(a=a.concat(b.getTouchAction()))}),W(a.join(" "))},preventDefaults:function(a){var b=a.srcEvent,c=a.offsetDirection;if(this.manager.session.prevented)return void b.preventDefault();var d=this.actions,e=p(d,jb)&&!mb[jb],f=p(d,lb)&&!mb[lb],g=p(d,kb)&&!mb[kb];if(e){var h=1===a.pointers.length,i=a.distance<2,j=a.deltaTime<250;if(h&&i&&j)return}return g&&f?void 0:e||f&&c&Na||g&&c&Oa?this.preventSrc(b):void 0},preventSrc:function(a){this.manager.session.prevented=!0,a.preventDefault()}};var nb=1,ob=2,pb=4,qb=8,rb=qb,sb=16,tb=32;Y.prototype={defaults:{},set:function(a){return la(this.options,a),this.manager&&this.manager.touchAction.update(),this},recognizeWith:function(a){if(f(a,"recognizeWith",this))return this;var b=this.simultaneous;return a=_(a,this),b[a.id]||(b[a.id]=a,a.recognizeWith(this)),this},dropRecognizeWith:function(a){return f(a,"dropRecognizeWith",this)?this:(a=_(a,this),delete this.simultaneous[a.id],this)},requireFailure:function(a){if(f(a,"requireFailure",this))return this;var b=this.requireFail;return a=_(a,this),-1===r(b,a)&&(b.push(a),a.requireFailure(this)),this},dropRequireFailure:function(a){if(f(a,"dropRequireFailure",this))return this;a=_(a,this);var b=r(this.requireFail,a);return b>-1&&this.requireFail.splice(b,1),this},hasRequireFailures:function(){return this.requireFail.length>0},canRecognizeWith:function(a){return!!this.simultaneous[a.id]},emit:function(a){function b(b){c.manager.emit(b,a)}var c=this,d=this.state;qb>d&&b(c.options.event+Z(d)),b(c.options.event),a.additionalEvent&&b(a.additionalEvent),d>=qb&&b(c.options.event+Z(d))},tryEmit:function(a){return this.canEmit()?this.emit(a):void(this.state=tb)},canEmit:function(){for(var a=0;a<this.requireFail.length;){if(!(this.requireFail[a].state&(tb|nb)))return!1;a++}return!0},recognize:function(a){var b=la({},a);return k(this.options.enable,[this,b])?(this.state&(rb|sb|tb)&&(this.state=nb),this.state=this.process(b),void(this.state&(ob|pb|qb|sb)&&this.tryEmit(b))):(this.reset(),void(this.state=tb))},process:function(a){},getTouchAction:function(){},reset:function(){}},i(aa,Y,{defaults:{pointers:1},attrTest:function(a){var b=this.options.pointers;return 0===b||a.pointers.length===b},process:function(a){var b=this.state,c=a.eventType,d=b&(ob|pb),e=this.attrTest(a);return d&&(c&Ha||!e)?b|sb:d||e?c&Ga?b|qb:b&ob?b|pb:ob:tb}}),i(ba,aa,{defaults:{event:"pan",threshold:10,pointers:1,direction:Pa},getTouchAction:function(){var a=this.options.direction,b=[];return a&Na&&b.push(lb),a&Oa&&b.push(kb),b},directionTest:function(a){var b=this.options,c=!0,d=a.distance,e=a.direction,f=a.deltaX,g=a.deltaY;return e&b.direction||(b.direction&Na?(e=0===f?Ia:0>f?Ja:Ka,c=f!=this.pX,d=Math.abs(a.deltaX)):(e=0===g?Ia:0>g?La:Ma,c=g!=this.pY,d=Math.abs(a.deltaY))),a.direction=e,c&&d>b.threshold&&e&b.direction},attrTest:function(a){return aa.prototype.attrTest.call(this,a)&&(this.state&ob||!(this.state&ob)&&this.directionTest(a))},emit:function(a){this.pX=a.deltaX,this.pY=a.deltaY;var b=$(a.direction);b&&(a.additionalEvent=this.options.event+b),this._super.emit.call(this,a)}}),i(ca,aa,{defaults:{event:"pinch",threshold:0,pointers:2},getTouchAction:function(){return[jb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.scale-1)>this.options.threshold||this.state&ob)},emit:function(a){if(1!==a.scale){var b=a.scale<1?"in":"out";a.additionalEvent=this.options.event+b}this._super.emit.call(this,a)}}),i(da,Y,{defaults:{event:"press",pointers:1,time:251,threshold:9},getTouchAction:function(){return[hb]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime>b.time;if(this._input=a,!d||!c||a.eventType&(Ga|Ha)&&!f)this.reset();else if(a.eventType&Ea)this.reset(),this._timer=e(function(){this.state=rb,this.tryEmit()},b.time,this);else if(a.eventType&Ga)return rb;return tb},reset:function(){clearTimeout(this._timer)},emit:function(a){this.state===rb&&(a&&a.eventType&Ga?this.manager.emit(this.options.event+"up",a):(this._input.timeStamp=ra(),this.manager.emit(this.options.event,this._input)))}}),i(ea,aa,{defaults:{event:"rotate",threshold:0,pointers:2},getTouchAction:function(){return[jb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.rotation)>this.options.threshold||this.state&ob)}}),i(fa,aa,{defaults:{event:"swipe",threshold:10,velocity:.3,direction:Na|Oa,pointers:1},getTouchAction:function(){return ba.prototype.getTouchAction.call(this)},attrTest:function(a){var b,c=this.options.direction;return c&(Na|Oa)?b=a.overallVelocity:c&Na?b=a.overallVelocityX:c&Oa&&(b=a.overallVelocityY),this._super.attrTest.call(this,a)&&c&a.offsetDirection&&a.distance>this.options.threshold&&a.maxPointers==this.options.pointers&&qa(b)>this.options.velocity&&a.eventType&Ga},emit:function(a){var b=$(a.offsetDirection);b&&this.manager.emit(this.options.event+b,a),this.manager.emit(this.options.event,a)}}),i(ga,Y,{defaults:{event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:9,posThreshold:10},getTouchAction:function(){return[ib]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime<b.time;if(this.reset(),a.eventType&Ea&&0===this.count)return this.failTimeout();if(d&&f&&c){if(a.eventType!=Ga)return this.failTimeout();var g=this.pTime?a.timeStamp-this.pTime<b.interval:!0,h=!this.pCenter||H(this.pCenter,a.center)<b.posThreshold;this.pTime=a.timeStamp,this.pCenter=a.center,h&&g?this.count+=1:this.count=1,this._input=a;var i=this.count%b.taps;if(0===i)return this.hasRequireFailures()?(this._timer=e(function(){this.state=rb,this.tryEmit()},b.interval,this),ob):rb}return tb},failTimeout:function(){return this._timer=e(function(){this.state=tb},this.options.interval,this),tb},reset:function(){clearTimeout(this._timer)},emit:function(){this.state==rb&&(this._input.tapCount=this.count,this.manager.emit(this.options.event,this._input))}}),ha.VERSION="2.0.8",ha.defaults={domEvents:!1,touchAction:gb,enable:!0,inputTarget:null,inputClass:null,preset:[[ea,{enable:!1}],[ca,{enable:!1},["rotate"]],[fa,{direction:Na}],[ba,{direction:Na},["swipe"]],[ga],[ga,{event:"doubletap",taps:2},["tap"]],[da]],cssProps:{userSelect:"none",touchSelect:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}};var ub=1,vb=2;ia.prototype={set:function(a){return la(this.options,a),a.touchAction&&this.touchAction.update(),a.inputTarget&&(this.input.destroy(),this.input.target=a.inputTarget,this.input.init()),this},stop:function(a){this.session.stopped=a?vb:ub},recognize:function(a){var b=this.session;if(!b.stopped){this.touchAction.preventDefaults(a);var c,d=this.recognizers,e=b.curRecognizer;(!e||e&&e.state&rb)&&(e=b.curRecognizer=null);for(var f=0;f<d.length;)c=d[f],b.stopped===vb||e&&c!=e&&!c.canRecognizeWith(e)?c.reset():c.recognize(a),!e&&c.state&(ob|pb|qb)&&(e=b.curRecognizer=c),f++}},get:function(a){if(a instanceof Y)return a;for(var b=this.recognizers,c=0;c<b.length;c++)if(b[c].options.event==a)return b[c];return null},add:function(a){if(f(a,"add",this))return this;var b=this.get(a.options.event);return b&&this.remove(b),this.recognizers.push(a),a.manager=this,this.touchAction.update(),a},remove:function(a){if(f(a,"remove",this))return this;if(a=this.get(a)){var b=this.recognizers,c=r(b,a);-1!==c&&(b.splice(c,1),this.touchAction.update())}return this},on:function(a,b){if(a!==d&&b!==d){var c=this.handlers;return g(q(a),function(a){c[a]=c[a]||[],c[a].push(b)}),this}},off:function(a,b){if(a!==d){var c=this.handlers;return g(q(a),function(a){b?c[a]&&c[a].splice(r(c[a],b),1):delete c[a]}),this}},emit:function(a,b){this.options.domEvents&&ka(a,b);var c=this.handlers[a]&&this.handlers[a].slice();if(c&&c.length){b.type=a,b.preventDefault=function(){b.srcEvent.preventDefault()};for(var d=0;d<c.length;)c[d](b),d++}},destroy:function(){this.element&&ja(this,!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}},la(ha,{INPUT_START:Ea,INPUT_MOVE:Fa,INPUT_END:Ga,INPUT_CANCEL:Ha,STATE_POSSIBLE:nb,STATE_BEGAN:ob,STATE_CHANGED:pb,STATE_ENDED:qb,STATE_RECOGNIZED:rb,STATE_CANCELLED:sb,STATE_FAILED:tb,DIRECTION_NONE:Ia,DIRECTION_LEFT:Ja,DIRECTION_RIGHT:Ka,DIRECTION_UP:La,DIRECTION_DOWN:Ma,DIRECTION_HORIZONTAL:Na,DIRECTION_VERTICAL:Oa,DIRECTION_ALL:Pa,Manager:ia,Input:x,TouchAction:V,TouchInput:P,MouseInput:L,PointerEventInput:M,TouchMouseInput:R,SingleTouchInput:N,Recognizer:Y,AttrRecognizer:aa,Tap:ga,Pan:ba,Swipe:fa,Pinch:ca,Rotate:ea,Press:da,on:m,off:n,each:g,merge:ta,extend:sa,assign:la,inherit:i,bindFn:j,prefixed:u});var wb="undefined"!=typeof a?a:"undefined"!=typeof self?self:{};wb.Hammer=ha,"function"==typeof define&&define.amd?define(function(){return ha}):"undefined"!=typeof module&&module.exports?module.exports=ha:a[c]=ha}(window,document,"Hammer");


//OWN LIBRARY
//self invoking functions und closures erklären?
(function () {
    //standard settings for the library
    var _standardSettings,
    //Add Hammer.js to library
     _Hammer = Hammer,
        _gamepads;


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

        this.indieGameEvents.hammer = new _Hammer(this, {
            pinch: true
        });


        eventTranslator(this);                                                              //main function, translates the physical events to the right events

        return this.indieGameEvents; //the object where you can do something with //TODO should be there or not?
    };

    HTMLCanvasElement.prototype.hideIndieGameTouchInterface = function() {
        if(this.indieGameEvents.touchInterface && this.indieGameEvents.touchInterface.domElements && this.indieGameEvents.touchInterface.domElements.overlay) {
            this.indieGameEvents.touchInterface.domElements.overlay.style.display = 'none';

            if(this.indieGameEvents.touchInterface.domElements.dismissButton) {
                this.indieGameEvents.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    };

    HTMLCanvasElement.prototype.showIndieGameTouchInterface = function() {
        if(this.indieGameEvents.touchInterface && this.indieGameEvents.touchInterface.domElements && this.indieGameEvents.touchInterface.domElements.overlay) {
            this.indieGameEvents.touchInterface.domElements.overlay.style.display = 'block';

            if(this.indieGameEvents.touchInterface.domElements.dismissButton) {
                this.indieGameEvents.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    };

    HTMLCanvasElement.prototype.hideIndieGameTouchInterfaceWithoutX = function() {
        if(this.indieGameEvents.touchInterface && this.indieGameEvents.touchInterface.domElements && this.indieGameEvents.touchInterface.domElements.overlay) {
            this.indieGameEvents.touchInterface.domElements.overlay.style.display = 'none';

            if(this.indieGameEvents.touchInterface.domElements.dismissButton) {
                this.indieGameEvents.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    };

    HTMLCanvasElement.prototype.showTouchDismissButton = function() {
        if(this.indieGameEvents.touchInterface && this.indieGameEvents.touchInterface.domElements && this.indieGameEvents.touchInterface.domElements.overlay) {
            if(this.indieGameEvents.touchInterface.domElements.dismissButton) {
                this.indieGameEvents.touchInterface.domElements.dismissButton.display = 'block';
            }
        }
    };


    /*MAIN*/
    function eventTranslator(canvas) {
        var events = canvas.indieGameEvents.settings.events,
            physicalInput = canvas.indieGameEvents.settings.physicalInputs;

        /*directions*/
        if(events.indexOf('move-all') !== -1) {                                                     //for directions (naming scheme with -)
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

        if(canvas.indieGameEvents.settings.useGyroscope === true) { //TODO gyroscope erkennen
            //TODO register gyroscope (ACHTUNG funktioniert bei firefox und chrome anders)
        }

        /*create an interface for touch devices when the device has an touch input*/
        if((physicalInput.indexOf('touch') !== -1 || physicalInput.contains('touchscreen')) && isTouchDevice() && !isGamepadConnected() && canvas.indieGameEvents.settings.useGyroscope === false) {
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
               dom.joystick.wrapper.addEventListener('touchstart', function(e) {joystickTouchStartAction(e, canvas);}, {passive: true});
                dom.joystick.wrapper.addEventListener('touchmove', function(e) {joystickMoveAction(e, canvas);}, {passive: true});
                dom.joystick.wrapper.addEventListener('touchend', function(e) {joystickReleaseAction(e, canvas);}, {passive: true});
            } else if (isPointer()) {
                dom.joystick.wrapper.addEventListener('pointerdown', function(e) {joystickTouchStartAction(e);}, {passive: true});
                dom.joystick.wrapper.addEventListener('pointermove', function(e) {joystickMoveAction(e, canvas);}, {passive: true});
                dom.joystick.wrapper.addEventListener('pointerup', function(e) {joystickReleaseAction(e, canvas);}, {passive: true});
            } else if (isMSPointer()) {
                dom.joystick.wrapper.addEventListener('MSPointerDown', function(e) {joystickTouchStartAction(e, canvas);}, {passive: true});
                dom.joystick.wrapper.addEventListener('MSPointerMove', function(e) {joystickMoveAction(e, canvas);}, {passive: true});
                dom.joystick.wrapper.addEventListener('MSPointerUp', function(e) {joystickReleaseAction(e, canvas);}, {passive: true});
            }
        }

        /* if we use buttons for the touch movements */
        else if ((canvas.indieGameEvents.settings.touchDirectionController === 'buttons' || canvas.indieGameEvents.settings.touchDirectionController === 'button' ) && canvas.indieGameEvents.directions) {
            var directionButtonSize, smallestDirectionButtonsSize = 75, highestDirectionButtonSize = 110, directionButtonMargin = 2, buttonEvents;

            directionButtonSize =  Math.min(Math.max(smallestDirectionButtonsSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), highestDirectionButtonSize);

            dom.directionButtons = {};
            dom.directionButtons.wrapper = document.createElement('div');
            if(events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1) {
                dom.directionButtons.up = document.createElement('button');
                dom.directionButtons.up.innerHTML = "🡹";
                dom.directionButtons.up.name += dom.directionButtons.up.className +=  'up-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.up);
            }
            if(events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1) {
                dom.directionButtons.down = document.createElement('button');
                dom.directionButtons.down.innerHTML = "🡻";
                dom.directionButtons.down.name += dom.directionButtons.down.className += 'down-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.down);
            }

            if(events.indexOf('move-left') !== -1 || events.indexOf('move-all') !== -1){
                dom.directionButtons.left = document.createElement('button');
                dom.directionButtons.left.innerHTML = "🡸";
                dom.directionButtons.left.name += dom.directionButtons.left.className += 'left-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.left);
            }

            if(events.indexOf('move-right') !== -1 || events.indexOf('move-all') !== -1){
                dom.directionButtons.right = document.createElement('button');
                dom.directionButtons.right.innerHTML = "🡺";
                dom.directionButtons.right.name += dom.directionButtons.right.className += 'right-button';
                dom.directionButtons.wrapper.appendChild(dom.directionButtons.right);
            }

            if(canvas.indieGameEvents.settings.useEightTouchDirections) {
                if(events.indexOf('move-left') !== -1 && events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1){
                    dom.directionButtons.leftup = document.createElement('button');
                    dom.directionButtons.leftup.innerHTML = "🡼";
                    dom.directionButtons.leftup.name += dom.directionButtons.leftup.className += 'leftup-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.leftup);
                }

                if(events.indexOf('move-right') !== -1 && events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1 ){
                    dom.directionButtons.rightdown = document.createElement('button');
                    dom.directionButtons.rightdown.innerHTML = "🡾";
                    dom.directionButtons.rightdown.name += dom.directionButtons.rightdown.className += 'rightdown-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.rightdown);
                }

                if(events.indexOf('move-right') !== -1 && events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1){
                    dom.directionButtons.rightup = document.createElement('button');
                    dom.directionButtons.rightup.innerHTML = "🡽";
                    dom.directionButtons.rightup.name += dom.directionButtons.rightup.className += 'rightup-button';
                    dom.directionButtons.wrapper.appendChild(dom.directionButtons.rightup);
                }

                if(events.indexOf('move-left') !== -1 && events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1){
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

       if((events.indexOf('action-1') !== -1 && !canvas.indieGameEvents.settings.doubleTabAction1) || events.indexOf('action-2') !== -1 || events.indexOf('action-3') !== -1 || events.indexOf('action-4') !== -1) {
           var smallestActionButtonValue = 60, highestActionButtonValue = 100, actionButtonSize;

           actionButtonSize = Math.min(Math.max(smallestActionButtonValue, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), highestActionButtonValue);

           dom.actionButtons = {};
           dom.actionButtons.wrapper = document.createElement('div');
           dom.actionButtons.wrapper.className += 'action-buttons-wrapper';

           if(events.indexOf('action-1') !== -1 && !canvas.indieGameEvents.settings.doubleTabAction1) {
               dom.actionButtons.action1 = document.createElement('button');
               dom.actionButtons.action1.name = 'action-1';
               dom.actionButtons.action1.className += 'action-1-button';
               dom.actionButtons.action1.innerHTML += "1";

               dom.actionButtons.wrapper.appendChild(dom.actionButtons.action1);
           }

           if(events.indexOf('action-2') !== -1) {
               dom.actionButtons.action2 = document.createElement('button');
               dom.actionButtons.action2.name = 'action-2';
               dom.actionButtons.action2.className += 'action-2-button';
               dom.actionButtons.action2.innerHTML += "2";

               dom.actionButtons.wrapper.appendChild(dom.actionButtons.action2);
           }

           if(events.indexOf('action-3') !== -1) {
               dom.actionButtons.action3 = document.createElement('button');
               dom.actionButtons.action3.name = 'action-3';
               dom.actionButtons.action3.className += 'action-3-button';
               dom.actionButtons.action3.innerHTML += "3";

               dom.actionButtons.wrapper.appendChild(dom.actionButtons.action3);
           }

           if(events.indexOf('action-4') !== -1) {
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

       if(events.indexOf('open-map') !== -1) {
            var mapButtonSize, minMapButtonSize = 60, maxMapButtonSize = 100, mapButtonPosition;

           mapButtonSize = ~~Math.min(Math.max(minMapButtonSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), maxMapButtonSize);


           if(overlayRectSize.height < overlayRectSize.width && overlayRectSize.width > 600) {
               mapButtonPosition = {left: overlayRectSize.width/2 - mapButtonSize - 10, bottom: 20};
           }

           else {
               mapButtonPosition = {left: overlayRectSize.width - mapButtonSize - 30, bottom: overlayRectSize.height - mapButtonSize * 2 - 50};
           }

           dom.mapButton = document.createElement('button');
           dom.mapButton.className += 'map-button';
           dom.mapButton.innerHTML += "M";
           dom.mapButton.setAttribute('style',
               "width:" + mapButtonSize + "px; " +
               "height:" + mapButtonSize + "px; " +
               "left:" + mapButtonPosition.left + "px; " +
               "bottom:" + mapButtonPosition.bottom + "px; " +
               "font-size:" + mapButtonSize/2.5 + "px; " +
               "pointer-events: all; position: absolute; color: white; background-color: black; opacity: 0.5; border: none;"
           );

           dom.overlay.appendChild(dom.mapButton);

           if (isTouchDevice()) {
               dom.mapButton.addEventListener('touchstart', function(e) {mapButtonStartAction(e, canvas, events, dom)}, {passive: true});
           } else if (isPointer()) {
               dom.mapButton.addEventListener('pointerdown', function(e) {mapButtonStartAction(e, canvas, events, dom)}, {passive: true});
           } else if (isMSPointer()) {
               dom.mapButton.addEventListener('MSPointerDown', function(e) {mapButtonStartAction(e, canvas, events, dom)}, {passive: true});
           }
       }


       if(events.indexOf('dismiss') !== -1 && canvas.indieGameEvents.settings.touchDismissButton){
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
               "font-size:" + mapButtonSize/2.5 + "px; " +
               "pointer-events: all; position: absolute; color: white; background-color: black; opacity: 0.5; border: none; z-index: 210; display: none;"
           );

           document.body.appendChild(dom.dismissButton);

           if (isTouchDevice()) {
               dom.dismissButton.addEventListener('touchstart', function(e) {dismissButtonAction(e, canvas, dom)}, {passive: true});
           } else if (isPointer()) {
               dom.dismissButton.addEventListener('pointerdown', function(e) {dismissButtonAction(e, canvas, dom)}, {passive: true});
           } else if (isMSPointer()) {
               dom.dismissButton.addEventListener('MSPointerDown', function(e) {dismissButtonAction(e, canvas, dom)}, {passive: true});
           }
       }


       if(events.indexOf('open-menu') && canvas.indieGameEvents.settings.menuButton) {
           var menuButtonSize, menuButtonMinSize = 60, menuButtonMaxSize = 100, menuButtonPosition;

           menuButtonSize = ~~Math.min(Math.max(dismissButtonMinSize, Math.min(overlayRectSize.width * 0.14, overlayRectSize.height * 0.14)), dismissButtonMaxSize);

           if(overlayRectSize.height < overlayRectSize.width && overlayRectSize.width > 600) {
               menuButtonPosition = {left: overlayRectSize.width/2 + 10, bottom: 20};
           }

           else {
               menuButtonPosition = {left: overlayRectSize.width - menuButtonSize - 30, bottom: overlayRectSize.height - menuButtonSize - 50};
           }

           dom.menuButton = document.createElement('button');
           dom.menuButton.className += 'menu-button';
           dom.menuButton.innerHTML += "&#9776;";                                                   //hamburger symbol: &#9776;

           dom.menuButton.setAttribute('style',
               "width:" + menuButtonSize + "px; " +
               "height:" + menuButtonSize + "px; " +
               "left:" + menuButtonPosition.left + "px; " +
               "bottom:" + menuButtonPosition.bottom + "px; " +
               "font-size:" + menuButtonSize/2.5 + "px; " +
               "pointer-events: all; position: absolute; color: white; background-color: black; opacity: 0.5; border: none;"
           );

           dom.overlay.appendChild(dom.menuButton);

           if (isTouchDevice()) {
               dom.menuButton.addEventListener('touchstart', function(e) {menuButtonStartAction(e, canvas, dom, events)}, {passive: true});
           } else if (isPointer()) {
               dom.menuButton.addEventListener('pointerdown', function(e) {menuButtonStartAction(e, canvas, dom, events)}, {passive: true});
           } else if (isMSPointer()) {
               dom.menuButton.addEventListener('MSPointerDown', function(e) {menuButtonStartAction(e, canvas, dom, events)}, {passive: true});
           }
       }


        document.body.appendChild(dom.overlay);                                                     //appends the interface directly in the body tag to prevent position relative interference
    }


    function menuButtonStartAction(e, canvas, dom, events) {
        var target = prepareTarget(e);

        if(target instanceof HTMLButtonElement) {
            canvas.dispatchEvent(createNewEvent('open-menu'));
            dom.menuButton.style.display = 'none';

            if(dom.mapButton) {
                dom.mapButton.style.display = 'none';                                   //also hides the menu button, to hide the remaining touch interface objects use canvas.hideIndieGameTouchInterfaceWithoutX();
            }

            if(events.indexOf('dismiss') !== -1 && dom.dismissButton){
                dom.dismissButton.style.display = 'block';
            }
        }
    }


    function dismissButtonAction(e, canvas, dom) {
        var target = prepareTarget(e);

        if(target instanceof HTMLButtonElement) {
            canvas.dispatchEvent(createNewEvent('dismiss'));
            dom.dismissButton.style.display = 'none';

            if(dom.mapButton){
                dom.mapButton.style.display = 'block';
            }
            if(dom.menuButton) {
                dom.menuButton.style.display = 'block';
            }
        }
    }

    function mapButtonStartAction(e, canvas, events, dom) {
        var target = prepareTarget(e);

        if(target instanceof HTMLButtonElement) {
            canvas.dispatchEvent(createNewEvent('open-map'));

            dom.mapButton.style.display = 'none';

            //if(dom.menuButton) {dom.menuButton.style.display = 'none'};

            if(events.indexOf('dismiss') !== -1 && dom.dismissButton){
                dom.dismissButton.style.display = 'block';
            }
        }
    }


    function setActionButtonsStyle(actionButtons, actionButtonSize) {
        var key, i = 0, positions, normalButtonSize;

        normalButtonSize = actionButtonSize;

        if(actionButtons.action1 && actionButtons.action2 && !actionButtons.action3 && !actionButtons.action4) {
            actionButtonSize *= 1.2;
            positions = [{top: actionButtonSize * 1.5, left: 0}, {top: actionButtonSize/1.5, left: actionButtonSize * 1.5}];
        }
        else if(countPropertiesInObject(actionButtons) === 2) {
            actionButtonSize *= 1.5;
            positions = [{top: actionButtonSize, left: actionButtonSize/2}];
        }
        else {
            positions = [{top: actionButtonSize * 2, left: actionButtonSize}, {top: actionButtonSize, left: 0}, {top: actionButtonSize, left: actionButtonSize * 2}, {top: 0, left: actionButtonSize}]
        }

        for(key in actionButtons){
            if (actionButtons.hasOwnProperty(key) && actionButtons[key] instanceof HTMLButtonElement){
                actionButtons[key].setAttribute('style',
                    "position: absolute; " +
                    "width:" + actionButtonSize + "px; " +
                    "height:" + actionButtonSize + "px;" +
                    "left:" + positions[i].left + "px;" +
                    "top:" + positions[i].top + "px; " +
                    "border-radius: 50%; " +
                    "font-size:" + (actionButtonSize - actionButtonSize/1.5) + "px; " +
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
            buttonField.addEventListener('touchstart', function(e) {actionTouchButtonStartAction(e, buttonField, canvas)}, {passive: true});
        } else if (isPointer()) {
            buttonField.addEventListener('pointerdown', function(e) {actionTouchButtonStartAction(e, buttonField, canvas)}, {passive: true});
        } else if (isMSPointer()) {
            buttonField.addEventListener('MSPointerDown', function(e) {actionTouchButtonStartAction(e, buttonField, canvas)}, {passive: true});
        }
    }

    function actionTouchButtonStartAction(e, buttonField, canvas) {
        var target = prepareTarget(e);                                                                   //TODO should also work with multitoch?

        if(target instanceof HTMLButtonElement && target.name) {
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
        dom.joystick.innerCircle.setAttribute("style",  "pointer-events: all; border-radius: 50%; width: 50%; height: 50%; position: absolute; background: black; opacity: 0.3; transform: translate(-50%, -50%); top: 50%; left:50%;");
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
            outerCircle : e.target.offsetParent.firstChild || e.changedTouches[0].target.offsetParent.firstChild,     //always take the first touch (ignore multitouch for this element)
            innerCircle : e.target.offsetParent.lastChild || e.changedTouches[0].target.offsetParent.lastChild,
            parentPosition :  parentPosition,
            midPoint : {x: parentPosition.width /2, y: parentPosition.height / 2},
            xPos : (e.pageX || e.changedTouches[0].pageX) - (parentPosition.x || parentPosition.left),
            yPos : (e.pageY || e.changedTouches[0].pageY) - (parentPosition.y  || parentPosition.top)
        };
    }
    
    function triggerJoystickDirectionEvents(data, canvas) {                                     //aufzeichnen wie kreis aussieht?
        var touchPoint = {x: data.xPos, y: data.yPos},
            events = canvas.indieGameEvents.settings.events,
            distance = getDistance(touchPoint, data.midPoint),
            strength = ~~distance.map(0, data.midPoint.x, 0, 100);

        if(distance > data.parentPosition.width/9) {
            var angle = getAngle(data.midPoint, touchPoint);

            if(angle < 67.5 && angle > -67.5 && (events.indexOf('move-right') !== -1 || events.indexOf('move-all') !== -1)){
                //console.log('right');
                canvas.dispatchEvent(new CustomEvent('move-right', {detail: {strength: strength}}));
            }

            if(angle < 151.5 && angle > 22.5 && (events.indexOf('move-down') !== -1 || events.indexOf('move-all') !== -1)){
               // console.log('down');
                canvas.dispatchEvent(new CustomEvent('move-down', {detail: {strength: strength}}));
            }

            if(((angle < -112.5 && angle < 0) || (angle > 0 && angle > 112.5)) && (events.indexOf('move-left') !== -1 || events.indexOf('move-all') !== -1)) {
                //console.log('left');
                canvas.dispatchEvent(new CustomEvent('move-left', {detail: {strength: strength}}));
            }

            if(angle < -28.5 && angle > -157.5 && (events.indexOf('move-up') !== -1 || events.indexOf('move-all') !== -1)) {
                //console.log('up');
                canvas.dispatchEvent(new CustomEvent('move-up', {detail: {strength: strength}}));
            }
        }
    }
    
    
    /*touch buttons*/
    function setTouchDirectionButtonsStyle(dom, buttonSize, margin, events) {
        var positions, leftRightBig = 0, upDownBig = 0;
        
        if(!(dom.directionButtons.rightup || dom.directionButtons.up || dom.directionButtons.leftup || dom.directionButtons.leftdown || dom.directionButtons.down || dom.directionButtons.rightdown)) {
            leftRightBig = buttonSize;
        }
        else if(!(dom.directionButtons.rightup || dom.directionButtons.right || dom.directionButtons.leftup || dom.directionButtons.leftdown || dom.directionButtons.left || dom.directionButtons.rightdown)) {
            upDownBig = buttonSize;
        }

        positions = {
            up: {top: 0, left: (buttonSize + margin * 2)},
            down: {top: (buttonSize + margin * 2) * 2 - upDownBig/4, left: (buttonSize + margin * 2)},
            left: {top: (buttonSize + margin * 2), left: 0},
            right: {top: (buttonSize + margin * 2), left: (buttonSize + margin * 2) * 2 - leftRightBig/4},
            leftup: {top: 0, left: 0},
            rightdown: {top: (buttonSize + margin * 2) * 2, left: (buttonSize + margin * 2) * 2},
            rightup: {top: 0, left: (buttonSize + margin * 2) * 2},
            leftdown: {top: (buttonSize + margin * 2) * 2, left: 0},
        };

        for(var key in dom.directionButtons) {
            if(dom.directionButtons.hasOwnProperty(key)) {
                if(dom.directionButtons[key] instanceof HTMLButtonElement) {
                    dom.directionButtons[key].setAttribute("style", "pointer-events: all; position: absolute; color: white; background-color: black; width:" + (buttonSize + leftRightBig/4 + upDownBig * 2) + "px; height:" + (buttonSize + (leftRightBig * 2) + upDownBig/4) + "px; border: none; margin: "+ margin +"px; opacity: 0.5; border-radius: 3px; top:" + (positions[key].top - leftRightBig) + "px; left:" + (positions[key].left - upDownBig) + "px;");
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
            buttonField.addEventListener('touchstart', function(e) {buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents)}, {passive: true});
           // buttonField.addEventListener('touchmove', function(e) {buttonFieldTouchMoveAction(e, buttonField, canvas, buttonEvents)});
            buttonField.addEventListener('touchend', function(e) {buttonFieldTouchEndAction(e, buttonField, canvas, buttonEvents)}, {passive: true});
        } else if (isPointer()) {
            buttonField.addEventListener('pointerdown', function(e) {buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents)}, {passive: true});
           // buttonField.addEventListener('pointermove', function(e) {buttonFieldTouchMoveAction(e, buttonField, canvas, buttonEvents)});
            buttonField.addEventListener('pointerup', function(e) {buttonFieldTouchEndAction(e, buttonField, canvas, buttonEvents)}, {passive: true});
        } else if (isMSPointer()) {
            buttonField.addEventListener('MSPointerDown', function(e) {buttonFieldTouchStartAction(e, buttonField, canvas, buttonEvents)}, {passive: true});
          //  buttonField.addEventListener('MSPointerMove', function(e) {buttonFieldTouchMoveAction(e, buttonField, canvas, buttonEvents)});
            buttonField.addEventListener('MSPointerUp', function(e) {buttonFieldTouchEndAction(e, buttonField, canvas, buttonEvents)}, {passive: true});
        }
    }
    
    function buttonFieldTouchStartAction(e,buttonField, canvas, buttonEvents) {
     var target = prepareTarget(e);

        if(!buttonField.eventDispatcherID){
            buttonField.eventDispatcherID = window.requestAnimationFrame(function() {dispatchMoveButtonEvents(target, canvas, buttonEvents, buttonField)});           //only one touch counts
        }
    }
    
    function buttonFieldTouchEndAction(e, buttonField) {
        window.cancelAnimationFrame(buttonField.eventDispatcherID);
        buttonField.eventDispatcherID = null;
    }
    
    function dispatchMoveButtonEvents(target, canvas, buttonEvents, buttonField) {

        if(target.name){
            for(var key in buttonEvents[target.name]) {
                if(buttonEvents[target.name].hasOwnProperty(key)){
                    canvas.dispatchEvent(createNewEvent(buttonEvents[target.name][key]));
                }
            }
        }

        if(buttonField.eventDispatcherID) {
            window.requestAnimationFrame(function() { dispatchMoveButtonEvents(target, canvas, buttonEvents, buttonField) });
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
        return  e.target || e.changedTouches[0].target;
    }

    function containsOnlyOne(values, array) {
        var i, valNumber;

        valNumber = 0;

        for (i = 0; i < array.length; i++) {
            if(values.indexOf(array[i]) !== -1) {
                valNumber++;
            }
        }

        return valNumber === 1;
    }

    function countPropertiesInObject(obj) {
        var count = 0;

        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                ++count;
        }

        return count;
    }

    /* internet explorer workaround */
    function createNewEvent(eventName) {
        var event;
        if(typeof(Event) === 'function') {
            event = new Event(eventName);
        }else{
            event = document.createEvent('Event');
            event.initEvent(eventName, true, true);
        }

        return event;
    }

    /*https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API*/
    /*Checks if at least one gamepad is connected*/
    function isGamepadConnected() {
        if(_gamepads){
            for (var i = 0; i < _gamepads.length; i++) {
                if(_gamepads[i]) {
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