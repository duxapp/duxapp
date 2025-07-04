import { CSSProperties, ReactElement, ComponentType } from 'react'
import { ViewProps } from '@tarojs/components'

interface HeaderProps extends ViewProps {
  /** 头部标题 */
  title?: string,
  /** h5端显示在头部的标题 默认等于title 设置为空将不会产生变化 */
  navTitle?: string
  /**
   * 手动设置文字颜色
   */
  color?: string,
  /**
   * 是否透明 优先级高于style.backgroundColor
   * @default false
   */
  transparent?: boolean,
  /**
   * 指定背景颜色
   */
  bgColor?: string,
  /**
   * 将header设置为绝对定位
   * @default false
   */
  absolute?: boolean,
  /**
   * 用于控制组件的显示和隐藏
   * @default true
   */
  show?: boolean,
  /**
   * show=false的情况下时候显示status状态栏
   */
  showStatus?: boolean,
  /**
   * 组件的内联样式, 整个样式会作用到header的最外层View 如果设置背景颜色 标题颜色会自动根据背景颜色自适应
   * @info backgroundColor 属性仅支持 rgba rgb 16进制颜色
   */
  style?: CSSProperties,
  /** 自定义渲染标题区域 */
  renderMain?: ReactElement,
  /** 自定义渲染整个Header，包括返回区域和右侧区域 */
  renderHeader?: ReactElement
  /** 自定义渲染右侧区域 */
  renderLeft?: ReactElement
  /** 自定义渲染返回区域 */
  renderRight?: ReactElement
  /** 强制将标题显示在中间 仅在主页生效 */
  titleCenter?: boolean
  /**
   * 左侧按钮点击事件 点击左侧按钮时
   * 如果存在点击事件 则点击按钮时不会触发返回操作
   * 返回 true 使用默认操作，返回其他值不执行默认操作
   * @returns
   */
  onBackClick?: (option: {
    isBack: boolean
    isBackHome: boolean
  }) => boolean | Promise<boolean>
}

interface HeaderBackProps {

}

/**
 * 公共头部组件
 * @example
 * <Header title='页面标题' />
 * @info style.backgroundColor 属性仅支持 rgba rgb 16进制颜色
 */
export const Header: ComponentType<HeaderProps> & {
  /**
   * 当你使用了`renderHeader`属性的时候，返回按钮将不在header上，你可以使用这个组件替代返回按钮的位置。
   * 这个组件只能出现在Header组件的内部，例如 renderHeader 属性内
   */
  Back: ComponentType<HeaderBackProps>
}
