import ClassControlPromise from './class-control-promise.js'

// 自定义内部promise中reject的值
const errorAbort = 'error-abort' // 请求取消
const errorTimeout = 'error-timeout' // 请求超时
const errorMaxRetry = 'error-maxretry' // 超过最大失败次数

class FileObj {
  constructor (file, uniqueNum, chunkSize, server, maxAjaxParallel, formDataKey, maxRetry, triggerEvent) {
    this.file = file // 原生文件对象
    this.id = 'file_' + uniqueNum // 文件唯一标识
    this.status = 'queue' // 状态（queue待上传，wait等待上传队列，hash生成哈希值中，uping上传中，pause上传暂停，success上传成功，error上传失败，remove即将从fileList中移除）
    this.hash = '' // 唯一哈希值

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

    this._controlPromise = new ClassControlPromise(() => {
      this._fetchList.splice(this._fetchList.indexOf(this._controlPromise.p), 1)
    })
  }

  // 上传文件
  _start () {
    return Promise.resolve().then(() => {
      return this._triggerEvent({
        type: 'beforeHash',
        file: this
      })
      // console.log('event-beforeHash')
    }).then(() => {
      this._setStatus('hash')
      this._controlPromise.resolve()
      this._controlPromise.init()
      return this.hash ? this.hash : Promise.race([this._initHash(), this._controlPromise.p])
    }).then((hash) => {
      this.hash = hash
      return this._triggerEvent({
        type: 'beforeUpFile',
        file: this,
        hash: this.hash
      })
      // console.log('event-beforeUpFile')
    }).then(() => {
      this._setStatus('uping')
      this._initQueue()
      this._controlPromise.resolve()
      this._controlPromise.init()
      this._fetchList.push(this._controlPromise.p)
      return this._runFetch()
    }).then(() => {
      this._setStatus('success')
      return this._triggerEvent({
        type: 'success',
        file: this,
        response: this.chunkResponse
      })
      // console.log('event-success')
    }).catch((er) => {
      this._resetAfterError() // 失败后重置文件相关变量
      this._setStatus('error')
      return this._triggerEvent({
        type: 'error',
        file: this,
        er: er
      })
      // console.log('event-error')
    }).finally(() => {
      return Promise.resolve()
    })
  }

  // 取消上传
  _abort () {
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

  // 失败后重置文件相关变量
  _resetAfterError () {
    this._retried = 0
    this._queueList = []
    this._fetchList = []
    this._xhr = []
  }

  // 分片ajax请求
  _ajaxRequest (chunk) {
    const index = this._chunkArr.indexOf(chunk)
    const formData = new FormData()
    formData.append(this._formDataKey.file, chunk, this.file.name)
    formData.append(this._formDataKey.hash, this.hash)
    formData.append(this._formDataKey.chunk, index)
    formData.append(this._formDataKey.chunks, this.chunkCount)
    formData.append(this._formDataKey.splitSize, this.chunkSize)
    formData.append(this._formDataKey.name, this.file.name)
    this._xhr[index] = new XMLHttpRequest()
    this._xhr[index].open('post', this._server, true)
    this._xhr[index].responseType = 'json'
    this._xhr[index].timeout = 0
    this._xhr[index].withCredentials = false
    // console.log('event-beforeUpChunk')
    return this._triggerEvent({
      type: 'beforeUpChunk',
      file: this,
      chunkIndex: index,
      chunk: chunk,
      formData: formData,
      xhr: this._xhr[index]
    }).then(() => {
      return new Promise((resolve, reject) => {
        this._xhr[index].onreadystatechange = () => {
          if (this._xhr[index].readyState === 4) {
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
        // 这里永远不会进，当长度为1时就已resolve了
        return Promise.resolve()
      } else if (this._fetchList.length === 1) {
        // 只剩一个自定义控制的promise
        this._controlPromise.resolve()
        return Promise.resolve()
      } else {
        return Promise.race(this._fetchList).finally(() => this._runFetch())
      }
    } else {
      // _fetchList中有个固定的_controlPromise，需要-1
      if (this._fetchList.length - 1 < this._maxAjaxParallel) {
        const oneChunk = this._queueList.shift()
        const oneRequest = this._ajaxRequest(oneChunk).then((response) => {
          // 某分片上传成功
          const index = this._chunkArr.indexOf(oneChunk)
          this._retried = 0
          this.sendedChunk.push(index)
          this.chunkResponse[index] = response
          this._fetchList.splice(this._fetchList.indexOf(oneRequest), 1)
          return this._triggerEvent({
            type: 'afterUpChunk',
            file: this,
            chunkIndex: index,
            chunk: oneChunk,
            progress: this.sendedChunk.length / this.chunkCount,
            response: response
          })
          // console.log('event-afterUpChunk')
        })
        this._fetchList.push(oneRequest)
        oneRequest.then(() => {
          // 分片上传回调执行完毕
        }).catch((er) => {
          const indexRequest = this._fetchList.indexOf(oneRequest)
          // 防止多次移除（但当分片上传成功，但afterUpChunk回调reject时，若不判断是否已移除，会导致移除_fetchList中的最后一个）
          if (indexRequest > -1) this._fetchList.splice(indexRequest, 1)
          // 请求错误或超时，可再次发起请求
          if (er === errorMaxRetry || er === errorTimeout) {
            // 某分片上传失败
            if (this._retried < this._maxRetry) {
              this._retried++
              this._queueList.unshift(oneChunk)
            } else { // 达到最大失败重试次数
              this._resetAfterError() // 失败后重置文件相关变量
              return Promise.reject(er)
            }
          } else {
            this._resetAfterError() // 失败后重置文件相关变量
            return Promise.reject(er)
          }
        })
        return Promise.resolve().then(() => this._runFetch())
      } else {
        return Promise.race(this._fetchList).finally(() => this._runFetch())
      }
    }
  }
}

export default FileObj
