# on监听事件示例

## 监听单个事件
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听上传进度事件
myUpload.on('uping', (obj) => {
  console.log('uping', obj)
})
// 监听上传成功事件
myUpload.on('success', (obj) => {
  console.log('success', obj)
})
```

## 监听多个事件
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听上传进度/成功事件
myUpload.on(['uping', 'success'], (obj) => {
  console.log('uping,success', obj)
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
// 或者，把所有事件传入，等价于all
myUpload.on(['queue', 'hash', 'uping', 'pause', 'success', 'error', 'finish', 'remove'], (obj) => {
  console.log('uping,success', obj)
})
```

## 混合监听事件
```javascript
const myUpload = new JsUploadFile({
  // 配置项
})
// 监听上传成功事件
myUpload.on(['queue', 'hash'], (obj) => {
  console.log('queue,hash', obj)
})
// 监听上传成功事件
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
// 监听上传添加文件/成功事件
myUpload.on(['queue', 'success', (obj) => {
  console.log('queue,success-3', obj)
})
```
