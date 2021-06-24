# JsUploadFile实例方法

## addFile(value)

+ 参数：
  + value：必选 `Array` 原生File对象组成的数组

将文件添加到上传实例中<br>* 添加的文件status默认为queue

## start(value)

+ 参数：
  + value：可选 `Array` [File实例](/usage/file-attr.md)组成的数组

开始上传，value不传则全部上传，传入value则上传传入的
<br>* 状态为queue，pause，error的文件才会上传，其他状态值的文件不受影响

## pause(value)

+ 参数：
  + value：可选 `Array` [File实例](/usage/file-attr.md)组成的数组

暂停上传，value不传则全部暂停，传入value则暂停传入的
<br>* 状态为wait，hash，uping的文件才会暂停，其他状态值的文件不受影响

## remove(value)

+ 参数：
  + value：可选 `Array` [File实例](/usage/file-attr.md)组成的数组

移除文件，value不传则全部移除，传入value则移除传入的
<br>* 任何状态的文件均可移除，hash，uping状态的文件会先暂停后移除，但不会触发pause回调，只会触发remove回调

## on(event, callback)

+ 参数：
  + event：必选 `String` 监听事件名，可监听事件名同uploadCallback[事件回调参数](/usage/cb-params.md)的type值
  + callback：必选 `(obj) => {}` 监听回调，回调参数obj见[事件回调参数](/usage/cb-params.md)

监听文件事件
