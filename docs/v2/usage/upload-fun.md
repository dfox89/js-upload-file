# JsUploadFile实例方法

## addFile(value, data)

+ 参数：
  + value：必选 `Array` 原生File对象组成的数组
  + data：可选 `Object` 此值会设置到[File实例](/v2/usage/file-attr.md?id=data)的`data`属性上
    > &gt;=2.1.0 支持第二参数

将文件添加到上传实例中<br>* 添加的文件`status`默认为`queue`

## start(value)

+ 参数：
  + value：可选 `String` or `Array` or [File实例](/v2/usage/file-attr.md)

开始上传，`value`不传则全部上传，传入`value`则上传传入的
<br>* 状态为`queue`，`pause`，`error`的文件才会上传，其他状态值的文件不受影响
<br>* `value`可以是[File实例](/v2/usage/file-attr.md)，或其`id`值，或其`id`值组成的数组，或[File实例](/v2/usage/file-attr.md)组成的数组，或其`id`值和[File实例](/v2/usage/file-attr.md)混合组成的数组

## pause(value)

+ 参数：
  + value：可选 `String` or `Array` or [File实例](/v2/usage/file-attr.md)

暂停上传，`value`不传则全部暂停，传入`value`则暂停传入的
<br>* 状态为`wait`，`hash`，`uping`的文件才会暂停，其他状态值的文件不受影响
<br>* `value`可以是[File实例](/v2/usage/file-attr.md)，或其`id`值，或其`id`值组成的数组，或[File实例](/v2/usage/file-attr.md)组成的数组，或其`id`值和[File实例](/v2/usage/file-attr.md)混合组成的数组

## remove(value)

+ 参数：
  + value：可选 `String` or `Array` or [File实例](/v2/usage/file-attr.md)

移除文件，`value`不传则全部移除，传入`value`则移除传入的
<br>* 任何状态的文件均可移除
<br>* `value`可以是[File实例](/v2/usage/file-attr.md)，或其`id`值，或其`id`值组成的数组，或[File实例](/v2/usage/file-attr.md)组成的数组，或其`id`值和[File实例](/v2/usage/file-attr.md)混合组成的数组

## on(event, callback)

+ 参数：
  + event：必选 `String` or `Array` 监听事件名，可监听事件名见下列
    + `beforeAdd`：添加某文件前
    + `afterAdd`：添加某文件后
    + `addFinish`：全部添加完毕
    + `beforeHash`：某文件生成hash值前
    + `beforeUpFile`：上传某文件前，即hash值生成后
    + `beforeUpChunk`：上传某分片前
    + `afterUpChunk`：上传某分片后
    + `beforePause`：某文件暂停前
    + `afterPause`：某文件暂停后
    + `success`：某文件上传成功
    + `error`：某文件上传失败
    + `finish`：全部上传完成，无论成功失败
    + `beforeRemove`：某文件移除前
    + `afterRemove`：某文件移除后
    + `all`：以上全部事件
  + callback：必选 `(obj) => {}` 监听回调，回调参数obj见[事件回调参数](/v2/usage/cb-params.md)

监听文件事件，支持异步回调，若`event`传入多个事件组成的数组，则这些个事件会进入同一个callback中，[示例](/v2/example/eg-onevent.md)<br>

各个事件中`resolve/reject`后的影响，见下表

> 1、“-”表示无影响，若回调是`promise`，需要`resolve`方可继续；<br>
> 2、若`reject`会进入`error`回调，`reject`时传入的值，即`error`回调中`er`的值；<br>

| | 事件名 | resolve | reject | 备注 |
| --- | --- | --- | --- | --- |
| beforeAdd | 添加某文件前 | - | 不添加此文件 | |
| afterAdd | 添加某文件后 | - | - | |
| addFinish | 全部添加完毕 | - | 若auto为true则不会自动上传，否则无影响 | |
| beforeHash | 某文件生成hash值前 | - | 进入error事件回调 | |
| beforeUpFile | 上传某文件前，即hash值生成后 | - | 进入error事件回调 | 在此回调中设置已上传的分片，被设置的分片不会进入`beforeUpChunk`，及`afterUpChunk`回调，[示例](/v2/example/eg-continue.md) |
| beforeUpChunk | 上传某分片前 | - | 不上传此分片 | reject后，[File实例](/v2/usage/file-attr.md)的`chunkResponse`中对应的值为`undefined`，可在`beforeUpChunk`或`afterUpChunk`回调中设置值，[示例](/v2/example/eg-continue.md) |
| afterUpChunk | 上传某分片后 | - | - | |
| beforePause | 某文件暂停前 | - | 不暂停 | |
| afterPause | 某文件暂停后 | - | - | |
| success | 某文件上传成功 | - | 进入error事件回调 | |
| error | 某文件上传失败 | - | - | |
| finish | 全部上传完成，无论成功失败 | - | - | |
| beforeRemove | 某文件移除前 | - | 不移除 | |
| afterRemove | 某文件移除后 | - | - | |