# 自定义设置文件hash值

```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听生成hash值前事件
myUpload.on('beforeHash', (obj) => {
  obj.file.hash = '自定义的hash值'
})

// 或异步设置
myUpload.on('beforeHash', (obj) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      obj.file.hash = '自定义的hash值'
      resolve()
    }, 2000)
  })
})
```
