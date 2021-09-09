class FileObj {
  constructor (file, uniqueNum, chunkSize, server, maxAjaxParallel, formDataKey, maxRetry) {
    this.file = file // 原生文件对象
    this.id = 'file_' + uniqueNum // 文件唯一标识
    this.status = 'queue' // 状态（queue待上传，wait等待上传队列，hash生成哈希值中，uping上传中，pause上传暂停，success上传成功，error上传失败，remove即将从fileList中移除）
    this.hash = '' // 唯一哈希值
    this.response = null // 文件上传成功，后台返回值

    this.chunkSize = chunkSize // 分片大小，若不分片则就是文件大小
    this.chunkCount = Math.ceil(file.size / chunkSize) // 分片数，若不分片则就是1
    this.sendedChunk = [] // 已上传的分片序号
    this._chunkArr = this._splitFile(file, this.chunkSize, this.chunkCount) // 分片数组

    this._formDataKey = formDataKey // FormData使用的key
    this._maxAjaxParallel = maxAjaxParallel // 最大同时上传分片数
    this._server = server // 上传接口
    this._xhr = null // js原生请求实例
    this._retried = 0 // 失败后，已重新尝试的次数
    this._maxRetry = maxRetry

    this._queueList = [] // 分片上传队列
    this._fetchList = [] // 正在上传的分片队列
  }

  // 上传文件
  _start () {
    return Promise.resolve().then(() => {
      console.log('event-beforeHash')
      this._setStatus('hash')
      return this.hash ? this.hash : this._initHash()
    }).then((hash) => {
      this.hash = hash
      console.log('event-beforeUpFile')
      this._setStatus('uping')
      this._initQueue()
      return this._runFetch()
    }).then(() => {
      this._setStatus('success')
      console.log('event-success')
    }).catch(() => {
      // 失败后重置相关变量
      this._retried = 0
      this._queueList = []
      this._fetchList = []
      this._setStatus('error')
      console.log('event-error')
    }).finally(() => {
      return Promise.resolve()
    })
  }

  // 设置文件状态
  _setStatus (value) {
    this.status = value
  }

  // 生成文件hash值
  _initHash () {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, () => {
      const random = Math.floor(Math.random() * 16) // 生成0-15随机整数
      return random.toString(16)
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

  // 分片ajax请求
  _ajaxRequest (chunk) {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append(this._formDataKey.file, chunk, this.file.name)
      formData.append(this._formDataKey.hash, this.hash)
      formData.append(this._formDataKey.chunk, this._chunkArr.indexOf(chunk))
      formData.append(this._formDataKey.chunks, this.chunkCount)
      formData.append(this._formDataKey.splitSize, this.chunkSize)
      formData.append(this._formDataKey.name, this.file.name)

      this._xhr = new XMLHttpRequest()
      this._xhr.open('post', this._server, true)
      this._xhr.responseType = 'json'
      this._xhr.timeout = 0
      this._xhr.withCredentials = false
      this._xhr.onreadystatechange = () => {
        if (this._xhr.readyState === 4) {
          if (this._xhr.status === 200) {
            resolve(this._xhr.response)
          } else if (this._xhr.status !== 0) {
            reject(new Error(this._xhr.statusText))
          }
        }
      }
      /* this._xhr.onabort = () => reject(new Error('abort'))
      this._xhr.ontimeout = () => reject(new Error('timeout'))
      this._xhr.onerror = () => reject(new Error('error')) */
      console.log('event-beforeUpChunk')
      this._xhr.send(formData)
    })
  }

  // 初始化分片上传队列
  _initQueue () {
    for (let i = 0; i < this._chunkArr.length; i++) {
      if (this.sendedChunk.indexOf(i) === -1) {
        this._queueList.push(this._chunkArr[i])
      }
    }
  }

  // 开始分片上传队列
  _runFetch () {
    if (this._queueList.length === 0) { // 所有分片均已发送请求
      if (this._fetchList.length === 0) {
        return Promise.resolve()
      } else {
        return Promise.race(this._fetchList).finally(() => this._runFetch())
      }
    } else {
      const oneChunk = this._queueList.shift()
      const oneRequest = this._ajaxRequest(oneChunk)
      this._fetchList.push(oneRequest)
      oneRequest.then(() => {
        // 某分片上传成功
        this._retried = 0
        this.sendedChunk.push(this._chunkArr.indexOf(oneChunk))
        this._fetchList.splice(this._fetchList.indexOf(oneRequest), 1)
        console.log('event-afterUpChunk')
      }).catch(() => {
        this._fetchList.splice(this._fetchList.indexOf(oneRequest), 1)
        // 某分片上传失败
        if (this._retried < this._maxRetry) {
          this._retried++
          this._queueList.unshift(oneChunk)
        } else { // 达到最大失败重试次数
          return Promise.reject(new Error())
        }
      })
      if (this._fetchList.length < this._maxAjaxParallel) {
        return Promise.resolve().then(() => this._runFetch())
      } else {
        return Promise.race(this._fetchList).finally(() => this._runFetch())
      }
    }
  }
}

export default FileObj
