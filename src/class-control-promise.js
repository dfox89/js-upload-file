class ControlPormise {
  constructor (callback) {
    this.p = null
    this._callback = callback
  }

  init () {
    this.p = new Promise((resolve, reject) => {
      let tempFlag = 'pending'
      Object.defineProperty(this, 'flag', {
        configurable: true,
        get: () => {
          return tempFlag
        },
        set: (value) => {
          if (this.p) {
            if (this._callback) this._callback()
            this.p = null
            value === 'control-resolve' ? resolve(value) : reject(value)
          }
          tempFlag = value
        }
      })
    })
  }

  resolve () {
    this.flag = 'control-resolve'
  }

  reject (value) {
    this.flag = value || 'control-reject'
  }
}

export default ControlPormise
