class eventObj {
  constructor () {
    this._eventList = {}
  }

  on (value, callback) {
    this._eventList[value] = callback
  }

  trigger (eventName, value) {
    if (!this._eventList[eventName]) return
    this._eventList[eventName](value)
  }
}

export default eventObj
