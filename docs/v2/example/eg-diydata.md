## 添加自定义值
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听上传文件前
myUpload.on('beforeUpFile', (obj) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if ( /* 文件已上传过 */ ) {
        // 标记所有分片已上传
        for (let i = 0; i < obj.file.chunkCount; i++) {
          obj.file.sendedChunk.push(i)
        }
        obj.file.data.type = '秒传'
      } else if ( /* 上传过部分分片 */ ) {
        obj.file.sendedChunk.push(3, 10) // 标记第3,10分片已上传
        obj.file.data.type = '续传'
      } else {
        obj.file.data.type = '正常'
      }
      resolve()
    }, 2000)
  })
})
// 监听上传成功事件
myUpload.on('success', (obj) => {
  console.log('自定义属性type', obj.file.data.type)
})
```