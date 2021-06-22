# JsUploadFile初始化

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

## formDataKey

+ 类型：`Object`
+ 默认值：
| Key | Type | Default | Description |
| --- | --- | --- | --- |
| file | <code>String</code> | file | 文件 |
| hash | <code>String</code> | hash | hash值 |
| chunk | <code>String</code> | chunk | 分片序号，从0开始 |
| chunks | <code>String</code> | chunk | 总分片数，不分片则为1 |
| splitSize | <code>String</code> | splitSize | 分片大小 |
| name | <code>String</code> | name | 文件名 |


上传参数FormData使用的key

## createHash

+ 类型：`Function`
+ 默认值：`(file) => {}`
  + file：原生file

文件hash值生成方法，默认随机生成32位的uuid，自定义方法需要返回Promise，resolve值为生成的hash值

## beforeUpload

+ 类型：`Function`
+ 默认值：`(file, formData, xhr) => {}`
  + file：[File实例](attr-file.md)
  + formData：原生 FormData 对象
  + xhr：原生 XMLHttpRequest 对象

上传前回调

## uploadCallback

+ 类型：`Function`
+ 默认值：`(obj) => {}`
  + obj：[事件回调参数](cbParams.md)

上传事件回调
