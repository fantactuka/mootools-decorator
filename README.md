Function.decorate
===========

Adds decorator functionality and some basic decorators

How to use
----------

**Function.decorate**

Function method that adds decorator pattern.

	var someFunction() {
		...
	}.decorate(decorator(decoratorArg1, decoratorArg2, ...));

`decorator` function that passed into has two arguments: method to be decorated and its arguments, so you can controll arguments, returned values, decide when the default method should be called or not called at all, etc.


Function.Decorators
----------

Function.Decorators is a collection of some mostly used decorators:

**Function.Decorators.StrictArguments**

Decorate function with parameters validation.

	function(numParam, strParam, boolParam) {
		...
	}.decorate(Function.Decorators.StrictArguments('number', 'string', 'boolean'))

Will require exact 3 arguments with 'number', 'string', 'boolean' types, otherwise throw error message.


**Function.Decorators.StrictReturn**

Decorate function with returned value validation.

	function() {
		...
		retrun result;
	}.decorate(Function.Decorators.StrictReturn('number'))

Will require 'number' type value to be returned by the function, otherwise throw error message.


**Function.Decorators.Throttle**

Decorate function with trottle pattern: it allows to call function only once per `interval` other calls within this interval will be ignored.

	function throttled() {
		...
	}.decorate(Function.Decorators.Throttle(3000))

In case throttled() called it will run immediately and other calls within 3000ms will be ignored.


**Function.Decorators.Debounce**

Decorate function with debounce pattern: it allows to slow down the function calls, in case debounced function is called it will run only after `interval`. In case function will be called within this interval it will clear old one and create new interval.

It could be used with `auto-suggestion` that runs request after keypressed:
Press some key, in case no other key pressed within 300 ms it will make ajax request.

	$('auto-suggested-field').addEvent(
		'keyup',
		sendRequest.decorate(Function.Decorators.Throttle(300))
	);


**Function.Decorators.Queue**

Decorate function with queue pattern: all function calls will be run one by one after `interval` ms.

	function queued() {
		alert('call')
	}.decorate(Function.Decorators.Queue(3000))

	queued();
	queued();
	queued();

	alert('call'); // Shown immediately
	alert('call'); // After 3000 ms
	alert('call'); // After 6000 ms

