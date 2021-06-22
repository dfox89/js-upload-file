# 示例

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
