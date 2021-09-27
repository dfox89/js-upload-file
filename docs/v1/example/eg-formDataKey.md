# formDataKey示例

## 全部改变
```javascript
const myUpload = new JsUploadFile({
  // 其他配置项
  formDataKey: { // FormData使用的key
    file: 'myFile',
    hash: 'id',
    chunk: 'chunkIndex',
    chunks: 'chunksCount',
    splitSize: 'size',
    name: 'fileName'
  }
})
```

## 部分改变
```javascript
const myUpload = new JsUploadFile({
  // 其他配置项
  formDataKey: { // FormData使用的key
    file: 'myFile',
    hash: 'id'
  }
})
```