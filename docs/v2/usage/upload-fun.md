# JsUploadFile实例方法

## addFile(value)

+ 参数：
  + value：必选 `Array` 原生File对象组成的数组

将文件添加到上传实例中<br>* 添加的文件status默认为queue

## start(value)

+ 参数：
  + value：可选 `String` or `Array` or [File实例](/v2/usage/file-attr.md)

开始上传，value不传则全部上传，传入value则上传传入的
<br>* 状态为queue，pause，error的文件才会上传，其他状态值的文件不受影响
<br>* value可以是[File实例](/v2/usage/file-attr.md)，或其id值，或其id值组成的数组，或[File实例](/v2/usage/file-attr.md)组成的数组，或其id值和[File实例](/v2/usage/file-attr.md)混合组成的数组

## pause(value)

+ 参数：
  + value：可选 `String` or `Array` or [File实例](/v2/usage/file-attr.md)

暂停上传，value不传则全部暂停，传入value则暂停传入的
<br>* 状态为wait，hash，uping的文件才会暂停，其他状态值的文件不受影响
<br>* value可以是[File实例](/v2/usage/file-attr.md)，或其id值，或其id值组成的数组，或[File实例](/v2/usage/file-attr.md)组成的数组，或其id值和[File实例](/v2/usage/file-attr.md)混合组成的数组

## remove(value)

+ 参数：
  + value：可选 `String` or `Array` or [File实例](/v2/usage/file-attr.md)

移除文件，value不传则全部移除，传入value则移除传入的
<br>* 任何状态的文件均可移除
<br>* value可以是[File实例](/v2/usage/file-attr.md)，或其id值，或其id值组成的数组，或[File实例](/v2/usage/file-attr.md)组成的数组，或其id值和[File实例](/v2/usage/file-attr.md)混合组成的数组

## on(event, callback)

+ 参数：
  + event：必选 `String` or `Array` 监听事件名，可监听事件名见下列
    + beforeAdd：添加某文件前
    + afterAdd：添加某文件后
    + beforeHash：某文件生成hash值前
    + beforeUpFile：上传某文件前，即hash值生成后
    + beforeUpChunk：上传某分片前
    + afterUpChunk：上传某分片后
    + beforePause：某文件暂停前
    + afterPause：某文件暂停后
    + success：某文件上传成功
    + error：某文件上传失败
    + finish：全部上传完成，无论成功失败
    + beforeRemove：某文件移除前
    + afterRemove：某文件移除后
    + all：以上全部事件
  + callback：必选 `(obj) => {}` 监听回调，回调参数obj见[事件回调参数](/v2/usage/cb-params.md)

监听文件事件，支持异步回调，若event传入多个事件组成的数组，则这些个事件会进入同一个callback中，[示例](/v2/example/eg-onevent.md)
