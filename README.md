# mainLoop.js

主循环，顾名思义，就是建立一个与浏览器刷新频率相当的执行循环。<br>
所有需要与浏览器刷新频率同步的操作都可以加入到这个循环中，同时也可以在需要时从循环中移除这个操作。<br>
这个插件主要是基于 HTML5 的 requestAnimationFrame API 编写的。

## Usage

``` html
<script src="mainLoop.js"></script>
<script>
	bjj.mainLoop.add(function() {
		// loop action
		
		if (stop) {
			return false; // 当返回 false 时，该方法会从主循环中移除
		}
	});
</script>
```


## API

如果不通过模块化加载，那么可以通过全局对象 bjj.mainLoop 进行调用。

``` js
// func 是你要循环操作的方法对象。
// target 是循环操作的上下文，即 this 的指向。
bjj.mainLoop.add(func, target); 

// func 可选，必须是 add 进循环的方法。如果是一个闭包函数，则不会有任何效果。
// 如果 func 不是一个方法，则等同于无参数。此时 remove 会移除掉之前所有 add 进的循环的方法。
bjj.mainLoop.remove(func);

// 停止循环
bjj.mainLoop.stop();

// 启动循环
bjj.mainLoop.play();
```


## AMD
``` js
require(['mainLoop'], function(mainLoop) {
	mainLoop.add(function() {
		// loop action
	});
});
```









