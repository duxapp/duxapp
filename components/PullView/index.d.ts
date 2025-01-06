import { LegacyRef, ComponentType, CSSProperties } from 'react'

/** 弹出位置 */
interface side {
  /** 底部弹出 */
  bottom
  /** 顶部弹出 */
  top
  /** 左侧弹出 */
  left
  /** 右侧弹出 */
  right
  /** 弹出到正中 */
  center
}

interface PullViewProps {
  /**
   * 弹出位置
   * @default buttom
  */
  side?: keyof side,
  /**
   * 空白区域的不透明度
   * @default 0.5
  */
  overlayOpacity?: number
  /**
   * 是否锁定模态框 设置为true点击空白区域无法关闭模态框
   * @default false
  */
  mask?: boolean
  /**
   * 是否显示遮罩层，默认显示，设置为false隐藏遮罩层
   * 当关闭遮罩层时，无法点击遮罩层进行关闭，需要手动关闭弹框
   */
  masking?: boolean
  /**
   * 动画持续时长 默认 200
   */
  duration?: number
  /**
   * 分组 同一个分组的弹框将会以队列的形式显示
   */
  group?: string
  /** 弹出层内层样式 */
  style?: CSSProperties
  /** 点击非内容区域的关闭事件 */
  onClose?: () => any
  /** 引用 */
  ref?: LegacyRef<{
    /**
     * 关闭弹窗
     * change传入false，可以避免触发 onClose 事件
     */
    close: (change?: boolean) => void
  }>
}

/**
 * 从四个方向弹出模态框
 * 此组件需要配合TopView组件使用
 * 当side为top或者buttom时，请确保你的内容具有固定的高度 为left或者right是确保你的内容具有固定宽度（使用flex: 1或者height: 100%让你的内容获取全部高度）
 * @example
 * ```jsx
 * {show && <PullView onClose={() => this.setState({ show: false })}>
 *  <Text>将子内容放在这里，这里可以放任何内容作为弹出内容</Text>
 * </PullView>}
 * ```
 */
export const PullView: ComponentType<PullViewProps>
