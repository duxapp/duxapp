import { pxTransform } from '@tarojs/taro'

interface TimeOutTask extends Promise<TimeOutTask> {
  /** 清除定时器 */
  clear(): void
}

/**
 * 显示一个提示
 * @param title 提示内容
 */
export function toast(title: string): void

/**
 * 判断是不是有刘海的机型
 */
export function isIphoneX(): boolean

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

export const px = pxTransform

/**
 * 将设计尺寸转换为实际尺寸对应的数字
 */
export const pxNum = (val: number) => number

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
}) => string

/**
 * 判断是不是各种小程序
 */
export const isPlatformMini: boolean

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
