# 上传事件回调参数 Obj

JsUploadFile实例on方法中callback回调参数，只有一个，且类型是Object，数据结构如下

## type

+ 类型：`String`

事件类型

## 其它值

| | file<br>[File实例](/v2/usage/file-attr.md) | response<br>接口返回值 | er<br>错误 | chunkIndex<br>分片序号 | chunk<br>分片 | formData请求参数 | headers请求头参数 | progress<br>进度 |
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
