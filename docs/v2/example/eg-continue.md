## 文件续传
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 在文件上传前，设置已上传分片，promise非必须，若可以同步判断则无需使用promise回调
myUpload.on('beforeUpFile', (obj) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      obj.file.sendedChunk.push(3, 10) // 标记第3,10分片已上传
      obj.file.chunkResponse[10] = {
        // 若不设置此分片的返回值，则在success回调中response对应的值为undefined
      }
      resolve() // 请resolve掉，若reject则会不上传此文件并进入error回调
    }, 2000)
  })
})

// 在每一分片上传前校验分片是否上传，promise非必须，若可以同步判断则无需使用promise回调
myUpload.on('beforeUpChunk', (obj) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      obj.file.sendedChunk.push(10)
      obj.file.chunkResponse[10] = {
        // 若不设置此分片的返回值，则在success回调中response对应的值为undefined
      }
      reject() // 跳过此分片，请reject掉，若resolve则仍然会上传此分片
    }, 2000)
  })
})
```