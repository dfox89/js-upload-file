import ClassFile from './class-file.js'
import ClassControlPromise from './class-control-promise.js'
import ClassEvent from './class-event.js'

// 默认配置
const defaultOpts = {
  server: null, // 上传接口
  chunked: false, // 是否分片
  chunkSize: 1 * 1024 * 1024, // 分片大小
  maxParallel: 3, // 最大同时上传文件数
  retry: 0, // 失败重试次数
  formDataKey: { // FormData使用的key
    file: 'file',
    hash: 'hash',
    chunk: 'chunk',
    chunks: 'chunks',
    splitSize: 'splitSize',
    name: 'name'
  },
  createHash: null, // 生成文件hash值
  beforeUpload: () => {}, // 发送上传请求前
  uploadCallback: () => {} // 上传事件回调
}

class Upload {
  constructor (opts) {
    this.isUploading = false // 是否正在上传
    this.fileList = [] // 文件列表

    this._uniqueNum = 0 // 用于生成文件唯一标识，此值用于文件开始暂停等传入辨别是哪个文件
    this._fetchList = [] // 上传队列
    this._fetchedIndex = 0 // 已处理到上传队列的序号
    this._config = {}
    for (const key in defaultOpts) {
      if (key === 'formDataKey' && opts[key]) {
        this._config[key] = defaultOpts[key]
        for (const subkey in this._config[key]) {
          this._config[key][subkey] = opts[key][subkey] || this._config[key][subkey]
        }
      } else {
        this._config[key] = opts[key] || defaultOpts[key]
      }
    }

    this._eventObj = new ClassEvent()
    this._controlPromise = new ClassControlPromise(() => {
      this._fetchList.splice(this._fetchList.indexOf(this._controlPromise.p), 1)
    })
  }

  // 绑定事件监听
  on (value, callback) {
    this._eventObj.on(value, callback)
  }

  // 触发事件
  _triggerEvent (obj) {
    if (this._config.uploadCallback) this._config.uploadCallback(obj)
    this._eventObj.trigger(obj.type, obj)
  }

  // 添加文件到上传队列
  addFile (value, meta = {}) {
    for (let i = 0; i < value.length; i++) {
      const oneFile = new ClassFile(
        value[i],
        this._triggerEvent.bind(this),
        this._config,
        this._uniqueNum,
        this._deepCopy(meta)
      )
      this.fileList.push(oneFile)
      this._triggerEvent({
        type: 'queue',
        file: oneFile
      })
      this._uniqueNum++
    }
  }

  // 开始上传
  start (value) {
    if (this.fileList.length === 0) return
    this.isUploading = true

    this._initWaitFileAndIndex(value)

    if (this._fetchList.length - 1 < this._config.maxParallel) {
      this._controlPromise.resolve()
      this._controlPromise.init()
      this._fetchList.push(this._controlPromise.p)

      if (this._fetchList.length === 1) {
        this._toFetch().then(() => {
          this.isUploading = false
          this._triggerEvent({
            type: 'finish'
          })
        })
      }
    }
  }

  // 暂停上传
  pause (value) {
    const statusArr = ['wait', 'hash', 'uping'] // 这些状态的文件才会设置为pause
    if (value) {
      if (Object.prototype.toString.call(value) !== '[object Array]') value = [value]
      for (let i = 0; i < value.length; i++) {
        const oneFile = this._findFileObj(value[i])
        if (statusArr.indexOf(oneFile.status) > -1) oneFile.pause()
      }
    } else {
      for (let i = 0; i < this.fileList.length; i++) {
        const oneFile = this.fileList[i]
        if (statusArr.indexOf(oneFile.status) > -1) oneFile.pause()
      }
    }
  }

  // 移除文件
  remove (value) {
    if (value) {
      if (Object.prototype.toString.call(value) !== '[object Array]') value = [value]
      for (let i = 0; i < value.length; i++) {
        const oneFile = this._findFileObj(value[i])
        this.fileList.splice(this.fileList.indexOf(oneFile), 1)
        oneFile.remove()
      }
      this._fetchedIndex = this._fetchedIndex > value.length ? this._fetchedIndex - value.length : 0
    } else {
      for (let i = 0; i < this.fileList.length; i++) {
        this.fileList[i].remove()
      }
      this._fetchedIndex = 0
      this.fileList = []
    }
  }

  // 设置需要上传的文件status为wait，及index
  _initWaitFileAndIndex (value) {
    const statusArr = ['queue', 'pause', 'error'] // 这些状态的文件才会设置为wait
    if (value) {
      if (Object.prototype.toString.call(value) !== '[object Array]') value = [value]
      for (let i = 0; i < value.length; i++) {
        const oneFile = this._findFileObj(value[i])
        if (statusArr.indexOf(oneFile.status) > -1) {
          oneFile.setStatus('wait')
          this._fetchedIndex = Math.min(this._fetchedIndex, this.fileList.indexOf(oneFile))
        }
      }
    } else {
      this._fetchedIndex = 0
      for (let i = this._fetchedIndex; i < this.fileList.length; i++) {
        const oneFile = this.fileList[i]
        if (statusArr.indexOf(oneFile.status) > -1) oneFile.setStatus('wait')
      }
    }
  }

  // 加入上传队列
  _toFetch () {
    // 所有文件均已发送请求
    if (this._fetchedIndex === this.fileList.length) {
      if (this._fetchList.length > 1) {
        return Promise.race(this._fetchList).then(() => this._toFetch()).catch(() => this._toFetch())
      } else if (this._fetchList.length === 1) {
        this._controlPromise.resolve()
        return Promise.resolve()
      } else {
        return Promise.resolve()
      }
    }
    const oneFile = this.fileList[this._fetchedIndex]
    // 除等待中的上传文件，其余跳过
    if (oneFile.status !== 'wait') {
      this._fetchedIndex++
      return Promise.resolve().then(() => this._toFetch())
    }
    // 单个文件上传
    const oneRequest = oneFile.start(this._config.server)
    this._fetchList.push(oneRequest)
    oneRequest.then((response) => {
      this._fetchList.splice(this._fetchList.indexOf(oneRequest), 1)
      oneFile._retried = 0
      this._triggerEvent({
        type: 'success',
        file: oneFile,
        value: response
      })
    }).catch((er) => {
      this._fetchList.splice(this._fetchList.indexOf(oneRequest), 1)
      if (oneFile.status === 'remove') {
        oneFile._retried = 0
        this._triggerEvent({
          type: 'remove',
          file: oneFile
        })
      } else {
        if (er && er.message === 'abort') {
          oneFile._retried = 0
          this._triggerEvent({
            type: 'pause',
            file: oneFile
          })
        } else if (er && er.message === 'control-pormise-reject') {
          oneFile._retried = 0
          this._triggerEvent({
            type: 'pause',
            file: oneFile
          })
        } else {
          oneFile.setStatus('error')
          if (oneFile._retried < oneFile._retry) {
            oneFile._retried++
            // 失败重试
            this._initWaitFileAndIndex([oneFile])
          } else {
            oneFile._retried = 0
            this._triggerEvent({
              type: 'error',
              file: oneFile,
              value: er
            })
          }
        }
      }
    })
    this._fetchedIndex++
    // 继续处理
    if (this._fetchList.length - 1 >= this._config.maxParallel) {
      return Promise.race(this._fetchList).then(() => this._toFetch()).catch(() => this._toFetch())
    } else {
      return Promise.resolve().then(() => this._toFetch())
    }
  }

  // 根据传入值（可能为id或File实例），返回对应的File实例
  _findFileObj (value) {
    if (typeof value === 'string') { // 传入File实例的id
      for (let i = 0; i < this.fileList.length; i++) {
        if (this.fileList[i].id === value) return this.fileList[i]
      }
      return null // 未找到
    } else { // 传入的就是File实例
      return value
    }
  }

  // 深拷贝
  _deepCopy (obj) {
    const back = obj instanceof Array ? [] : {}
    for (const key in obj) {
      const objType = Object.prototype.toString.call(obj[key])
      if (objType === '[object Object]' || objType === '[object Array]') {
        back[key] = this._deepCopy(obj[key])
      } else {
        back[key] = obj[key]
      }
    }
    return back
  }
}

export default Upload
