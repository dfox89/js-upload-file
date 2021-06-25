# JsUploadFile配置项

## server

+ 类型：`String`
+ 默认值：`null`

上传接口

## chunked

+ 类型：`Boolean`
+ 默认值：`false`

是否分片

## chunkSize

+ 类型：`Number`
+ 默认值：`1 * 1024 * 1024`

分片大小，单位bytes

## maxParallel

+ 类型：`Number`
+ 默认值：`3`

最大同时上传文件数

## retry

+ 类型：`Number`
+ 默认值：`0`

失败重试次数，指文件的每一分片可重试次数，未分片文件就相当于文件失败重试次数
<br>* 达到失败重试次数上限前，均不会触发失败回调

## formDataKey

+ 类型：`Object`
+ 默认值：

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| file | `String` | file | 文件 |
| hash | `String` | hash | hash值 |
| chunk | `String` | chunk | 分片序号，从0开始 |
| chunks | `String` | chunk | 总分片数，不分片则为1 |
| splitSize | `String` | splitSize | 分片大小 |
| name | `String` | name | 文件名 |

上传参数FormData使用的key，[示例](/example/eg-formDataKey.md)

## createHash

+ 类型：`Function`
+ 默认值：`(file) => {}`
  + file：原生File对象

文件hash值生成方法，默认随机生成32位的uuid，自定义方法需要返回Promise，resolve值为生成的hash值，[示例](/example/eg-createHash.md)

## beforeUpload

+ 类型：`Function`
+ 默认值：`(file, formData, xhr) => {}`
  + file：[File实例](/usage/file-attr.md)
  + formData：原生FormData对象
  + xhr：原生XMLHttpRequest对象

上传前回调，[示例](/example/eg-beforeUpload.md)

## uploadCallback

+ 类型：`Function`
+ 默认值：`(obj) => {}`
  + obj：[事件回调参数](/usage/cb-params.md)

上传事件回调，[示例](/example/eg-uploadCallback.md)
