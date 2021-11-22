# uploadCallback示例

```javascript
const myUpload = new JsUploadFile({
  // 其他配置项
  uploadCallback: (obj) => {
    console.log('uploadCallback', obj)
  }
})
```
