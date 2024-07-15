export class Queue {
  constructor(concurrency) {
    this.queue = []
    this.concurrency = concurrency
    this.runningCount = 0
  }

  enqueue(task) {
    this.queue.push(task)
    this.processQueue()
  }

  processQueue() {
    while (this.runningCount < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()
      this.runningCount++
      task(() => {
        this.runningCount--
        this.processQueue()
      })
    }
  }
}
