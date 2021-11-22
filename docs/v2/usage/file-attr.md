# File实例属性

## id

+ 类型：`String`

唯一标识

## file

+ 类型：`Object`

原生File对象

## status

+ 类型：`String`
+ 可能值：
  + queue：待上传
  + wait：等待上传队列
  + hash：生成hash值中
  + uping：上传中
  + pause：上传暂停
  + success：上传成功
  + error：上传失败
  + remove：即将移除

文件状态，在`addFinish`事件前为`''`，在`addFinish`事件后值初始化为`queue`（在`addFinish`事件回调结束前，点击上传，这批文件不会开始上传）

## ext

+ 类型：`String`

文件扩展名，不存在则为`''`

## hash

+ 类型：`String`

默认为32位随机字符串，或者是在事件回调中自定义设置的hash值，在`beforeUpFile`事件前值为`''`

## chunkResponse

+ 类型：`Array`

每一分片上传成功后的返回值，第一片在`Array[0]`，第二片在`Array[1]`，依次类推

## chunkSize

+ 类型：`Number`

分片大小，若初始化不分片则就是文件大小

## chunkCount

+ 类型：`Number`

分片数，若初始化不分片则就是`1`

## sendedChunk

+ 类型：`Array`

已上传的分片序号，可通过在`beforeUpFile`事件中修改此值，或`beforeUpChunk`中使用`reject`，以略过已上传分片，[示例](/v2/example/eg-continue.md)
