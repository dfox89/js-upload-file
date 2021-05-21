import ClassFile from './class-file.js'
import ClassControlPromise from './class-control-promise.js'

// 默认配置
const defaultOpts = {
  server: null, // 上传接口
  chunked: false, // 是否分片
  chunkSize: 1 * 1024 * 1024, // 分片大小
  maxParallel: 3, // 最大同时上传文件数
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
    for (const key in defaultOpts) {
      if (key === 'formDataKey' && opts[key]) {
        this[key] = defaultOpts[key]
        for (const subkey in this[key]) {
          this[key][subkey] = opts[key][subkey] || this[key][subkey]
        }
      } else {
        this[key] = opts[key] || defaultOpts[key]
      }
    }
    this.isUploading = false // 是否正在上传
    this.fileList = [] // 文件列表
    this.fetchList = [] // 上传队列
    this.fetchedIndex = 0 // 已处理到上传队列的序号

    this.controlPromise = new ClassControlPromise(() => {
      this.fetchList.splice(this.fetchList.indexOf(this.controlPromise.p), 1)
    })
  }

  // 添加文件到上传队列
  addFile (value) {
    for (let i = 0; i < value.length; i++) {
      const oneFile = new ClassFile(value[i], this.formDataKey, this.chunked ? this.chunkSize : value[i].size, this.uploadCallback, this.beforeUpload, this.createHash)
      this.fileList.push(oneFile)
      this.uploadCallback({
        type: 'queue',
        file: oneFile
      })
    }
  }

  // 开始上传
  start (value) {
    if (this.fileList.length === 0) return
    this.isUploading = true

    this.initWaitFileAndIndex(value)

    if (this.fetchList.length - 1 < this.maxParallel) {
      this.controlPromise.resolve()
      this.controlPromise.init()
      this.fetchList.push(this.controlPromise.p)

      if (this.fetchList.length === 1) {
        this.toFetch().then(() => {
          this.isUploading = false
          this.uploadCallback({
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
      for (let i = 0; i < value.length; i++) {
        const oneFile = value[i]
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
      for (let i = 0; i < value.length; i++) {
        const oneFile = value[i]
        this.fileList.splice(this.fileList.indexOf(oneFile), 1)
        oneFile.remove()
      }
      this.fetchedIndex = this.fetchedIndex > value.length ? this.fetchedIndex - value.length : 0
    } else {
      for (let i = 0; i < this.fileList.length; i++) {
        this.fileList[i].remove()
      }
      this.fetchedIndex = 0
      this.fileList = []
    }
  }

  // 设置需要上传的文件status为wait，及index
  initWaitFileAndIndex (value) {
    const statusArr = ['queue', 'pause', 'error'] // 这些状态的文件才会设置为wait
    if (value) {
      for (let i = 0; i < value.length; i++) {
        const oneFile = value[i]
        if (statusArr.indexOf(oneFile.status) > -1) {
          oneFile.setStatus('wait')
          this.fetchedIndex = Math.min(this.fetchedIndex, this.fileList.indexOf(oneFile))
        }
      }
    } else {
      this.fetchedIndex = 0
      for (let i = this.fetchedIndex; i < this.fileList.length; i++) {
        const oneFile = this.fileList[i]
        if (statusArr.indexOf(oneFile.status) > -1) oneFile.setStatus('wait')
      }
    }
  }

  // 加入上传队列
  toFetch () {
    // 所有文件均已发送请求
    if (this.fetchedIndex === this.fileList.length) {
      if (this.fetchList.length > 1) {
        return Promise.race(this.fetchList).then(() => this.toFetch()).catch(() => this.toFetch())
      } else if (this.fetchList.length === 1) {
        this.controlPromise.resolve()
        return Promise.resolve()
      } else {
        return Promise.resolve()
      }
    }
    const oneFile = this.fileList[this.fetchedIndex]
    // 除等待中的上传文件，其余跳过
    if (oneFile.status !== 'wait') {
      this.fetchedIndex++
      return Promise.resolve().then(() => this.toFetch())
    }
    // 单个文件上传
    const oneRequest = oneFile.start(this.server)
    this.fetchList.push(oneRequest)
    oneRequest.then((response) => {
      this.fetchList.splice(this.fetchList.indexOf(oneRequest), 1)
      this.uploadCallback({
        type: 'success',
        file: oneFile,
        value: response
      })
    }).catch((er) => {
      this.fetchList.splice(this.fetchList.indexOf(oneRequest), 1)
      if (oneFile.status === 'remove') {
        this.uploadCallback({
          type: 'remove',
          file: oneFile
        })
      } else {
        if (er && er.message === 'abort') {
          this.uploadCallback({
            type: 'pause',
            file: oneFile
          })
        } else if (er && er.message === 'control-pormise-reject') {
          this.uploadCallback({
            type: 'pause',
            file: oneFile
          })
        } else {
          oneFile.setStatus('error')
          this.uploadCallback({
            type: 'error',
            file: oneFile,
            value: er
          })
        }
      }
    })
    this.fetchedIndex++
    // 继续处理
    if (this.fetchList.length - 1 >= this.maxParallel) {
      return Promise.race(this.fetchList).then(() => this.toFetch()).catch(() => this.toFetch())
    } else {
      return Promise.resolve().then(() => this.toFetch())
    }
  }
}

export default Upload
