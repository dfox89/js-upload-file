# js-upload-file

[![npm-package](https://img.shields.io/npm/v/js-upload-file?color=FF0000&label=npm%20package)](https://www.npmjs.com/package/js-upload-file)
[![npm-publish](https://img.shields.io/github/workflow/status/dfox89/js-upload-file/npm-publish?color=FFFF00&label=npm%20publish)](https://github.com/dfox89/js-upload-file/actions)
![size](https://img.shields.io/bundlephobia/min/js-upload-file?color=FF7F00)
![license](https://img.shields.io/npm/l/js-upload-file?color=0000FF)
[![last-commit](https://img.shields.io/github/last-commit/dfox89/js-upload-file?color=8B00FF)](https://github.com/dfox89/js-upload-file/commits/master)

实现前端文件上传，分片上传，多文件同时上传，暂停及续传；<br>但上传按钮样式及上传文件类型，大小等需要自行控制及校验；

[详细文档](https://dfox89.github.io/js-upload-file/)

## 安装

```sh
npm install js-upload-file
# or
yarn add js-upload-file
```

## 使用

模块
```javascript
// es
import JsUploadFile from 'js-upload-file'
const myUpload = new JsUploadFile({
  server: '上传接口'
})

// commonjS
const JsUploadFile = require('js-upload-file')
const myUpload = new JsUploadFile({
  server: '上传接口'
})

// amd
require(['js-upload-file'], function (JsUploadFile) {
  const myUpload = new JsUploadFile({
    server: '上传接口'
  })
})
```

cdn
```html
<script src="js-upload-file.min.js"></script>
<script>
  const myUpload = new JsUploadFile({
    server: '上传接口'
  })
</script>
```
