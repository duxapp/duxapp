/**
 * 用来管理字体的工具，通常不需要手动调用
 * 正常的使用方法是使用命令创建字体图标进行使用
 */
export const font: {
  /**
   * 加载一个本地字体 仅RN端支持
   * @param name 字体名称
   * @param assets 字体资源路径
   */
  loadLocal: (name: string, assets: string) => void
  /**
   * 加载远程字体
   * @param name 字体名称
   * @param url 字体地址
   */
  load: (name: string, url: string) => void
  /**
   * 判断远程字体加载状态，配合 load 方法使用
   * @param name 字体名称
   */
  useFont: (name: string) => boolean
}
