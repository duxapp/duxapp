/**
 * app管理
 */
class App {

  apps = {}

  /**
   * 注册一个app
   * @param {string} name app标识 一般请使用文件夹名称作为标识
   * @param {object} params 注册数据 ，可以提供给其他模块调用的数据
   */
  register = (name, params = {}) => {
    this.apps[name] = params
  }

  /**
   * 判断是否是一个合法的app
   * @param {string} name app标识
   * @returns boolean
   */
  isApp = name => !!this.apps[name]

  /**
   * 返回app的一个属性 也可以返回一个函数
   * @param {string} name app标识
   * @param {string} attr 属性名称
   * @returns 返回一个属性
   */
  attr = (name, attr) => this.apps[name]?.[attr]

  /**
   * 执行一个是函数的属性
   * @param {string} name app标识
   * @param {string} attr 属性名称
   * @param  {...any} arg 要传递给改函数的参数
   * @returns 返回该函数的返回值
   */
  method = (name, method, ...arg) => this.attr(name, method)?.(...arg)

  /**
   * 云端app列表
   */
  cloudApps = []
  /**
   * 注册云端app模块
   */
  registerCloudApps = apps => {
    this.cloudApps = apps
  }

  /**
   * 是否是一个云端app
   * @param {string} name app名称
   * @returns boolean
   */
  isCloudApp = name => this.cloudApps.includes(name)
}

export const app = new App()
