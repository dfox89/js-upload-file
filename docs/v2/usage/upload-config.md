# JsUploadFile配置项

## server

+ 类型：`String`
+ 默认值：`null`

上传接口

## auto

+ 类型：`Boolean`
+ 默认值：`false`

添加文件后就上传

## file

+ 类型：`Array`
+ 默认值：`[]`

初始化加入的文件

## chunked

+ 类型：`Boolean`
+ 默认值：`false`

是否分片

## chunkSize

+ 类型：`Number`
+ 默认值：`1 * 1024 * 1024`

分片大小，单位`bytes`

## maxFileParallel

+ 类型：`Number`
+ 默认值：`3`

最大同时上传文件数

## maxAjaxParallel

+ 类型：`Number`
+ 默认值：`1`

单个文件最大同时上传分片数

## maxRetry

+ 类型：`Number`
+ 默认值：`0`

单个文件最大连续失败重试次数
<br>* 达到失败重试次数上限前，均不会触发失败回调

## formDataKey

+ 类型：`Object`
+ 默认值：

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| file | `String` | file | 文件 |
| hash | `String` | hash | hash值 |
| chunk | `String` | chunk | 分片序号，从0开始 |
| chunks | `String` | chunks | 总分片数，不分片则为1 |
| splitSize | `String` | splitSize | 分片大小 |
| name | `String` | name | 文件名 |

上传参数FormData使用的key，[示例](/v2/example/eg-formDataKey.md)
