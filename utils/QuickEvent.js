export class QuickEvent {
  callbacks = []

  lastEvent

  on = (callback, onLast) => {
    this.callbacks.push(callback)
    if (this.lastEvent && onLast) {
      callback(...this.lastEvent)
    }
    return {
      remove: () => {
        const index = this.callbacks.indexOf(callback)
        if (~index) {
          this.callbacks.splice(index, 1)
        }
      }
    }
  }

  trigger = (...arg) => {
    [...this.callbacks].forEach(callback => callback(...arg))
    this.lastEvent = [...arg]
  }
}
