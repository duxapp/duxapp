/**
 * 事件系统，需要创建一个实例后使用
 */
export class QuickEvent {

  /**
   * 监听事件
   * onLast 是否在调用 on 监听的时候，触发最后一个 trigger 的事件内容
   * onLast 如果事件已经触发过的情况下，再调用on监听，也能监听到最后一个触发的事件
   */
  on: (callback: (...args: any[]) => void, onLast?: boolean) => {
    /**
     * 移除监听
     */
    remove: () => void
  }
  /**
   * 触发事件
   */
  trigger: (...args: any[]) => void
}
