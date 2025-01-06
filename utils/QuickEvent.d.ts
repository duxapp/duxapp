/**
 * 事件系统，需要创建一个实例后使用
 */
export class QuickEvent {
  /**
   * 监听事件
   */
  on: (callback: (...args: any[]) => void) => {
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
