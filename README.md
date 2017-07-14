# mainLoop.js

主循环，顾名思义，就是建立一个与浏览器刷新频率相同的执行循环。

所有需要与浏览器刷新频率同步的操作都可以加入到这个循环中，同时也可以在需要时从循环中移除这个操作。

这个插件主要是基于 HTML5 的 requestAnimationFrame API 编写的。

## Usage

安装

```shell
$ npm install mainloop
```

使用

``` js
var mainLoop = require('mainloop');
var count = 0;
mainLoop.add(function() {
    // loop action
    count++;
    if (count === 100) {
        return false; // 当返回 false 时，该方法会从主循环中移除
    }
});
```


## API

如果是通过 `<script>` 标签引入，那么可以通过全局对象 `mainLoop` 进行调用。

``` js
// func 是你要循环操作的方法对象。
// target 是循环操作的上下文，即 this 的指向。
mainLoop.add(func, target); 

// func 可选，必须是 add 进循环的方法。如果是一个闭包函数，则不会有任何效果。
// 如果 func 不是一个方法，则等同于无参数。此时 remove 会移除掉之前所有 add 进循环的方法。
mainLoop.remove(func);

// 停止循环
mainLoop.stop();

// 启动循环
mainLoop.play();
```





