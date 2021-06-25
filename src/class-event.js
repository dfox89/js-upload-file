const allEvent = [
  'queue', // 添加文件
  'hash', // 某文件生成hash值中
  'uping', // 某文件上传中
  'pause', // 某文件上传暂停
  'success', // 某文件上传成功
  'error', // 某文件上传失败
  'finish', // 全部上传完成，无论成功失败
  'remove' // 某文件移除
]

class eventObj {
  constructor () {
    this._eventList = {}
  }

  // 监听事件
  on (value, callback) {
    if (value === 'all') { // all
      this._bindEvent(allEvent, callback)
    } else if (typeof value === 'string') { // string
      this._bindEvent([value], callback)
    } else { // array
      this._bindEvent(value, callback)
    }
  }

  // 触发事件
  trigger (eventName, value) {
    if (!this._eventList[eventName]) return
    for (let i = 0; i < this._eventList[eventName].length; i++) {
      this._eventList[eventName][i](value)
    }
  }

  // 绑定事件
  _bindEvent (arr, fun) {
    for (let i = 0; i < arr.length; i++) {
      if (!this._eventList[arr[i]]) this._eventList[arr[i]] = []
      this._eventList[arr[i]].push(fun)
    }
  }
}

export default eventObj
