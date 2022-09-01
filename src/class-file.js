import ClassControlPromise from './class-control-promise.js'

// 自定义内部promise中reject的值
const errorAbort = Symbol('error-abort') // 请求取消
const errorTimeout = Symbol('error-timeout') // 请求超时
const errorMaxRetry = Symbol('error-maxretry') // 超过最大失败次数

class FileObj {
  constructor (file, uniqueNum, chunkSize, server, maxAjaxParallel, formDataKey, maxRetry, triggerEvent, metaData) {
    this.file = file // 原生文件对象
    this.id = 'file_' + uniqueNum // 文件唯一标识
    if (file.name.lastIndexOf('.') > -1) {
      this.ext = file.name.substring(file.name.lastIndexOf('.') + 1)
    } else {
      this.ext = ''
    }
    /**
     * 状态
     * queue待上传
     * wait等待上传队列
     * hash生成哈希值中
     * uping上传中
     * pause上传暂停
     * success上传成功
     * error上传失败
     * remove即将移除
     */
    this.status = ''
    this.hash = '' // 唯一哈希值
    this.data = metaData // 自定义添加的变量

    this.chunkResponse = [] // 每一分片上传成功后的返回值
    this.chunkSize = chunkSize // 分片大小，若不分片则就是文件大小
    this.chunkCount = Math.ceil(file.size / chunkSize) // 分片数，若不分片则就是1
    this.sendedChunk = [] // 已上传的分片序号
    this._chunkArr = this._splitFile(file, this.chunkSize, this.chunkCount) // 分片数组

    this._formDataKey = formDataKey // FormData使用的key
    this._maxAjaxParallel = maxAjaxParallel // 最大同时上传分片数
    this._server = server // 上传接口
    this._xhr = [] // js原生请求实例
    this._retried = 0 // 失败后，已重新尝试的次数
    this._maxRetry = maxRetry // 单个文件最大连续失败重试次数
    this._triggerEvent = triggerEvent // 触发事件

    this._queueList = [] // 分片上传队列
    this._fetchList = [] // 正在上传的分片队列

    this._controlPromise = new ClassControlPromise()
  }

  // 上传文件
  _start () {
    this._controlPromise.init()
    return Promise.resolve().then(() => {
      return this._wrapControlPromise(this._triggerEvent({
        type: 'beforeHash',
        file: this
      }))
    }).then(() => {
      this._setStatus('hash')
      // 若hash不存在，则生成随机值作为hash值
      return (this.hash || this.hash === 0) ? this.hash : this._initHash()
    }).then((hash) => {
      this.hash = hash
      return this._wrapControlPromise(this._triggerEvent({
        type: 'beforeUpFile',
        file: this
      }))
    }).then(() => {
      this._setStatus('uping')
      this._initQueue()
      return this._wrapControlPromise(this._runFetch())
    }).then(() => {
      this._setStatus('success')
      return this._triggerEvent({
        type: 'success',
        file: this,
        response: this.chunkResponse
      })
    }).catch((er) => {
      this._resetVariable() // 失败后重置文件相关变量
      if (['pause', 'remove'].indexOf(this.status) === -1) {
        this._setStatus('error')
        return this._triggerEvent({
          type: 'error',
          file: this,
          er: this._symbolToValue(er)
        })
      }
    }).finally(() => {
      return Promise.resolve()
    })
  }

  // 取消上传
  _abort (fileQueue) {
    Promise.resolve().then(() => {
      return this._triggerEvent({
        type: 'beforePause',
        file: this
      })
    }).then(() => {
      const queueIndex = fileQueue.indexOf(this)
      if (queueIndex === -1) { // 已调用File_start方法
        this._controlPromise.reject(errorAbort)
        if (this.status === 'uping') {
          // 中止正在的请求
          for (let i = 0; i < this._xhr.length; i++) {
            if (this._xhr[i]) {
              this._xhr[i].abort()
            }
          }
        }
      } else { // 还在队列中，未开始上传，即未调用File._start方法
        fileQueue.splice(queueIndex, 1)
      }
      this._setStatus('pause')
      return this._triggerEvent({
        type: 'afterPause',
        file: this
      })
    }).catch((er) => {
      // console.log(er)
      // beforePause事件reject表示不需要暂停，afterPause事件reject无任何意义
    })
  }

  // 移除
  _remove (fileQueue, fileList) {
    Promise.resolve().then(() => {
      return this._triggerEvent({
        type: 'beforeRemove',
        file: this
      })
    }).then(() => {
      const queueIndex = fileQueue.indexOf(this)
      if (queueIndex === -1) { // 已调用File_start方法
        this._controlPromise.reject(errorAbort)
        if (this.status === 'uping') {
          // 中止正在的请求
          for (let i = 0; i < this._xhr.length; i++) {
            if (this._xhr[i]) {
              this._xhr[i].abort()
            }
          }
        }
      } else { // 还在队列中，未开始上传，即未调用File._start方法
        fileQueue.splice(queueIndex, 1)
      }
      const listIndex = fileList.indexOf(this)
      if (listIndex > -1) {
        fileList.splice(listIndex, 1)
      }
      this._setStatus('remove')
      return this._triggerEvent({
        type: 'afterRemove',
        file: this
      })
    }).catch((er) => {
      // console.log(er)
      // beforeRemove事件reject表示不需要移除，afterRemove事件reject无任何意义
    })
  }

  // 设置文件状态
  _setStatus (value) {
    this.status = value
  }

  // Symbol转为值
  _symbolToValue (value) {
    if (value === errorAbort) {
      return 'error-abort' // 取消，不会进入error回调
    } else if (value === errorTimeout) {
      return 'error-timeout'
    } else if (value === errorMaxRetry) {
      return 'error-maxretry'
    } else {
      return value
    }
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

  // 失败后重置文件相关变量
  _resetVariable () {
    this._retried = 0
    this._queueList = []
    this._fetchList = []
    // 中止正在的请求
    for (let i = 0; i < this._xhr.length; i++) {
      if (this._xhr[i]) this._xhr[i].abort()
    }
    this._xhr = []
  }

  // 包装成一个可手动resolve或reject的promise
  _wrapControlPromise (value) {
    return Promise.race([
      value,
      this._controlPromise._p
    ])
  }

  // 分片ajax请求
  _ajaxRequest (chunk) {
    const index = this._chunkArr.indexOf(chunk)
    const formDataObj = {
      [this._formDataKey.file]: chunk,
      [this._formDataKey.hash]: this.hash,
      [this._formDataKey.chunk]: index,
      [this._formDataKey.chunks]: this.chunkCount,
      [this._formDataKey.splitSize]: this.chunkSize,
      [this._formDataKey.name]: this.file.name
    }
    const headersObj = {}
    const oneRequest = this._wrapControlPromise(this._triggerEvent({
      type: 'beforeUpChunk',
      file: this,
      chunkIndex: index,
      chunk: chunk,
      formData: formDataObj,
      headers: headersObj
    })).then(() => {
      return new Promise((resolve, reject) => {
        // FormData参数
        const formData = new FormData()
        this._setFormData(formData, formDataObj)
        // xhr请求
        this._xhr[index] = new XMLHttpRequest()
        this._xhr[index].open('post', this._server, true)
        this._xhr[index].responseType = 'json'
        this._xhr[index].timeout = 0
        this._xhr[index].withCredentials = false
        // xhr请求自定义头部
        this._setRequestHeaders(this._xhr[index], headersObj)
        this._xhr[index].onreadystatechange = () => {
          if (this._xhr[index] && this._xhr[index].readyState === 4) {
            if (this._xhr[index].status === 200) {
              resolve(this._xhr[index].response)
            } else if (this._xhr[index].status !== 0) {
              reject(errorMaxRetry) // promise返回最内层错误，无论是否达到报错就直接返回最大重试
            }
          }
        }
        this._xhr[index].onabort = () => reject(errorAbort)
        this._xhr[index].ontimeout = () => reject(errorTimeout)
        this._xhr[index].onerror = () => reject(errorMaxRetry) // promise返回最内层错误，无论是否达到报错就直接返回最大重试
        this._xhr[index].send(formData)
      })
    }).then((response) => {
      // 某分片上传成功
      const requestIndex = this._fetchList.indexOf(oneRequest)
      if (requestIndex > -1) { // 多线同时上传，某片失败会导致其它片继续上传进入回调，但_fetchList已重置为[]
        this._fetchList.splice(requestIndex, 1)
        this.sendedChunk.push(index)
        this.chunkResponse[index] = response
        this._retried = 0
        return this._wrapControlPromise(this._triggerEvent({
          type: 'afterUpChunk',
          file: this,
          chunkIndex: index,
          chunk: chunk,
          progress: this.sendedChunk.length / this.chunkCount,
          response: response
        })).catch(() => {
          // 捕获错误，防止进入外层catch
        })
      }
    }).catch((er) => {
      // 某分片上传失败
      const requestIndex = this._fetchList.indexOf(oneRequest)
      if (requestIndex > -1) { // 多线同时上传，某片失败会导致其它片继续上传进入回调，但_fetchList已重置为[]
        this._fetchList.splice(requestIndex, 1)
        if (er === errorMaxRetry || er === errorTimeout) { // 请求错误或超时，可再次发起请求
          // 某分片上传失败
          if (this._retried < this._maxRetry) {
            this._retried++
            this._queueList.unshift(chunk)
          } else { // 达到最大失败重试次数
            this._resetVariable() // 失败后重置文件相关变量
            return Promise.reject(er)
          }
        } else if (er === errorAbort) { // 取消
          this._resetVariable() // 失败后重置文件相关变量
          return Promise.reject(er)
        } else { // beforeUpChunk被reject，表示跳过此分片
          this.sendedChunk.push(index)
        }
      }
    })
    return oneRequest
  }

  // 设置FormData
  _setFormData (formData, value) {
    for (const key in value) {
      if (key === this._formDataKey.file) {
        formData.append(key, value[key], this.file.name)
      } else {
        formData.append(key, value[key])
      }
    }
  }

  // 设置Request-Headers
  _setRequestHeaders (xhr, value) {
    for (const key in value) {
      xhr.setRequestHeader(key, value[key])
    }
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
      if (this._fetchList.length < this._maxAjaxParallel) {
        const oneChunk = this._queueList.shift()
        const oneRequest = this._ajaxRequest(oneChunk)
        this._fetchList.push(oneRequest)
        return this._runFetch()
      } else {
        return Promise.race(this._fetchList).finally(() => this._runFetch())
      }
    }
  }
}

export default FileObj
