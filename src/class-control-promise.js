class ControlPormise {
  constructor () {
    this._p = null
    this._callback = null
  }

  init () {
    this._callback = null
    this._p = new Promise((resolve, reject) => {
      let tempFlag = 'pending'
      Object.defineProperty(this, 'flag', {
        configurable: true,
        get: () => {
          return tempFlag
        },
        set: (value) => {
          if (this._p) {
            if (this._callback) this._callback()
            value === 'control-resolve' ? resolve(value) : reject(value)
          }
          this._p = null
          this._callback = null
          tempFlag = value
        }
      })
    })
  }

  resolve (callback) {
    this._callback = callback
    this.flag = 'control-resolve'
  }

  reject (value, callback) {
    this._callback = callback
    this.flag = value || 'control-reject'
  }
}

export default ControlPormise
