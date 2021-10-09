# 上传事件回调参数 Obj

JsUploadFile实例on方法中callback回调参数，只有一个，且类型是Object，数据结构如下

## type

+ 类型：`String`

事件类型，每个事件均支持promise回调，resolve/reject后的影响，见下表

> 1、“-”表示无影响，回调是promise，需要resolve方可继续；<br>
> 2、若reject会进入error回调，则reject时传入的值，即error回调中er的值；<br>
> 3、reject时，请不要传入'error-abort'，'error-timeout'，'error-maxretry'等值，否则会导致内部判断错误；<br>

| | 事件名 | resolve | reject | 备注 |
| --- | --- | --- | --- | --- |
| beforeAdd | 添加某文件前 | - | 不添加此文件 | |
| afterAdd | 添加某文件后 | - | - | |
| addFinish | 全部添加完毕 | - | 若初始化auto为true则不会自动上传，否则reject无影响 | |
| beforeHash | 某文件生成hash值前 | - | 进入error事件回调 | |
| beforeUpFile | 上传某文件前，即hash值生成后 | - | 进入error事件回调 | |
| beforeUpChunk | 上传某分片前 | - | 不上传此分片 | reject后，注意在[File实例](/v2/usage/file-attr.md)的sendedChunk中push对应的值，<br>否则afterUpChunk回调的progress在全部分片处理完成后不会到1，<br>因为progress是由sendedChunk.length/chunkCount计算出来的 |
| afterUpChunk | 上传某分片后 | - | - | |
| beforePause | 某文件暂停前 | - | 不暂停 | |
| afterPause | 某文件暂停后 | - | - | |
| success | 某文件上传成功 | - | 进入error事件回调 | |
| error | 某文件上传失败 | - | - | |
| finish | 全部上传完成，无论成功失败 | - | - | |
| beforeRemove | 某文件移除前 | - | 不移除 | |
| afterRemove | 某文件移除后 | - | - | |

## 其它值

| | file<br>[File实例](/v2/usage/file-attr.md) | response<br>接口返回值 | er<br>错误 | chunkIndex<br>分片序号 | chunk<br>分片 | formData<br>原生FormData对象 | xhr<br>原生XMLHttpRequest对象 | progress<br>进度 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| beforeAdd | 有 | - | - | - | - | - | - | - |
| afterAdd | 有 | - | - | - | - | - | - | - |
| addFinish | 有 `Array` | - | - | - | - | - | - | - |
| beforeHash | 有 | - | - | - | - | - | - | - |
| beforeUpFile | 有 | - | - | - | - | - | - | - |
| beforeUpChunk | 有 | - | - | 有 | 有 | 有 | 有 | - |
| afterUpChunk | 有 | 有 | - | 有 | 有 | - | - | 有 |
| beforePause | 有 | - | - | - | - | - | - | - |
| afterPause | 有 | - | - | - | - | - | - | - |
| success | 有 | 有 `Array` | - | - | - | - | - | - |
| error | 有 | - | 有 | - | - | - | - | - |
| finish | - | - | - | - | - | - | - | - |
| beforeRemove | 有 | - | - | - | - | - | - | - |
| afterRemove | 有 | - | - | - | - | - | - | - |
