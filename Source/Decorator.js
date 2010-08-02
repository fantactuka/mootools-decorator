Function.implement({
    decorate: function(decorator) {
        var method = this;
        return function() {
            return decorator.apply(this, [method, arguments]);
        };
    }
});

Function.Decorators = {
    StrictAccess: function() {
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

    Throttle: function(interval) {
        var timer = null;
        return function(method, args) {
            if(!timer) {
                timer = setTimeout((function() { timer = null; }), interval);
                return method.apply(this, args);
            }
        };
    },

    Debounce: function(interval) {
        var timer = null;
        return function(method, args) {
            var context = this;
            timer && clearTimeout(timer);
            timer = setTimeout((function() { method.apply(context, args); }), interval);
        };
    },

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
