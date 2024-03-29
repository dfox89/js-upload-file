# JsUploadFile实例方法

## addFile(value, meta)

+ 参数：
  + value：必选 `Array` 原生File对象组成的数组
  + meta：可选 `Object` 此值会设置到[File实例](/v1/usage/file-attr.md?id=meta)的`meta`属性上
    > &gt;=1.3.0 支持第二参数

将文件添加到上传实例中<br>* 添加的文件status默认为queue

## start(value)

+ 参数：
  + value：可选 `String` or `Array` or [File实例](/v1/usage/file-attr.md)
    > <=1.1.3 只支持[File实例](/v1/usage/file-attr.md)组成的数组

开始上传，value不传则全部上传，传入value则上传传入的
<br>* 状态为queue，pause，error的文件才会上传，其他状态值的文件不受影响
<br>* value可以是[File实例](/v1/usage/file-attr.md)，或其id值，或其id值组成的数组，或[File实例](/v1/usage/file-attr.md)组成的数组，或其id值和[File实例](/v1/usage/file-attr.md)混合组成的数组

## pause(value)

+ 参数：
  + value：可选 `String` or `Array` or [File实例](/v1/usage/file-attr.md)
    > <=1.1.3 只支持[File实例](/v1/usage/file-attr.md)组成的数组

暂停上传，value不传则全部暂停，传入value则暂停传入的
<br>* 状态为wait，hash，uping的文件才会暂停，其他状态值的文件不受影响
<br>* value可以是[File实例](/v1/usage/file-attr.md)，或其id值，或其id值组成的数组，或[File实例](/v1/usage/file-attr.md)组成的数组，或其id值和[File实例](/v1/usage/file-attr.md)混合组成的数组

## remove(value)

+ 参数：
  + value：可选 `String` or `Array` or [File实例](/v1/usage/file-attr.md)
    > <=1.1.3 只支持[File实例](/v1/usage/file-attr.md)组成的数组

移除文件，value不传则全部移除，传入value则移除传入的
<br>* 任何状态的文件均可移除，hash，uping状态的文件会先暂停后移除，但不会触发pause回调，只会触发remove回调
<br>* value可以是[File实例](/v1/usage/file-attr.md)，或其id值，或其id值组成的数组，或[File实例](/v1/usage/file-attr.md)组成的数组，或其id值和[File实例](/v1/usage/file-attr.md)混合组成的数组

## on(event, callback)

> 1.1.0 新增

+ 参数：
  + event：必选 `String` or `Array` 监听事件名，可监听事件名见下列
    > <=1.1.3 只支持`String`

    > 1.2.0 新增 all
    + queue：添加文件
    + hash：某文件生成hash值中
    + uping：某文件上传中
    + pause：某文件上传暂停
    + success：某文件上传成功
    + error：某文件上传失败
    + finish：全部上传完成，无论成功失败
    + remove：某文件移除
    + all：以上全部事件
  + callback：必选 `(obj) => {}` 监听回调，回调参数obj见[事件回调参数](/v1/usage/cb-params.md)

监听文件事件，若event传入多个事件组成的数组，则这些个事件会进入同一个callback中，[示例](/v1/example/eg-onevent.md)

> 1.2.0起，监听同一事件多次，监听回调均会执行【之前后监听的回调会覆盖先前的】
