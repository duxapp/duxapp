import { ComponentType, ReactElement } from 'react'

interface AbsoluteProps {
  /**
   * 分组 同一个分组的弹框将会以队列的形式显示
   */
  group?: string
  /** 子元素 */
  children: ReactElement
}

/**
 * 将内容添加到顶层
 * 此组件需要配合TopView组件使用
 * @example
 * ```jsx
 * <Asbolute>
 *   <Text>此处的内容将会添加在和TopView组件相同的位置上</Text>
 * </Asbolute>
 * ```
 */
export const Absolute: ComponentType<AbsoluteProps>
