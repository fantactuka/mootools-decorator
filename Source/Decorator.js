/*
---
description: Adds decorator functionality and some basic decorators

license: MIT-style

authors:
- Maksim Horbachevsky

requires:
- /Native
- /$util

provides: [Function.decorate, Function.Decorators]
...
*/

Function.implement({
    /**
     * Function method that adds decorator pattern.
     * @method decorate
     * @param decorator {Function} - function that will be used for decoration
     * @return {Function} - decorated function
     */
    decorate: function(decorator) {
        var method = this;
        return function() {
            return decorator.apply(this, [method, arguments]);
        };
    }
});

Function.Decorators = {
    /**
     * Decorate function with parameters validation.
     *
     * @method StrictArguments
     * @params {Arguments} list of valid types of arguments and its amount
     * @return {Function} - decorated function
     *
     * @requires $type function to validate arguments types
     * @example
     *
     *      var example = function(numParam, strParam, boolParam) {
     *          ...
     *      }.decorate(Function.Decorators.StrictArguments('number', 'string', 'boolean'))
     *
     *      Will require exact 3 arguments with 'number', 'string', 'boolean' types,
     *      otherwise throw error message.
     */
    StrictArguments: function() {
        var types = arguments;
        return function(method, args) {
            if(types.length != args.length) {
                throw new Error(types.length + ' arguments expected, passed: ' + args.length);
            }
            for(var i = 0, l = args.length; i < l; i++) {
                if($type(args[i]) != types[i]) {
                    throw new Error('Wrong type for argument #' + (i + 1) + ': "' + $type(args[i]) + '" should be "' + types[i].toString() + '"', method);
                }
            }
            return method.apply(this, args);
        };
    },

    /**
     * Decorate function with returned value validation.
     *
     * @method StrictReturn
     * @param type {String} - required type of returned value
     * @return {Function} - decorated function
     *
     * @requires $type function to validate arguments types
     * @example
     *
     *      var example = function() {
     *          ...
     *          retrun result;
     *      }.decorate(Function.Decorators.StrictReturn('number'))
     *
     *      Will require 'number' type value to be returned by the function,
     *      otherwise throw error message.
     */
    StrictReturn: function(type) {
        return function(method, args) {
            var result = method.apply(this, args);
            if($type(result) != type) {
                throw new Error('Unexpexted return type: ' + $type(result));
            } else {
                return result;
            }
        };
    },

    /**
     * Decorate function with trottle pattern: it allows to call function only once per `interval`
     * other calls within this interval will be ignored.
     *
     * @method Throttle
     * @param interval {Number} - interval in milliseconds
     * @return {Function} - decorated function
     *
     * @example
     *
     *      var throttled = function() {
     *          ...
     *          retrun result;
     *      }.decorate(Function.Decorators.Throttle(3000))
     *
     *      In case throttled() called it will run immediately and in case it will be called again within 3000ms
     *      all these calls will be ignored.
     *
     */
    Throttle: function(interval) {
        var timer = null;
        return function(method, args) {
            if(!timer) {
                timer = setTimeout((function() { timer = null; }), interval);
                return method.apply(this, args);
            }
        };
    },

    /**
     * Decorate function with debounce pattern: it allows to slow down the function calls,
     * in case debounced function is called it will run only after `interval`. In case function
     * will be called within this interval it will clear old one and create new interval.
     *
     * @method Debounce
     * @param interval {Number} - interval in milliseconds
     * @return {Function} - decorated function
     *
     * @example
     *
     * It could be used with `auto-suggestion` that runs request after keypressed:
     * Press some key, in case no other key pressed within 300 ms it will make ajax request.
     *
     * $('auto-suggested-field').addEvent('keyup', sendRequest.decorate(Function.Decorators.Throttle(300)));
     *
     */
    Debounce: function(interval) {
        var timer = null;
        return function(method, args) {
            var context = this;
            timer && clearTimeout(timer);
            timer = setTimeout((function() { method.apply(context, args); }), interval);
        };
    },


    /**
     * Decorate function with queue pattern: all function calls will be run one by one after `interval` ms.
     *
     * @method Queue
     * @param interval {Number} - interval in milliseconds
     * @return {Function} - decorated function
     *
     * @example
     *
     *      var queued = function(a) {
     *          alert(a);
     *      }.decorate(Function.Decorators.Queue(3000))
     *
     *      queued(1); // Runs immediately
     *      queued(2); // After 3000 ms
     *      queued(3); // After 6000 ms
     *
     */
    Queue: function(interval) {
        var calls = [];
        var timer = null;
        return function(method, args) {
            var context = this;
            calls.push(args);

            if(!timer) {
                (function() {
                    var callee = arguments.callee;
                    timer = setTimeout((function() {
                        calls.length && method.apply(context, calls.shift());
                        calls.length && callee();
                        timer = null;
                    }), interval);
                })();
            }
        };
    },

    
    /**
     * Decorate function with fireBug profiler, so each run will be profiled with it
     *
     * @method Profile
     * @param message {String} - profile title
     * @return {Function} - decorated function
     *
     * @example
     *
     *      var calculating = function() {
     *          ...
     *      }.decorate(Function.Decorators.Profile('Profiling calculating() method'));
     */
    Profile: function(message) {
        return function(method, args) {
            var console = window['console'];
            console && console.profile(message);
            var result = method.apply(this, args);
            console && console.profileEnd();
            return result;
        };
    },


    /**
     * Decorate function deprecation warning
     *
     * @method Deprecate
     * @param message {String} - deprecation warning
     * @param eachCall {Boolean} - if true will show warning each time the function is called,
     * otherwise only at the first time
     * @return {Function} - decorated function
     *
     * @requires Log
     *
     * @example
     *
     *      var getElementByClass = function() {
     *          ...
     *      }.decorate(Function.Decorators.Deprecate('This method is deprecated. Use $$ instead'));
     *
     *      Console will show the deprecation warning:
     *      'This method is deprecated. Use $$ instead' + stack that will help to find where this method was used
     *      
     *
     */
    Deprecate: function(message, eachCall) {
        var warned = false;
        return function(method, args) {
            if (!warned || eachCall) {
                warned = true;
                Log.logger((new Error(message, method)).stack);
            }
            return method.apply(this, args);
        };
    }
};
