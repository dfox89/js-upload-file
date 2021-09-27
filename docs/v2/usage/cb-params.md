# 上传事件回调参数 Obj

初始化配置项uploadCallback，及JsUploadFile实例on方法中callback回调参数，只有一个，且类型是Object，数据结构如下

## type

+ 类型：`String`
+ 可能值：
  + beforeAdd：添加文件前
  + afterAdd：添加文件后
  + beforeHash：某文件生成hash值前
  + beforeUpFile：上传文件前，即hash值生成后
  + beforeUpChunk：上传某分片前
  + beforePause：某文件暂停前
  + afterPause：某文件暂停后
  + afterUpChunk：上传某分片后
  + success：某文件上传成功
  + error：某文件上传失败
  + finish：全部上传完成，无论成功失败
  + beforeRemove：某文件移除前
  + afterRemove：某文件移除后

事件类型

## file

+ 类型：[File实例](/v1/usage/file-attr.md)

文件，type为finish无此key

## hash

+ 类型：`String`

文件hash值，仅当type为beforeUpFile才有此key

## response

+ 类型：`Array`

文件上传成功后每一片的返回值，仅当type为success才有此key

## er

错误，仅当type为error才有此key

## chunkIndex

+ 类型：`Number`

分片序号，仅当type为beforeUpChunk/afterUpChunk才有此key

## chunk

+ 类型：`Object`

分片，仅当type为beforeUpChunk/afterUpChunk才有此key

## formData

原生FormData对象，仅当type为beforeUpChunk才有此key

## xhr

原生XMLHttpRequest对象，仅当type为beforeUpChunk才有此key

## progress

上传进度，仅当type为afterUpChunk才有此key

## response

上传成功返回值，仅当type为afterUpChunk才有此key