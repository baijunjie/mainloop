/*!
 * Pseudo mainLoop v0.0.2
 * @author baijunjie
 *
 * https://github.com/baijunjie/mainLoop.js
 */
(function(root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.bjj = root.bjj || {};
		root.bjj.mainLoop = factory();
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
		this.requestAnimationFrame = requestAnimationFrame;

		if (!this.requestAnimationFrame) {
			var lastTime = 0;
			this.requestAnimationFrame = function(callback) {
				var currTime = new Date().getTime(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime)),
					id = window.setTimeout(function() {
						callback(currTime + timeToCall);
					}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		this.runFunc = []; //储存所有主循环中运行的方法
		this.loopRun = false; //表示循环是否已经运行（只要 runFunc 中有需要运行的方法，即使已经 stop，也视为运行状态）
		this.isStop = false; //表示循环是否暂停
		this.timerID = 0;
		this._loopCallback = proxy(this._loopCallback, this);
	}

	Loop.prototype = {
		_loopCallback: function() {
			var i = this.runFunc.length;
			while (i--) {
				if (this.runFunc[i]() === false) { // 如果方法返回 false，则将该方法移出循环
					this.runFunc.splice(i, 1);
				}
			}

			if (this.runFunc.length) {
				this.timerID = this.requestAnimationFrame.call(window, this._loopCallback);
			} else {
				this.loopRun = false;
			}
		},

		add: function(func, target) {
			if (typeof func !== 'function') return this;
			if (target) {
				func = proxy(func, target);
			}
			this.runFunc.unshift(func);

			if (this.loopRun) return this;
			this.loopRun = true;
			if (!this.isStop) {
				this.timerID = this.requestAnimationFrame.call(window, this._loopCallback);
			}
			return this;
		},

		remove: function(func) {
			if (typeof func !== 'function') {
				this.runFunc = [];
				return this;
			}
			var i = this.runFunc.length;
			while (i--) {
				if (this.runFunc[i].guid === func.guid) {
					this.runFunc.splice(i, 1);
					return this;
				}
			}
		},

		stop: function() { // 停止循环
			if (this.isStop) return this;
			this.isStop = true;
			cancelAnimationFrame(this.timerID);
			return this;
		},

		play: function() { // 启动循环
			if (!this.isStop) return this;
			this.isStop = false;
			if (this.loopRun) {
				this.timerID = this.requestAnimationFrame.call(window, this._loopCallback);
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

	var mainLoop = new Loop();
	mainLoop.createLoop = function() {
		return new Loop();
	};

	return mainLoop;

}));
