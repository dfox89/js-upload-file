# 自定义设置文件hash值

```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听生成hash值前事件
myUpload.on('beforeHash', (obj) => {
  obj.file.hash = '自定义的hash值'
})

// 或异步设置，使用spark-md5生成
const SparkMD5 = require('spark-md5')
myUpload.on('beforeHash', (obj) => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(obj.file.file)
    fileReader.onload = (e) => {
      spark.append(e.target.result)
      obj.file.hash = spark.end()
      resolve()
    }
    fileReader.onerror = () => {
      reject(new Error('fileReader-error'))
    }
  })
})
```
