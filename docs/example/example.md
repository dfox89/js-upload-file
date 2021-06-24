# 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>demo</title>
  <!-- js-upload-file -->
  <script src="//cdn.jsdelivr.net/npm/js-upload-file@1/dist/js-upload-file.min.js"></script>
</head>
<body>
  <input type="file" name="file" multiple onchange="selectFile()">
  <button onclick="startUpload()">开始上传</button>
  <button onclick="pauseUpload()">暂停上传</button>
  <script>
    const myUpload = new JsUploadFile({
      server: '/file/upload', // 上传接口
      chunked: true, // 是否分片
      chunkSize: 2 * 1024 * 1024, // 分片大小
      maxParallel: 2, // 最大同时上传文件数
      formDataKey: { // FormData使用的key
        chunk: 'chunkIndex',
        chunks: 'chunksCount'
      },
      beforeUpload: (file, formData, xhr) => {
        formData.append('temp', 'tempValue')
        xhr.setRequestHeader('tempHead', 'tempHeadValue')
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
