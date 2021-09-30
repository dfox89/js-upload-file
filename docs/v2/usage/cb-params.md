# 上传事件回调参数 Obj

JsUploadFile实例on方法中callback回调参数，只有一个，且类型是Object，数据结构如下

## type

+ 类型：`String`

事件类型，每个事件均支持promise回调，resolve/reject后的影响，见下表

> 1、“-”表示无影响，回调是promise，需要resolve方可继续；<br>
> 2、reject时，请不要传入'error-abort'，'error-timeout'，'error-maxretry'等值，否则会导致内部判断错误；<br>

| | 事件名 | resolve | reject |
| --- | --- | --- | --- |
| beforeAdd | 添加某文件前 | - | 不添加此文件 |
| afterAdd | 添加某文件后 | - | - |
| beforeHash | 某文件生成hash值前 | - | 进入error事件回调 |
| beforeUpFile | 上传某文件前，即hash值生成后 | - | 进入error事件回调 |
| beforeUpChunk | 上传某分片前 | - | 不上传此分片 |
| afterUpChunk | 上传某分片后 | - | - |
| beforePause | 某文件暂停前 | - | 不暂停 |
| afterPause | 某文件暂停后 | - | - |
| success | 某文件上传成功 | - | 进入error事件回调 |
| error | 某文件上传失败 | - | - |
| finish | 全部上传完成，无论成功失败 | - | - |
| beforeRemove | 某文件移除前 | - | 不移除 |
| afterRemove | 某文件移除后 | - | - |

## 其它

不同事件回调有所不同

| | file | hash | response | er | chunkIndex | chunk | formData | xhr | progress |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| beforeAdd | 有 | - | - | - | - | - |  -  |  -  |  -  |
| afterAdd | 有 | - | - | - | - | - |  -  |  -  |  -  |
| beforeHash | 有 | - | - | - | - | - |  -  |  -  |  -  |
| beforeUpFile | 有 | 有 | - | - | - | - |  -  |  -  |  -  |
| beforeUpChunk | 有 | - | - | - | 有 | 有 | 有 | 有 |  -  |
| afterUpChunk | 有 | - | - | - | 有 | 有 |  -  |  -  | 有 |
| beforePause | 有 | - | - | - | - | - |  -  |  -  |  -  |
| afterPause | 有 | 有 | - | - | - | - |  -  |  -  |  -  |
| success | 有 | - | 有 | - | - | - |  -  |  -  |  -  |
| error | 有 | - | - | 有 | - | - |  -  |  -  |  -  |
| finish | - | - | - | - | - | - |  -  |  -  |  -  |
| beforeRemove | 有 | - | - | - | - | - |  -  |  -  |  -  |
| afterRemove | 有 | - | - | - | - | - |  -  |  -  |  -  |
