Function.decorate
===========

Adds decorator functionality and some basic decorators

How to use
----------

**Function.decorate**

Function method that adds decorator pattern.

	var method = function() {
		...
	}.decorate(decorator(arg1, arg2, ...));

OR

	var method = function() {
		...
	}.decorate('decoratorName', arg1, arg2, ...);

`decorator` function that passed into has two arguments: method to be decorated and its arguments, so you can controll arguments, returned values, decide when the default method should be called or not called at all, etc.
Also it could be a name of the decorator from the collection


Function.Decorators.add
----------

Adds decoraton into collection that it can be applied by name

	var outputFormat = function(limit) {
		return function(method, args) {
			return method.apply(this, args).substr(0, limit);
		}
	}

	Function.Decorators.add('outputFormat', outputFormatter);

And later:

	var getOuput = function() {
		...
		return someString;
		}.decorate('outputFormat', 30); // Limit output string to 30 chars

OR it's still possible to use it dirrectly from collection

	var getOuput = function() {
		...
		return someString;
	}.decorate(Function.Decorators.Collection.outputFormatter(30));


Function.Decorators.Collection
----------


**strictArguments**

Decorate function with parameters validation.

	function(numParam, strParam, boolParam) {
		...
	}.decorate('strictArguments', 'number', 'string', 'boolean')

Will require exact 3 arguments with 'number', 'string', 'boolean' types, otherwise throw error message.



**strictReturn**

Decorate function with returned value validation.

	function() {
		...
		retrun result;
	}.decorate('strictReturn', 'number')

Will require 'number' type value to be returned by the function, otherwise throw error message.



**throttle**

Decorate function with trottle pattern: it allows to call function only once per `interval` other calls within this interval will be ignored.

	function throttled() {
		...
	}.decorate('throttle', 3000)

In case throttled() called it will run immediately and other calls within 3000ms will be ignored.



**debounce**

Decorate function with debounce pattern: it allows to slow down the function calls, in case debounced function is called it will run only after `interval`. In case function will be called within this interval it will clear old one and create new interval.

It could be used with `auto-suggestion` that runs request after keypressed:
Press some key, in case no other key pressed within 300 ms it will make ajax request.

	$('auto-suggested-field').addEvent(
		'keyup',
		sendRequest.decorate('debounce', 300)
	);



**queue**

Decorate function with queue pattern: all function calls will be run one by one after `interval` ms.

	function queued() {
		alert('call')
	}.decorate('queue', 3000)

	queued();
	queued();
	queued();

	alert('call'); // Shown immediately
	alert('call'); // After 3000 ms
	alert('call'); // After 6000 ms



**profile**

Decorate function with fireBug profiler, so each run will be profiled with it

	var calculating = function() {
		...
	}.decorate('profile', 'Profiling calculating() method');



**deprecate**

Decorate function deprecation warning

	var getElementByClass = function() {
		...
	}.decorate('deprecate', 'This method is deprecated. Use $$ instead');

Console will show the deprecation warning:
`This method is deprecated. Use $$ instead` + call stack that will help to find where this method was used


Check source for more docs


