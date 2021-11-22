# beforeUpload示例

```javascript
const myUpload = new JsUploadFile({
  // 其他配置项
  beforeUpload: (file, formData, xhr) => {
    // form data中增加参数
    formData.append('temp', 'tempValue')
    // 请求头增加参数
    xhr.setRequestHeader('tempHead', 'tempHeadValue')
  }
})
```
