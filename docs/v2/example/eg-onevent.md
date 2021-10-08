# on监听事件示例

## 监听单个事件
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听某文件上传成功事件
myUpload.on('success', (obj) => {
  console.log('success', obj)
})
```

## 监听多个事件
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听某分片上传成功/某文件上传成功事件
myUpload.on(['afterUpChunk', 'success'], (obj) => {
  console.log('afterUpChunk, success', obj)
})
```

## 事件异步回调
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 使用promise
myUpload.on('beforeUpFile', (obj) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 2000)
  })
})
// 使用async+await
myUpload.on('beforeUpFile', async (obj) => {
  await someAsyncFun()
})
```

## 监听所有事件
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听上传所有事件
myUpload.on('all', (obj) => {
  console.log('all', obj)
})
```

## 不同事件，不同回调
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听添加某文件后/某文件上传前事件
myUpload.on(['afterAdd', 'beforeUpFile'], (obj) => {
  console.log('afterAdd, beforeUpFile', obj)
})
// 监听某文件上传成功事件
myUpload.on('success', (obj) => {
  console.log('success', obj)
})
```

## 重复监听同一个事件
后监听的不会覆盖前面的，callback都会执行
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听上传成功事件
myUpload.on('success', (obj) => {
  console.log('success-1', obj)
})
// 监听上传成功事件
myUpload.on('success', (obj) => {
  console.log('success-2', obj)
})
// 监听添加某文件后/成功事件
myUpload.on(['afterAdd', 'success'], (obj) => {
  console.log('afterAdd, success-3', obj)
})
```
