# JsUploadFile实例属性

## isUploading

+ 类型：`Boolean`

是否正在上传

## fileList

+ 类型：`Array`

文件列表，每项均是一个[File实例](/v2/usage/file-attr.md)

## isAdding

+ 类型：`Boolean`

是否正在添加文件，即是否有文件在`beforeAdd`，`afterAdd`，`addFinish`事件回调中
