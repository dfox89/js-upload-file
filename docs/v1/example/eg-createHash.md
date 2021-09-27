# createHash示例

```javascript
const myUpload = new JsUploadFile({
  // 其他配置项
  createHash: (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.addEventListener('loadend', () => {
        // 使用第三方库spark-md5生成文件唯一hash值
        const spark = new SparkMD5.ArrayBuffer()
        spark.append(reader.result)
        resolve(spark.end())
      })
    })
  }
})
```
