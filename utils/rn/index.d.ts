/**
 * RN端模拟方法
 */
export const useLaunch: (callback: () => void) => void

/**
 * ios端奇怪的网络权限，在APP首次启动的时候无法获得网络
 * 将这个方法加入网络请求的中间件(请求拦截器)中，可以让请求获得正确的结果
 */
export const networkVerify: <K>(params: K) => Promise<K>

/**
 * RN 安卓端使用这个钩子，可以阻止返回按钮关闭页面
 * 需要控制status参数，参数默认为true，参数为true才会阻止关闭页面
 * 当点击返回按键的时候会 执行 callback函数
 */
export const useBackHandler: (callback: () => void, status?: boolean) => void

/**
 * RN端模拟实现，防止报错
 */
export const nextTick: (callback: () => void) => void
