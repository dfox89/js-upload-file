import ClassControlPromise from './class-control-promise.js'

class FileObj {
  constructor (file, triggerEvent, config, uniqueNum) {
    this.id = 'file_' + uniqueNum // 文件唯一标识
    this.file = file // js文件对象
    this.status = 'queue' // 状态（queue待上传，wait等待上传队列，hash生成哈希值中，uping上传中，pause上传暂停，success上传成功，error上传失败，remove即将从fileList中移除）
    this.hash = '' // 哈希值
    this.chunkSize = config.chunked ? config.chunkSize : file.size // 分片大小，若不分片则就是文件大小
    this.chunkCount = Math.ceil(file.size / this.chunkSize) // 分片数，若不分片则就是1
    this.chunkSendedCount = 0 // 已上传分片数
    this.response = null // 文件上传成功，后台返回值

    this._retried = 0 // 失败后，已重新尝试的次数
    this._retry = config.retry // 失败重试次数
    this._chunkArr = this._splitFile(file, this.chunkSize, this.chunkCount) // 分片数组
    this._formDataKey = config.formDataKey // FormData使用的key
    this._triggerEvent = triggerEvent // 上传进度事件触发
    this._beforeUpload = config.beforeUpload // 发送上传请求前
    this._createHash = config.createHash // 传入的生成文件hash值方法
    this._xhr = null // js原生请求实例

    this._controlPromise = new ClassControlPromise()
  }

  // 暂停上传
  pause () {
    if (this.status === 'hash') {
      this._controlPromise.reject('control-pormise-reject')
    } else if (this._xhr) {
      this._xhr.abort()
      this._xhr = null
    }
    this.setStatus('pause')
  }

  // 移除文件
  remove () {
    if (this.status === 'hash') {
      this._controlPromise.reject('control-pormise-reject')
    } else if (this._xhr) {
      this._xhr.abort()
      this._xhr = null
    } else {
      this._triggerEvent({
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
      this._triggerEvent({
        type: 'hash',
        file: this
      })
      this._controlPromise.init()
      const p = this.hash ? Promise.resolve(this.hash) : Promise.race([this._initHash(), this._controlPromise.p])
      p.then((hash) => {
        this.hash = hash
        this.setStatus('uping')
        this._triggerEvent({
          type: 'uping',
          file: this,
          value: this.chunkSendedCount / this.chunkCount
        })
        return this._sendUpload(server)
      }).then((response) => {
        this.setStatus('success')
        resolve(response)
      }).catch((er) => {
        reject(er)
      })
    })
  }

  // 上传
  _sendUpload (server) {
    const formData = new FormData()
    formData.append(this._formDataKey.file, this._chunkArr[this.chunkSendedCount], this.file.name)
    formData.append(this._formDataKey.hash, this.hash)
    formData.append(this._formDataKey.chunk, this.chunkSendedCount)
    formData.append(this._formDataKey.chunks, this.chunkCount)
    formData.append(this._formDataKey.splitSize, this.chunkSize)
    formData.append(this._formDataKey.name, this.file.name)
    return this._ajaxRequest(server, formData).then((response) => {
      this.chunkSendedCount++
      this._retried = 0
      this._triggerEvent({
        type: 'uping',
        file: this,
        value: this.chunkSendedCount / this.chunkCount
      })
      if (this.chunkSendedCount < this.chunkCount) {
        return Promise.resolve().then(() => this._sendUpload(server))
      } else {
        this.response = response
        this._xhr = null
        return Promise.resolve(response)
      }
    })
  }

  // 文件切片
  _splitFile (file, size, count) {
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
  _ajaxRequest (server, formData) {
    return new Promise((resolve, reject) => {
      this._xhr = new XMLHttpRequest()
      this._xhr.open('post', server, true)
      this._xhr.responseType = 'json'
      this._xhr.timeout = 0
      this._xhr.withCredentials = false
      if (this._beforeUpload) this._beforeUpload(this, formData, this._xhr)
      this._xhr.onreadystatechange = () => {
        if (this._xhr.readyState === 4) {
          if (this._xhr.status === 200) {
            resolve(this._xhr.response)
          } else if (this._xhr.status !== 0) {
            reject(new Error(this._xhr.statusText))
          }
        }
      }
      this._xhr.onabort = () => reject(new Error('abort'))
      this._xhr.ontimeout = () => reject(new Error('timeout'))
      this._xhr.onerror = () => reject(new Error('error'))
      this._xhr.send(formData)
    })
  }

  // 生成文件hash值
  _initHash () {
    if (this._createHash) {
      return this._createHash(this.file)
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
