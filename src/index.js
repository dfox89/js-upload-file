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
  maxAjaxParallel: 1, // 单个文件最大同时上传分片数
  maxRetry: 0, // 单个文件最大连续失败重试次数
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
    this.isAdding = false // 是否正在添加文件

    this._config = this._extendConfig(defaultOpts, opts)
    this._uniqueNum = 0 // 用于生成文件唯一标识，此值用于文件开始暂停等传入辨别是哪个文件

    this._addQueueCount = 0 // 添加文件队列数
    this._queueList = [] // 文件上传队列
    this._fetchList = [] // 正在上传的文件队列

    this._eventObj = new ClassEvent()
    this._controlPromise = new ClassControlPromise()

    // 初始化文件到队列
    if (opts.file && opts.file.length > 0) this.addFile(opts.file)
  }

  // 添加文件到上传队列
  addFile (value, metaData = {}) {
    // 待优化，现必须是数组
    this.isAdding = true
    this._addQueueCount++
    this._addFetch(value, metaData).then((newAdded) => {
      this._triggerEvent({
        type: 'addFinish',
        file: newAdded
      }).then(() => {
        this._dealAfterAddFinish()
        // 新添加的文件自动上传
        if (this._config.auto) {
          this.start(newAdded)
        }
      }).catch(() => {
        this._dealAfterAddFinish()
        // reject不执行自动上传
      })
    })
  }

  // addFinish事件后的处理
  _dealAfterAddFinish () {
    this._addQueueCount--
    if (this._addQueueCount === 0) {
      this.isAdding = false
    }
  }

  // 开始上传
  start (value) {
    this._initQueue(value) // 初始化文件上传队列
    if (this._queueList.length === 0) return
    if (this.isUploading) {
      this._controlPromise.resolve(() => {
        const index = this._fetchList.indexOf(this._controlPromise._p)
        if (index > -1) this._fetchList.splice(index, 1)
      })
      this._controlPromise.init()
      this._fetchList.push(this._controlPromise._p)
    } else { // 未在上传，则开始上传队列
      this.isUploading = true
      this._controlPromise.init()
      this._fetchList.push(this._controlPromise._p)
      this._runFetch().then(() => {
        this.isUploading = false
        return this._triggerEvent({
          type: 'finish'
        })
      })
    }
  }

  // 暂停上传
  pause (value) {
    const statusArr = ['wait', 'hash', 'uping'] // 这些状态的文件才会设置为pause
    if (value && Object.prototype.toString.call(value) !== '[object Array]') {
      value = [value]
    }
    const toDealFile = value || this.fileList
    for (let i = 0; i < toDealFile.length; i++) {
      const oneFile = this._findFileObj(toDealFile[i])
      if (oneFile && statusArr.indexOf(oneFile.status) > -1) {
        oneFile._abort(this._queueList)
      }
    }
  }

  // 移除上传
  remove (value) {
    if (value && Object.prototype.toString.call(value) !== '[object Array]') {
      value = [value]
    }
    const toDealFile = value || this.fileList
    for (let i = 0; i < toDealFile.length; i++) {
      const oneFile = this._findFileObj(toDealFile[i])
      if (oneFile) {
        oneFile._remove(this._queueList, this.fileList)
      }
    }
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
        return Promise.resolve()
      } else if (this._fetchList.length === 1) {
        // 只剩一个自定义控制的promise
        this._fetchList = []
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
        return Promise.resolve().then(() => this._runFetch())
      } else {
        return Promise.race(this._fetchList).finally(() => this._runFetch())
      }
    }
  }

  // 添加文件
  _addFile (fileObj, newAdded, metaData) {
    const oneFile = new ClassFile(
      fileObj,
      this._uniqueNum,
      this._config.chunked ? this._config.chunkSize : fileObj.size,
      this._config.server,
      this._config.maxAjaxParallel,
      this._config.formDataKey,
      this._config.maxRetry,
      this._triggerEvent.bind(this),
      this._deepCopy(metaData)
    )
    this._uniqueNum++
    return Promise.resolve().then(() => {
      return this._triggerEvent({
        type: 'beforeAdd',
        file: oneFile
      })
    }).then(() => {
      oneFile._setStatus('queue')
      this.fileList.push(oneFile)
      newAdded.push(oneFile)
      return this._triggerEvent({
        type: 'afterAdd',
        file: oneFile
      }).finally(() => {
        return Promise.resolve()
      })
    })
  }

  // 文件添加队列
  _addFetch (value, metaData) {
    const newAdded = []
    const allAddPromise = []
    for (let i = 0; i < value.length; i++) {
      allAddPromise.push(this._addFile(value[i], newAdded, metaData))
    }
    return Promise.all(allAddPromise).then(() => Promise.resolve(newAdded)).catch(() => Promise.resolve(newAdded))
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
