var simpleReturn = function(val) {
    return val;
};

var returnContextValue = function(name) {
    return this[name];
};

var multiply = function() {
    var result = 1;
    for (var i = 0, l = arguments.length; i < l; i ++) {
        result *= arguments[i];
    }
    return result;
};

var dummyDecorator = function() {
    return function(method, args) {
        return method.apply(this, args);
    };
};

var multiplierDecorator = function(multiplier) {
    return function(method, args) {
        return method.apply(this, args) * multiplier;
    };
};



describe('Function.decorate', {
    'should return function as is in case dummy decorator passed in': function() {
        var decoratedReturn = simpleReturn.decorate(dummyDecorator());
        value_of(decoratedReturn(23)).should_be(23);
    },

    'should leave context as is': function() {
        var decoratedReturn = returnContextValue.bind({ age: 23 }).decorate(dummyDecorator());
        value_of(decoratedReturn('age')).should_be(23);
    },

    'should correctly pass args': function() {
        var decoratedReturn = multiply.decorate(multiplierDecorator(5));
        value_of(decoratedReturn(2, 3, 4)).should_be(120);
    }
});

describe('Function.Decorators.add', {
    'should add decorator to the collection': function() {
        value_of(Function.Decorators.Collection.dummyDecorator).should_be_undefined();
        Function.Decorators.add('dummyDecorator', dummyDecorator);
        value_of(Function.Decorators.Collection.dummyDecorator).should_be(dummyDecorator);
    }
});

describe('Collection decorators usage', {
    'should return function as is in case empty decorator passed in': function() {
        Function.Decorators.add('dummyDecorator', dummyDecorator);

        var decoratedReturn = simpleReturn.decorate('dummyDecorator');
        value_of(decoratedReturn(23)).should_be(23);
    },

    'should correctly pass args': function() {
        Function.Decorators.add('multiplierDecorator', multiplierDecorator);

        var decoratedReturn = simpleReturn.decorate('multiplierDecorator', 3);
        value_of(decoratedReturn(3)).should_be(9);
    }
});
