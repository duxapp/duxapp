import { ViewProps } from '@tarojs/components'
import { ComponentType, ReactNode } from 'react'

interface KeyboardDismissProps extends ViewProps {
  /**
   * 决定子元素有点击事件的时候，是否也要收起键盘
   * 例如点击 Upload 的上传按钮的时候是否收起键盘
   * 默认true
   *
   * ScrollView不支持这个属性，如果要让在ScrollView里面的表单实现这样的效果
   * 给ScrollView 设置 `keyboardShouldPersistTaps='always'`
   * 然后用这个组件包裹ScrollView或者更外层
   *
   * 当设置为false，效果和 keyboardShouldPersistTaps='handled' 是一样的
   * duxapp 模块提供的 ScrollView 默认设置了 keyboardShouldPersistTaps='handled'
   */
  buddle?: boolean
}

/**
 * 在rn端在非ScrollView组件内，点击空白区域不会自动隐藏键盘，使用这个包括可以隐藏
 * 在RN端作为一个View处理，在其他端是一个空元素，直接返回子元素
 * 不要给他绑定任何事件，你可以给你设置style
 *
 * 什么时候使用这个组件？
 * 在非ScrollView里面使用了输入框组件的情况下，在外部包裹这个组件，可以让点击空白区域的时候自动收起键盘
 */
export const KeyboardDismiss: ComponentType<KeyboardDismissProps>
