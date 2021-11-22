# 简单示例

## 使用uploadCallback监听上传回调事件
```javascript
const myUpload = new JsUploadFile({
  server: '/file/upload', // 上传接口
  uploadCallback: (obj) => { // 上传回调
    console.log('uploadCallback', obj)
  }
})
```

## 使用on监听上传回调事件
```javascript
const myUpload = new JsUploadFile({
  server: '/file/upload', // 上传接口
})
// 监听上传成功事件
myUpload.on('success', (obj) => {
  console.log('success', obj)
})
```
