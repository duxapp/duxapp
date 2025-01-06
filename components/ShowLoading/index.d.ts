/**
 * 显示loading动画
 * 返回的函数用于关闭loading动画
 */
export const loading: (
  /**
   * 显示的文本
   */
  text?: string,
  /**
   * 是否遮住页面，让点击无法操作
   */
  mask?: boolean
) => (() => void)
