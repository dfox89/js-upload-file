# v1更新日志

## v1.3.0
+ File实例增加meta属性

## v1.2.1
+ 解决暂停后继续上传第一次uping回调的value值为0的问题

## v1.2.0
+ 增加初始化配置项，失败重试次数retry
+ JsUploadFile实例，start，pause，remove等方法扩展value可传入值的类型
  + 新增支持传入File实例唯一标识id
  + 新增支持传入File实例
  + 新增支持传入File实例唯一标识id组成的数组
  + 新增支持传入File实例与File实例唯一标识id混合组成的数组
+ JsUploadFile实例on新增all事件名，可监听所有事件
+ JsUploadFile实例on方法，扩展event可传入值的类型
  + 新增支持传入多个事件组成的数组
+ JsUploadFile实例on方法，改为可重复监听同一事件
+ File实例增加唯一标识id

## v1.1.3
+ 文档目录结构修改

## v1.1.2
+ 使用github page作为文档

## v1.1.1
+ 文档错误纠正

## v1.1.0
+ JsUploadFile实例新增on方法监听事件回调

## v1.0.0
+ init
