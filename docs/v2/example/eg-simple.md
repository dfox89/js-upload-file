# 简单示例

```javascript
const myUpload = new JsUploadFile({
  server: '/file/upload', // 上传接口
})
// 监听上传成功事件
myUpload.on('success', (obj) => {
  console.log('success', obj)
})
```
