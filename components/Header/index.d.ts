import { CSSProperties } from 'react'
import { Component } from 'react'

type props = Partial<{
  /** 头部标题 */
  title?: string,
  /** h5端显示在头部的标题 默认等于title 设置为空将不会产生变化 */
  navTitle?: string
  /**
   * 手动设置文字颜色
   */
  color?: string,
  /**
   * 将header设置为绝对定位
   * @default false
   */
  absolute?: boolean,
  /**
   * absolute设置为true的情况下再使用此属性 用于控制组件的显示和隐藏
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
  /** 替换头部中间部分为自定义组件 请先设置isRenderMain 否则不生效 */
  renderMain?: Component,
  /** 替换头部为自定义组件 请先设置isRenderHeader 否则不生效 */
  renderHeader?: Component
  /** 左侧显示的组件 */
  renderLeft?: Component
  /** 右侧显示的组件 */
  renderRight?: Component
  /** 强制抢标题显示在中间 仅在tabbar页面生效 */
  titleCenter?: boolean
  /**
   * 左侧按钮点击事件 点击左侧按钮时
   * 如果存在点击事件 则点击按钮时不会触发返回操作
   * @returns
   */
  onBackClick?: () => void
  /** 引用 */
  ref?: string | ((node: any) => any)
}>

class HeaderBack extends Component {

}

/**
 * 公共头部组件
 * @example
 * <Header title='页面标题' />
 * @info style.backgroundColor 属性仅支持 rgba rgb 16进制颜色
 */
export class Header extends Component<props>{
  static Back: HeaderBack
}
