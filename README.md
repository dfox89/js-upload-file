# js-upload-file

[![npm-package](https://img.shields.io/npm/v/js-upload-file?color=FF0000&label=npm%20package)](https://www.npmjs.com/package/js-upload-file)
[![npm-publish](https://img.shields.io/github/workflow/status/dfox89/js-upload-file/npm-publish?color=FFFF00&label=npm%20publish)](https://github.com/dfox89/js-upload-file/actions)
![size](https://img.shields.io/bundlephobia/min/js-upload-file?color=FF7F00)
![license](https://img.shields.io/npm/l/js-upload-file?color=0000FF)
[![last-commit](https://img.shields.io/github/last-commit/dfox89/js-upload-file?color=8B00FF)](https://github.com/dfox89/js-upload-file/commits/master)

一个前端文件上传插件

- 支持多文件并发上传，分片上传，暂停上传，失败自动重传等；
- 配合后端接口可实现文件续传；
- 支持多种上传事件，便于对整个上传过程监听与控制；
- 事件回调支持异步方法，便于实现事件的异步校验及相关业务逻辑；

[详细文档](https://dfox89.github.io/js-upload-file/)


```javascript
// 引入
import JsUploadFile from 'js-upload-file'
// 初始化
const myUpload = new JsUploadFile({
  server: '上传接口', // 上传接口
  auto: false, // 自动上传
  // file: [], // 初始化就加入上传的文件
  chunked: false, // 是否分片
  chunkSize: 1 * 1024 * 1024, // 分片大小
  maxFileParallel: 3, // 最大同时上传文件数
  maxAjaxParallel: 2, // 单个文件最大同时上传分片数
  maxRetry: 1, // 失败重试次数
  formDataKey: { // FormData使用的key
    file: 'file',
    hash: 'hash',
    chunk: 'count',
    chunks: 'index',
    splitSize: 'size',
    name: 'fileName'
  }
})
// 监听事件
myUpload.on('beforeUpFile', (obj) => {
  // 某文件上传前，执行异步方法校验
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 2000)
  })
})
myUpload.on('success', (obj) => {
  // 某文件上传成功
})
// 添加文件
myUpload.addFile(files)
// 开始上传
myUpload.start()
// 暂停上传
myUpload.pause()
// 移除文件
myUpload.remove()
```
