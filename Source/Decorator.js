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
     * @params
     *      - decorator {Function} - function that will be used for decoration
     * OR
     *      - decoratorName {String} - function name from Function.Decorators.Collection or added with Function.Decorators.add()
     *      - decoratorArgs* {Arguments} - decorator arguments
     * @return {Function} - decorated function
     *
     * @example
     *
     *      var method = function() {
     *          ...
     *      }.decorate(decorator(arg1, arg2, ...));
     *
     * OR
     *
     *      var method = function() {
     *          ...
     *      }.decorate('decoratorName', arg1, arg2, ...);
     *
     */
    decorate: function() {
        var args = Array.prototype.slice.call(arguments), decorator = args.shift(), method = this;

        if ($type(decorator) == 'function') {
            return function() {
                return decorator.apply(this, [method, arguments]);
            };
        } else {
            return function() {
                return Function.Decorators.Collection[decorator](args).apply(this, [method, arguments]);
            };
        }
    }
});

Function.Decorators = {};

/**
 *
 * Adds decoraton into collection that it can be applied by name
 *
 * @method add
 * @param name {String} - decorator name
 * @param decorator {Function} - decorating function
 *
 * @example
 *
 *      var outputFormat = function(limit) {
 *          return function(method, args) {
 *              return method.apply(this, args).substr(0, limit);
 *          }
 *      }
 *
 *      Function.Decorators.add('outputFormat', outputFormatter);
 *
 * And later:
 *
 *      var getOuput = function() {
 *          ...
 *          return someString;
 *      }.decorate('outputFormat', 30); // Limit output string to 30 chars 
 *
 * OR it's still possible to use it dirrectly from collection
 *
 *      var getOuput = function() {
 *          ...
 *          return someString;
 *      }.decorate(Function.Decorators.Collection.outputFormatter(30));
 *
 */
Function.Decorators.add = function(name, decorator) {
    Function.Decorators.Collection[name] = decorator;
};

Function.Decorators.Collection = {


    /**
     * Decorate function with parameters validation.
     *
     * @method strictArguments
     * @params {Arguments} list of valid types of arguments and its amount
     * @return {Function} - decorated function
     *
     * @requires $type function to validate arguments types
     * @example
     *
     *      var example = function(numParam, strParam, boolParam) {
     *          ...
     *      }.decorate('strictArguments', 'number', 'string', 'boolean')
     *
     *      Will require exact 3 arguments with 'number', 'string', 'boolean' types,
     *      otherwise throw error message.
     */
    strictArguments: function() {
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
     * @method strictReturn
     * @param type {String} - required type of returned value
     * @return {Function} - decorated function
     *
     * @requires $type function to validate arguments types
     * @example
     *
     *      var example = function() {
     *          ...
     *          retrun result;
     *      }.decorate('strictReturn', 'number')
     *
     *      Will require 'number' type value to be returned by the function,
     *      otherwise throw error message.
     */
    strictReturn: function(type) {
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
     * @method throttle
     * @param interval {Number} - interval in milliseconds
     * @return {Function} - decorated function
     *
     * @example
     *
     *      var throttled = function() {
     *          ...
     *          retrun result;
     *      }.decorate('throttle', 3000)
     *
     *      In case throttled() called it will run immediately and in case it will be called again within 3000ms
     *      all these calls will be ignored.
     *
     */
    throttle: function(interval) {
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
     * @method debounce
     * @param interval {Number} - interval in milliseconds
     * @return {Function} - decorated function
     *
     * @example
     *
     * It could be used with `auto-suggestion` that runs request after keypressed:
     * Press some key, in case no other key pressed within 300 ms it will make ajax request.
     *
     * $('auto-suggested-field').addEvent('keyup', sendRequest.decorate('debounce', 300));
     *
     */
    debounce: function(interval) {
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
     * @method queue
     * @param interval {Number} - interval in milliseconds
     * @return {Function} - decorated function
     *
     * @example
     *
     *      var queued = function(a) {
     *          alert(a);
     *      }.decorate('queue', 3000)
     *
     *      queued(1); // Runs immediately
     *      queued(2); // After 3000 ms
     *      queued(3); // After 6000 ms
     *
     */
    queue: function(interval) {
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
     * @method profile
     * @param message {String} - profile title
     * @return {Function} - decorated function
     *
     * @example
     *
     *      var calculating = function() {
     *          ...
     *      }.decorate('profile', 'Profiling calculating() method');
     */
    profile: function(message) {
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
     * @method deprecate
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
     *      }.decorate('deprecate', 'This method is deprecated. Use $$ instead');
     *
     *      Console will show the deprecation warning:
     *      'This method is deprecated. Use $$ instead' + stack that will help to find where this method was used
     *      
     *
     */
    deprecate: function(message, eachCall) {
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
