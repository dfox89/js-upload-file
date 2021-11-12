const allEvent = [
  'beforeAdd', // 添加某文件前
  'afterAdd', // 添加某文件后
  'addFinish', // 全部添加完毕
  'beforeHash', // 某文件生成hash值前
  'beforeUpFile', // 上传某文件前，即hash值生成后
  'beforeUpChunk', // 上传某分片前
  'afterUpChunk', // 上传某分片后
  'beforePause', // 某文件暂停前
  'afterPause', // 某文件暂停后
  'success', // 某文件上传成功
  'error', // 某文件上传失败
  'finish', // 全部上传完成，无论成功失败
  'beforeRemove', // 某文件移除前
  'afterRemove' // 某文件移除后
]

class eventObj {
  constructor () {
    this._eventList = {}
    this._queue = {}
    this._uniqueKey = 0 // 用于标识事件队列，事件队列分组
  }

  // 监听事件
  on (value, callback) {
    if (value === 'all') { // all
      this._bindEvent(allEvent, callback)
    } else {
      if (Object.prototype.toString.call(value) !== '[object Array]') value = [value]
      this._bindEvent(value, callback)
    }
  }

  // 触发事件
  trigger (eventName, value) {
    if (!this._eventList[eventName]) return Promise.resolve()
    this._uniqueKey++
    this._queue[this._uniqueKey] = []
    for (let i = 0; i < this._eventList[eventName].length; i++) {
      this._queue[this._uniqueKey].push(this._eventList[eventName][i])
    }
    return this._runFetch(value, this._uniqueKey)
  }

  // 绑定事件
  _bindEvent (arr, fun) {
    for (let i = 0; i < arr.length; i++) {
      if (!this._eventList[arr[i]]) this._eventList[arr[i]] = []
      this._eventList[arr[i]].push(fun)
    }
  }

  // 执行事件回调
  _runFetch (value, key) {
    if (this._queue[key].length === 0) {
      delete this._queue[key]
      return Promise.resolve()
    } else {
      const oneCallback = this._queue[key].shift()
      return Promise.resolve().then(() => oneCallback(value)).then(() => this._runFetch(value, key))
    }
  }
}

export default eventObj
