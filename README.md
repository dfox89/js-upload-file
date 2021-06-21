# js-upload-file

[![npm-package](https://img.shields.io/npm/v/js-upload-file?color=FF0000&label=npm%20package)](https://www.npmjs.com/package/js-upload-file)
[![npm-publish](https://img.shields.io/github/workflow/status/dfox89/js-upload-file/npm-publish?color=FFFF00&label=npm%20publish)](https://github.com/dfox89/js-upload-file/actions)
![size](https://img.shields.io/bundlephobia/min/js-upload-file?color=FF7F00)
![license](https://img.shields.io/npm/l/js-upload-file?color=0000FF)
[![last-commit](https://img.shields.io/github/last-commit/dfox89/js-upload-file?color=8B00FF)](https://github.com/dfox89/js-upload-file/commits/master)

实现前端文件上传，分片上传，多文件同时上传，暂停及续传；<br>但上传按钮样式及上传文件类型，大小等需要自行控制及校验；

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
  // Options
})

// commonjS
const JsUploadFile = require('js-upload-file')
const myUpload = new JsUploadFile({
  // Options
})

// amd
require(['js-upload-file'], function (JsUploadFile) {
  const myUpload = new JsUploadFile({
    // Options
  })
})
```

cdn
```html
<script src="js-upload-file.min.js"></script>
<script>
  const myUpload = new JsUploadFile({
    // Options
  })
</script>
```

## 初始化配置&nbsp;Options

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| server | <code>String</code> | null | 上传接口 |
| chunked | <code>Boolean</code> | false | 是否分片 |
| chunkSize | <code>Number</code> | 1 * 1024 * 1024 | 分片大小，单位bytes
| maxParallel | <code>Number</code> | 3 | 最大同时上传文件数 |
| formDataKey | <code>Object</code> | 见下表 | 上传参数FormData使用的key |
| createHash | <code>Function</code> | (file) => {} | 文件hash值生成方法<br>默认随机生成32位的uuid<br>自定义方法需要返回Promise，resolve值为生成的hash值<br>file：原生file |
| beforeUpload | <code>Function</code> | (file, formData, xhr) => {} | 上传前回调<br>file：<b>File</b>&nbsp;实例<br>formData：原生&nbsp;FormData&nbsp;对象<br>xhr：原生&nbsp;XMLHttpRequest&nbsp;对象 |
| uploadCallback | <code>Function</code> | (obj) => {} | 上传事件回调<br>obj：对象，数据结构见下表 |

<br>

### formDataKey&nbsp;配置
| Key | Type | Default | Description |
| --- | --- | --- | --- |
| file | <code>String</code> | file | 文件 |
| hash | <code>String</code> | hash | hash值 |
| chunk | <code>String</code> | chunk | 分片序号，从0开始 |
| chunks | <code>String</code> | chunk | 总分片数，不分片则为1 |
| splitSize | <code>String</code> | splitSize | 分片大小 |
| name | <code>String</code> | name | 文件名 |

<br>

### uploadCallback&nbsp;回调参数&nbsp;<b>obj</b>
| Key | Description |
| --- | --- |
| type | 事件类型<br>queue：添加文件<br>hash：某文件生成hash值中<br>uping：某文件上传中<br>pause：某文件上传暂停<br>success：某文件上传成功<br>error：某文件上传失败<br>finish：全部上传完成，无论成功失败<br>remove：某文件移除 |
| file | <b>File</b>&nbsp;实例<br>type为finish无此key |
| value | 仅当type为以下值才有此key<br>uping：上传进度，值为0-1<br>success：后台接口返回值<br>error：Error对象 |

<br>

## js-upload-file&nbsp;实例属性
| Attribute | Type | Description |
| --- | --- | --- |
| isUploading | <code>Boolean</code> | 是否正在上传 |
| fileList | <code>Array</code> | 文件列表，每项均是一个文件&nbsp;<b>File</b>&nbsp;实例 |

<br>

## js-upload-file&nbsp;实例方法

| Method | Param | Description |
| --- | --- | --- |
| addFile(value) | 必选 <code>{Array}</code> value 原生文件对象组成的数组 | 将文件添加到上传实例中<br>* 添加的文件status默认为queue |
| start(value) | 可选 <code>{Array}</code> value <b>File</b>&nbsp;实例组成的数组 | 开始上传，value不传则全部上传，传入value则上传传入的<br>* 状态为queue，pause，error的才会上传<br>* 其他状态值的文件不受影响 |
| pause(value) | 可选 <code>{Array}</code> value <b>File</b>&nbsp;实例组成的数组 | 暂停上传，value不传则全部暂停，传入value则暂停传入的<br>* 状态为wait，hash，uping的才会暂停 |
| remove(value) | 可选 <code>{Array}</code> value <b>File</b>&nbsp;实例组成的数组 | 移除文件，value不传则全部移除，传入value则移除传入的<br>* 任何状态的文件均可移除<br>* hash，uping状态的文件会暂停后移除，但不会触发pause回调，只会触发remove回调 |
| on(event, callback) | 必选 <code>{String}</code> event 监听事件名，可监听事件名同uploadCallback回调参数的type值<br>必选 <code>{Function}</code> 监听回调，回调参数同配置项uploadCallback | - |

<br>

## File&nbsp;实例属性
| Attribute | Type | Description |
| --- | --- | --- |
| file | <code>Object</code> | 原生文件对象 |
| status | <code>String</code> | 文件状态<br>queue：待上传<br>wait：等待上传队列<br>hash：生成hash值中<br>uping：上传中<br>pause：上传暂停<br>success：上传成功<br>error：上传失败<br>remove：即将停止上传，并从实例的fileList中移除 |
| hash | <code>String</code> | 默认为32位随机字符串，或者是通过createHash自定义生成的值 |
| chunkSize | <code>Number</code> | 分片大小，若初始化不分片则就是文件大小 |
| chunkCount | <code>Number</code> | 分片数，若初始化不分片则就是1 |
| chunkSendedCount | <code>Number</code> | 已上传分片数 |
| response | <code>-</code> | 初始值为null，文件上传成功后覆盖为最后一分片的返回值 |

<br>

## 示例

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>demo</title>
  <!-- 自定义生成hash -->
  <!-- <script src="spark-md5.js"></script> -->
  <!-- js-upload-file -->
  <script src="js-upload-file.min.js"></script>
</head>
<body>
  <input type="file" name="file" multiple onchange="selectFile()">
  <button onclick="startUpload()">开始上传</button>
  <button onclick="pauseUpload()">暂停上传</button>
  <script>
    const myUpload = new JsUploadFile({
      server: '/file/upload', // 上传接口
      chunked: true, // 是否分片
      chunkSize: 1 * 1024 * 1024, // 分片大小
      maxParallel: 3, // 最大同时上传文件数
      formDataKey: { // FormData使用的key
        file: 'file',
        hash: 'hash',
        chunk: 'chunkIndex',
        chunks: 'chunksCount',
        splitSize: 'splitSize',
        name: 'name'
      },
      /* createHash: (file) => {
        // 使用spark-md5生成文件hash
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.readAsArrayBuffer(file)
          reader.addEventListener('loadend', () => {
            const spark = new SparkMD5.ArrayBuffer()
            spark.append(reader.result)
            resolve(spark.end())
          })
        })
      }, */
      beforeUpload: (file, formData, xhr) => {
        // formData.append('temp', 'tempValue')
        // xhr.setRequestHeader('tempHead', 'tempHeadValue')
        // xhr.withCredentials = true
        console.log('beforeUpload', file, formData, xhr)
      },
      uploadCallback: (obj) => {
        console.log('uploadCallback', obj)
      }
    })
    // 监听成功事件，可监听事件queue,hash,uping,pause,success,error,finish,remove
    myUpload.on('success', (obj) => {
      console.log('success', obj)
    })
    function selectFile () {
      const files = this.event.target.files;
      myUpload.addFile(files);
    }
    function startUpload () {
      myUpload.start();
    }
    function pauseUpload () {
      myUpload.pause();
    }
  </script>
</body>
</html>
```
