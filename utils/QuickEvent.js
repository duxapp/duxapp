export class QuickEvent {
  callbacks = []

  on = callback => {
    this.callbacks.push(callback)
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
  }
}
