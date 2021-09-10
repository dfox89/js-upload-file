import ClassFile from './class-file.js'
import ClassEvent from './class-event.js'
import ClassControlPromise from './class-control-promise.js'

// 默认配置
const defaultOpts = {
  server: null, // 上传接口
  auto: false, // 新添加的文件是否自动上传（之前添加的暂停/错误的文件不会自动再次尝试上传）
  // file: [], // 初始化就加入上传的文件
  chunked: false, // 是否分片
  chunkSize: 1 * 1024 * 1024, // 分片大小
  maxFileParallel: 3, // 最大同时上传文件数
  maxAjaxParallel: 2, // 单个文件最大同时上传分片数
  maxRetry: 0, // 失败重试次数
  formDataKey: { // FormData使用的key
    file: 'file',
    hash: 'hash',
    chunk: 'chunk',
    chunks: 'chunks',
    splitSize: 'splitSize',
    name: 'name'
  }
}

class Upload {
  constructor (opts) {
    this.isUploading = false // 是否正在上传
    this.fileList = [] // 文件列表

    this._config = this._extendConfig(defaultOpts, opts)
    this._uniqueNum = 0 // 用于生成文件唯一标识，此值用于文件开始暂停等传入辨别是哪个文件

    this._newAdded = [] // 新增加的文件
    this._addQueusList = [] // 文件添加队列
    this._queueList = [] // 文件上传队列
    this._fetchList = [] // 正在上传的文件队列

    this._eventObj = new ClassEvent()
    this._controlPromise = new ClassControlPromise(() => {
      this._fetchList.splice(this._fetchList.indexOf(this._controlPromise.p), 1)
    })

    // 初始化文件到队列
    if (opts.file && opts.file.length > 0) this.addFile(opts.file)
  }

  // 添加文件到上传队列
  addFile (value) {
    // 待优化，现必须是数组
    if (this._addQueusList.length === 0) {
      this._addQueusList.push(...value)
      this._addFileFetch().then(() => {
        // 新添加的文件自动上传
        if (this._config.auto) {
          this.start(this._newAdded)
        }
        this._newAdded = []
      })
    } else {
      this._addQueusList.push(...value)
    }
  }

  // 开始上传
  start (value) {
    this._initQueue(value) // 初始化文件上传队列
    this._controlPromise.resolve()
    this._controlPromise.init()
    this._fetchList.push(this._controlPromise.p)
    // 未在上传，则开始上传队列
    if (!this.isUploading) {
      this.isUploading = true
      this._runFetch().then(() => {
        this.isUploading = false
        return this._triggerEvent({
          type: 'finish'
        })
        // console.log('event-finish')
      })
    }
  }

  // 暂停上传
  pause (value) {
  }

  // 移除上传
  remove (value) {
  }

  // 事件监听
  on (eventName, eventCallback) {
    this._eventObj.on(eventName, eventCallback)
  }

  // 触发事件
  _triggerEvent (obj) {
    return this._eventObj.trigger(obj.type, obj)
  }

  // 合并初始化配置
  _extendConfig (defaultConfig, diyConfig) {
    const combined = {}
    for (const key in defaultConfig) {
      if (key === 'formDataKey' && diyConfig[key]) {
        combined[key] = defaultConfig[key]
        for (const subkey in combined[key]) {
          combined[key][subkey] = diyConfig[key][subkey] || combined[key][subkey]
        }
      } else {
        combined[key] = diyConfig[key] || defaultConfig[key]
      }
    }
    return combined
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

  // 初始化文件上传队列
  _initQueue (value) {
    const statusArr = ['queue', 'pause', 'error'] // 这些状态的文件才会加入上传队列，并且设置状态为wait
    if (value && Object.prototype.toString.call(value) !== '[object Array]') {
      value = [value]
    }
    const toDealFile = value || this.fileList
    for (let i = 0; i < toDealFile.length; i++) {
      const oneFile = this._findFileObj(toDealFile[i])
      if (oneFile && statusArr.indexOf(oneFile.status) > -1) {
        oneFile._setStatus('wait')
        this._queueList.push(oneFile)
      }
    }
  }

  // 开始文件上传队列
  _runFetch () {
    if (this._queueList.length === 0) { // 所有文件均已发送请求
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
      if (this._fetchList.length - 1 < this._config.maxFileParallel) { // 未到最大同时上传文件数
        const oneFile = this._queueList.shift()
        const oneRequest = oneFile._start()
        this._fetchList.push(oneRequest)
        oneRequest.finally(() => {
          // 某文件上传完成，无论成功失败
          this._fetchList.splice(this._fetchList.indexOf(oneRequest), 1)
        })
        // _fetchList中有个固定的_controlPromise，需要-1
        if (this._fetchList.length - 1 < this._config.maxFileParallel) {
          return Promise.resolve().then(() => this._runFetch())
        } else {
          return Promise.race(this._fetchList).finally(() => this._runFetch())
        }
      } else {
        return Promise.race(this._fetchList).finally(() => this._runFetch())
      }
    }
  }

  // 文件添加队列
  _addFileFetch () {
    if (this._addQueusList.length === 0) {
      return Promise.resolve()
    } else {
      const oneAddFile = this._addQueusList.shift()
      const oneFile = new ClassFile(
        oneAddFile,
        this._uniqueNum,
        this._config.chunked ? this._config.chunkSize : oneAddFile.size,
        this._config.server,
        this._config.maxAjaxParallel,
        this._config.formDataKey,
        this._config.maxRetry,
        this._triggerEvent.bind(this)
      )
      return Promise.resolve().then(() => {
        return this._triggerEvent({
          type: 'beforeAdd',
          file: oneFile
        })
        // console.log('event-beforeAdd')
      }).then(() => {
        this.fileList.push(oneFile)
        this._newAdded.push(oneFile)
        this._uniqueNum++
        return this._triggerEvent({
          type: 'afterAdd',
          file: oneFile
        })
        // console.log('event-afterAdd')
      }).finally(() => {
        return this._addFileFetch()
      })
    }
  }
}

export default Upload
