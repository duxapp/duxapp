interface TimeOutTask<T = any> extends Promise<T> {
  /** 清除定时器 */
  clear(): void
}

/**
 * 显示一个提示
 * @param title 提示内容
 */
export function toast(title: any): void

/**
 * 判断是不是有刘海的机型
 */
export function isIphoneX(): boolean

/**
 * 获取底部安全区域高度（屏幕底部不可用的那部分）
 */
export function getBottomSafeAreaHeight(): number

/**
 * 定时器的Promise用法
 * @param timeout 定时时间
 */
export function asyncTimeOut(timeout: number): TimeOutTask

/**
 * 一个空函数
 */
export function noop(): void

/**
 * 阻止事件冒泡，将点击或者其他事件的参数传入此函数，多端调用这个函数不会报错
 * @param event 原生事件参数
 */
export function stopPropagation(event: EventTarget | any): void

/**
 * taro 的 pxTransform 包装（RN 端可选追加 `px` 单位）
 */
export function px(val: number, pxUnit?: boolean): string | number

/**
 * 将设计尺寸转换为实际尺寸对应的数字
 */
export function pxNum(val: number): number

/**
 * 判断是否为桌面端（可选将 iPad 视为桌面端）
 * @param options.includeIPad 传 true 时 iPad 也返回 true
 */
export function isDesktop(options?: { includeIPad?: boolean }): boolean
/**
 * 在 style 里面编写transform样式的时候使用这个函数进行包装，才能兼容多个端
 */
export const transformStyle = (obj: {
  translateX?: number
  translateY?: number
  translateZ?: number
  scaleX?: number
  scaleY?: number
  scaleZ?: number
  rotateX?: string
  rotateY?: string
  rotateZ?: string
  skewX?: string
  skewY?: string
}) => string | Array<Record<string, string | number>>

/**
 * 判断是不是各种小程序
 */
export const isPlatformMini: boolean

/**
 * 获取平台类型（主要用于支付等业务判断）
 * @returns app APP端 | weapp 微信小程序 | wechat 微信公众号 | wap H5端 | 其他 taro 端类型
 */
export function getPlatform(): 'app' | 'wechat' | 'wap' | string

/**
 * 增强版节流函数
 * @template T 被包装函数的类型
 * @param fn 需要节流的函数
 * @param delay 节流时间间隔(毫秒)
 * @param immediate 是否立即执行第一次调用 (默认为 true)
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  immediate?: boolean
): {
  (...args: Parameters<T>): ReturnType<T> | void
}
