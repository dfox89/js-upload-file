# js-upload-file ![version](https://img.shields.io/badge/-v1.2.1-%23f00)

!> 当前为v1文档，如需其它版本文档，请点击右上角切换

- 实现前端文件上传，分片上传，多文件同时上传，暂停及续传；

```javascript
const myUpload = new JsUploadFile({
  server: '上传接口'
})
myUpload.on('success', (obj) => {
  console.log('success', obj)
})
```