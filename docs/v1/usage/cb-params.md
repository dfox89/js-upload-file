# 上传事件回调参数 Obj

初始化配置项uploadCallback，及JsUploadFile实例on方法中callback回调参数，只有一个，且类型是Object，数据结构如下

## type

+ 类型：`String`
+ 可能值：
  + queue：添加文件
  + hash：某文件生成hash值中
  + uping：某文件上传中
  + pause：某文件上传暂停
  + success：某文件上传成功
  + error：某文件上传失败
  + finish：全部上传完成，无论成功失败
  + remove：某文件移除

事件类型

## file

+ 类型：[File实例](/v1/usage/file-attr.md)

文件，type为finish无此key

## value

仅当type为以下值才有此key<br>uping：上传进度，值为0-1<br>success：后台接口返回值<br>error：Error对象
