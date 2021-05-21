import ClassControlPromise from './class-control-promise.js'

class FileObj {
  constructor (file, formDataKey, chunkSize, uploadCallback, beforeUpload, createHash) {
    this.file = file // js文件对象
    this.status = 'queue' // 状态（queue待上传，wait等待上传队列，hash生成哈希值中，uping上传中，pause上传暂停，success上传成功，error上传失败，remove即将从fileList中移除）
    this.hash = '' // 哈希值
    this.chunkSize = chunkSize // 分片大小，若不分片则就是文件大小
    this.chunkCount = Math.ceil(file.size / chunkSize) // 分片数，若不分片则就是1
    this.chunkSendedCount = 0 // 已上传分片数
    this.chunkArr = this.splitFile(file, chunkSize, this.chunkCount) // 分片数组
    this.formDataKey = formDataKey // FormData使用的key
    this.uploadCallback = uploadCallback // 上传进度回调
    this.beforeUpload = beforeUpload // 发送上传请求前
    this.createHash = createHash // 传入的生成文件hash值方法
    this.response = null // 文件上传成功，后台返回值
    this.xhr = null // js原生请求实例

    this.controlPromise = new ClassControlPromise()
  }

  // 暂停上传
  pause () {
    if (this.status === 'hash') {
      this.controlPromise.reject('control-pormise-reject')
    } else if (this.xhr) {
      this.xhr.abort()
      this.xhr = null
    }
    this.setStatus('pause')
  }

  // 移除文件
  remove () {
    if (this.status === 'hash') {
      this.controlPromise.reject('control-pormise-reject')
    } else if (this.xhr) {
      this.xhr.abort()
      this.xhr = null
    } else {
      this.uploadCallback({
        type: 'remove',
        file: this
      })
    }
    this.setStatus('remove')
  }

  // 设置文件状态
  setStatus (value) {
    this.status = value
  }

  // 开始上传
  start (server) {
    return new Promise((resolve, reject) => {
      this.setStatus('hash')
      this.uploadCallback({
        type: 'hash',
        file: this
      })
      this.controlPromise.init()
      const p = this.hash ? Promise.resolve(this.hash) : Promise.race([this.initHash(), this.controlPromise.p])
      p.then((hash) => {
        this.hash = hash
        this.setStatus('uping')
        this.uploadCallback({
          type: 'uping',
          file: this,
          value: 0
        })
        return this.send(server)
      }).then((response) => {
        this.setStatus('success')
        resolve(response)
      }).catch((er) => {
        reject(er)
      })
    })
  }

  // 上传
  send (server) {
    const formData = new FormData()
    formData.append(this.formDataKey.file, this.chunkArr[this.chunkSendedCount], this.file.name)
    formData.append(this.formDataKey.hash, this.hash)
    formData.append(this.formDataKey.chunk, this.chunkSendedCount)
    formData.append(this.formDataKey.chunks, this.chunkCount)
    formData.append(this.formDataKey.splitSize, this.chunkSize)
    formData.append(this.formDataKey.name, this.file.name)
    return this.ajaxRequest(server, formData).then((response) => {
      this.chunkSendedCount++
      this.uploadCallback({
        type: 'uping',
        file: this,
        value: this.chunkSendedCount / this.chunkCount
      })
      if (this.chunkSendedCount < this.chunkCount) {
        return Promise.resolve().then(() => this.send(server))
      } else {
        this.response = response
        this.xhr = null
        return Promise.resolve(response)
      }
    })
  }

  // 文件切片
  splitFile (file, size, count) {
    if (count === 1) { // 不需要分片
      return [file]
    } else {
      const arr = []
      let startIndex
      let endIndex
      for (let i = 0; i < count; i++) {
        startIndex = i * size
        endIndex = startIndex + size
        if (endIndex > file.size) endIndex = file.size
        arr.push(file.slice(startIndex, endIndex))
      }
      return arr
    }
  }

  // 发送请求
  ajaxRequest (server, formData) {
    return new Promise((resolve, reject) => {
      this.xhr = new XMLHttpRequest()
      this.xhr.open('post', server, true)
      this.xhr.responseType = 'json'
      this.xhr.timeout = 0
      this.xhr.withCredentials = false
      if (this.beforeUpload) this.beforeUpload(this, formData, this.xhr)
      this.xhr.onreadystatechange = () => {
        if (this.xhr.readyState === 4) {
          if (this.xhr.status === 200) {
            resolve(this.xhr.response)
          } else if (this.xhr.status !== 0) {
            reject(new Error(this.xhr.statusText))
          }
        }
      }
      this.xhr.onabort = () => reject(new Error('abort'))
      this.xhr.ontimeout = () => reject(new Error('timeout'))
      this.xhr.onerror = () => reject(new Error('error'))
      this.xhr.send(formData)
    })
  }

  // 生成文件hash值
  initHash () {
    if (this.createHash) {
      return this.createHash(this.file)
    } else {
      return new Promise((resolve) => {
        // 8-4-4-4-12
        const uuid = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, () => {
          const random = Math.floor(Math.random() * 16) // 生成0-15随机整数
          return random.toString(16)
        })
        resolve(uuid)
      })
    }
  }
}

export default FileObj
