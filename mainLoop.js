/*!
 * mainLoop v1.0.1
 * (c) 2014-2017 BaiJunjie
 * MIT Licensed.
 *
 * https://github.com/baijunjie/mainLoop.js
 */
(function(root, factory) {
	'use strict';

	if (typeof module === 'object' && typeof exports === 'object') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		root.mainLoop = factory();
	}

}(this, function() {
	'use strict';

	var requestAnimationFrame = window.requestAnimationFrame,
		cancelAnimationFrame = window.cancelAnimationFrame,
		vendors = ['ms', 'moz', 'webkit', 'o'];

	for (var x = 0; x < vendors.length && !requestAnimationFrame; ++x) {
		requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!cancelAnimationFrame) {
		cancelAnimationFrame = function(id) {
			window.clearTimeout(id);
		};
	}

	function Loop() {
		this._requestAnimationFrame = requestAnimationFrame;

		if (!this._requestAnimationFrame) {
			var lastTime = 0;
			this._requestAnimationFrame = function(callback) {
				var currTime = new Date().getTime(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime)),
					id = window.setTimeout(function() {
						callback(currTime + timeToCall);
					}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		this._runFunc = []; //储存所有循环中运行的方法
		this._active = !!this._runFunc.length; //表示循环是否在激活状态。当循环中存在需要运行的方法时，则被判定为激活状态
		this._isRun = true; //表示循环是否在运行状态
		this._timerID = 0;
		this._loopCallback = proxy(this._loopCallback, this);
	}

	Loop.prototype = {
		_loopCallback: function() {
			var i = this._runFunc.length;
			while (i--) {
				if (this._runFunc[i]() === false) { // 如果方法返回 false，则将该方法移出循环
					this._runFunc.splice(i, 1);
				}
			}

			if (this._runFunc.length) {
				this._timerID = this._requestAnimationFrame.call(window, this._loopCallback);
			} else {
				this._active = false;
			}
		},

		add: function(func, target) {
			if (typeof func !== 'function') return this;
			if (target) {
				func = proxy(func, target);
			}
			this._runFunc.unshift(func);

			if (this._active) return this;
			this._active = true;
			if (this._isRun) {
				this._timerID = this._requestAnimationFrame.call(window, this._loopCallback);
			}
			return this;
		},

		remove: function(func) {
			if (typeof func !== 'function') {
				this._runFunc = [];
				return this;
			}
			var i = this._runFunc.length;
			while (i--) {
				if (this._runFunc[i].guid === func.guid) {
					this._runFunc.splice(i, 1);
					return this;
				}
			}
		},

		stop: function() { // 停止循环
			if (!this._isRun) return this;
			this._isRun = false;
			cancelAnimationFrame(this._timerID);
			return this;
		},

		play: function() { // 启动循环
			if (this._isRun) return this;
			this._isRun = true;
			if (this._active) {
				this._timerID = this._requestAnimationFrame.call(window, this._loopCallback);
			}
			return this;
		}
	};

	var guid = 0;
	function proxy(func, target) {
		if (typeof target === 'string') {
			var tmp = func[target];
			target = func;
			func = tmp;
		}

		if (typeof func !== 'function') {
			return undefined;
		}

		var slice = Array.prototype.slice,
			args = slice.call(arguments, 2),
			proxy = function() {
				return func.apply(target || this, args.concat(slice.call(arguments)));
			};

		proxy.guid = func.guid = func.guid || guid++;

		return proxy;
	}

	var loop = new Loop();
	loop.createLoop = function() {
		return new Loop();
	};

	return loop;

}));
