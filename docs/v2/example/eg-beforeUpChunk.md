# 添加请求参数

```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听上传成功事件
myUpload.on('beforeUpChunk', (obj) => {
  // form data中增加参数
  obj.formData.temp = 'tempValue' + obj.chunkIndex
  // 请求头增加参数
  obj.headers.tempHead = 'tempHeadValue' + obj.chunkIndex
})
```
