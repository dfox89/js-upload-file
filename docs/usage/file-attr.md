# File实例属性

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
  + remove：即将停止上传，并从实例的fileList中移除

文件状态

## hash

+ 类型：`String`

默认为32位随机字符串，或者是通过createHash自定义生成的值

## chunkSize

+ 类型：`Number`

分片大小，若初始化不分片则就是文件大小

## chunkCount

+ 类型：`Number`

分片数，若初始化不分片则就是1

## chunkSendedCount

+ 类型：`Number`

已上传分片数

## response

初始值为null，文件上传成功后覆盖为最后一分片的返回值
