# v2更新日志

## 2.1.0
+ JsUploadFile实例的addFile方法增加第二可选参数，第二参数会设置到[File实例](/v2/usage/file-attr.md?id=data)的`data`属性上
+ 文件状态`queue`，由原先的在`addFinish`事件后值初始化为`queue`，改为在`afterAdd`事件后值初始化为`queue`

## v2.0.0
+ init