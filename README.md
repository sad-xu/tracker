# 神策数据-前端埋点源码解析

神策数据-前端埋点源码解析

源码为压缩打包后的产物，都转为了ES5，美化后约2400行

整体结构和jQuery的源码有点类似
```js
!function(e) {
  // 判断是否支持 CommonJS 规范
  "object" == typeof exports && "object" == typeof module ? module.exports = e() : e()
} (function() {
  try {
    // 主体大致分三类
    // 1. 修改浏览器自带方法 ≈100行
    // 2. 封装通用函数 ≈1000行
    // 3. 埋点代码 ≈1300行
  } catch(err) {
    if ("object" == typeof console && console.log) try {
			console.log(err)
		} catch(e) {}
  }
})
```

## 1. 修改浏览器自带方法

```js
Date.prototype.toJSON
Boolean.prototype.toJSON 
Number.prototype.toJSON
String.prototype.toJSON
JSON.stringify
JSON.parse
```

给`Date`，`Boolean`，`Number`，`String`新增了`toJSON`方法，内部返回的是`valueOf()`的值

重写了`JSON`的序列化、反序列化方法，应该是为了兼容旧浏览器，似乎是用了`JSON2`的包，两者代码很像

## 2. 封装通用函数

共72个函数

有部分是类似`lodash`里面的基础工具函数

其他是一些对基础功能的封装，如`cookie`、`stroage`、`ajax`、`url`、`DOM操作`等

## 3. 埋点代码

埋点的核心代码都在这里

先看一下如何使用

```js
// 初始化
requirejs(["sensorsdata.amd.min"], function(sensors) {
  //神策 SDK 初始化
  sensors.init({
    server_url: '数据接收地址',
    heatmap: {
      // 默认开启采集元素点击事件，not_collect 为关闭。
      clickmap:'default', 
      // 默认或者设置 default 开启采集元素点击事件，not_collect 为关闭。
      scroll_notice_map:'not_collect' 
    }
  })
})
```

* 全埋点事件

  1. $pageview 浏览页面

      调用`sensors.quick('autoTrack')` 方法触发

  2. $WebClick 元素点击

      a button input 被点击时触发
      
      `heatmap:{clickmap:'default'}` 
  
  3. $WebStay 视区停留

      scroll 滚动时触发
      
      `heatmap:{scroll_notice_map:'default'}`

* 手动追踪事件

  `sensors.track(event_name[, properties][, callback])`

全埋点会收集以上三种类型的事件：页面访问、元素点击和视区停留，无论哪种事件，都会通过`sensors.track`收集数据发送

下面来一个个分析它们的实现方式

### $pageview

在之前的埋点实践中，由于是单页面的Vue项目，可以很方便的在导航守卫里获取路由变化，而神策的埋点代码是通用式的框架无关的，所以需要考虑是单页面还是多页面，hash模式还是history模式

```js
// 一下是执行过程
sensors.quick('autoTrack')
// 
commonWays.autoTrack()
// track当前页面的$pageview数据
sd.track("$pageview", _.extend({
  $referrer: _.getReferrer(), // 即document.referrer
  $url: location.href,
  $url_path: location.pathname,
  $title: document.title
}
// 若为单页面应用，绑定路由变化事件
// 若支持history模式则监听popstate
// 否则监听hashchange事件
"pushState" in window.history ? "popstate": "hashchange"
// 事件触发时还是track以上页面信息
```

本质上和vue-router的路由守卫原理相同，没啥可说的

### $WebClick

默认只采集`a`,`input`,`button`三种元素的事件，若要拓展则需要手动绑定

相关代码在`heatmap.initHeatmap()`里

绑定`document`的`click`事件，根据`tagName`过滤，执行`heatmap.start()`，在里面`track`当前事件信息

原理很基础，就是绑定点击事件，过滤出需要的事件，收集事件携带的信息


### $WebStay

视区停留事件`heatmap.initScrollmap()`

绑定了两个事件`scroll`和`unload`

滚动时，有1s的debounce

滚动结束后的时间 - 上次记录的时间 = 视区停留时间($scroll_event_duration)

默认停留时间大于4s且滚动后位置变化了才会记录，且`scroll_event_duration`最大不超过18000秒

最后更新上次记录时间，`track`数据

在页面关闭前，需要收集关闭前的停留数据，所以需要绑定`unload`事件，除了该事件是立即执行的之外，其他和上面一样

但其实他们这种收集并不是很准，页面不可见时的事件就没有减掉，还有长时间无动作时的判断。可能这方面的数据对数据分析并没有很大的影响，也可能这些情况属于小概率事件，可以忽略，或者这也属于正常操作的范畴，总之他们不处理肯定是有一定道理的。

### sd.track

所有收集到的数据都要通过`sd.track`来处理和发送，其内部有两步

```js
saEvent.check({
  event: e,
  properties: t
}) && saEvent.send({
  type: "track",
  event: e,
  properties: t
}
```

`saEvent.check`用来判断待发送的数据格式，`value`是否都是字符串

`saEvent.send`先对待发送数据再添加一些通用信息，如id、version什么的，在对这些信息做格式校验，还是蛮严谨的，数据准备完成，`sendState.getSendCall`

当页面是APP内的H5时，`use_app_track=true`数据可以通过`SensorsData_APP_JS_Bridge`发往APP，在APP里的SDK里统一处理，当出错后会构造一个iframe，往`sensorsanalytics://trackEvent?event=`发一个跨域请求，这其实是有点那个的，严格一点就属于数据泄露了。

数据发送在`dataSend`类里，请求格式有三种`image`，`ajax`，`beacon`，默认第一种，后两种在不支持的情况下会切换为第一种。

* image

构造一个1像素的img标签，必要时添加跨域，给src赋值的那一刻即发送了数据
```js
this.img = document.createElement("img")
this.img.width = 1
this.img.height = 1
sd.para.img_use_crossorigin && (this.img.crossOrigin = "anonymous")
this.data = e.data
this.server_url = dataSend.getSendUrl(e.server_url, e.data)
// ...
this.img.src = this.server_url
```

* ajax

发了一个post请求，跨域且不携带cookie，不管成功失败都视为结束

```js
_.ajax({
  url: this.server_url,
  type: "POST",
  data: this.data,
  credentials: !1,
  timeout: sd.para.datasend_timeout,
  cors: !0,
  success: function() {
    e.isEnd()
  },
  error: function() {
    e.isEnd()
  }
})
```

* beacon

由于beacon没有回调，所以40ms后就视为结束

```js
navigator.sendBeacon(this.server_url, this.data)
setTimeout(function() {
  e.isEnd()
}, 40)
```

## 总结

以上大致分析了神策数据前端埋点的全埋点和手动埋点的实现原理，其实原理都很简单，之所以要看他们的源码，是因为我想看看业内比较成熟的解决方案是怎么个样子，至于为什么选神策而不是百度统计等产品，其实是觉得神策这个名字酷酷的。

代码没开源，只能看手动美化后的压缩代码，代码压缩后有很多反人类的写法，不关键的变量名都成了a,b,c,d，各种三元运算符与或非多重嵌套，而且所有代码合在同一个文件里，分不清东南西北。不过从里面可以看出来，他们的代码逻辑还是比较清晰的，各个模块功能明确，毕竟埋点本身就不是一个很复杂的功能，收集数据只是第一步，就像吃东西，拿到数据，相当于手把食物放到了嘴里，之后还有唾液的分解，经过食道到胃，在经过小肠大肠，最后拉出来，才算是走完了一个流程。前端需要做的不仅仅是收集食物放到嘴里，还需要做个展示台，把最后的屎展示给别人看，别人通过多个角度的观察，最后得出你昨天吃了金针菇这个结论，形成了一个闭环，这就是所谓的`有屎有终`。


## Please wait ...
