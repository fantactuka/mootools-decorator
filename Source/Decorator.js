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
     *      function(numParam, strParam, boolParam) {
     *          ...
     *      }.decorate(Function.Decorators.StrictAccess('number', 'string', 'boolean'))
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
     *      function() {
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
     *      function throttled() {
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
     * Press some key, in case no other key pressed within 3000 ms it will make ajax request.
     *
     * $('auto-suggested-field').addEvent('keyup', sendRequest.decorate(Function.Decorators.Throttle(3000)));
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
     *      function queued() {
     *          alert('call')
     *      }.decorate(Function.Decorators.Queue(3000))
     *
     *      queued();
     *      queued();
     *      queued();
     *
     *      alert('call'); // Shown immediately
     *      alert('call'); // After 3000 ms
     *      alert('call'); // After 6000 ms
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
    }
};
