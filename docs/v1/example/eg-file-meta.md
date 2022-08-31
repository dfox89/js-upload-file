# File实例meta使用示例

```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
myUpload.on('queue', (obj) => {
  console.log('queue', obj)
  if (obj.file.meta.autoUp) {
    // 判断此文件添加后需要立即上传
    this.myUpload.start(obj.file)
  }
})
// 添加文件
myUpload.addFile(files, {
  autoUp: true // 添加自定义变量到File实例的meta上，以实现在queue回调中上传文件，实现这些文件添加后立即上传
})
```
