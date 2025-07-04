interface AppThemes {
  [app: string]: Record<string, any>
}

interface ThemeMode {
  mode: string | null
  name: string
  /**
   * 切换到当前主题
   */
  switch: () => void
  [key: string]: any
}

/**
 * 主题切换系统
 * 当前支持 小程序 H5 其他端还在努力开发中
 */
declare class Theme extends ObjectManage {

  data: {
    mode: string | null
  }

  /**
   * 提供给系统使用的方法
   * 请勿调用
   * @param themes
   */
  registerAppThemes(themes: AppThemes): void

  /**
   * 获取可用主题列表，用于编写界面给用户提供主题设置
   */
  useModes(): ThemeMode[]

  /**
   * 获取当前正在使用的主题
   * 如果 saveMode 传入true是获取当前保存的主题，如果是跟随系统的话会返回 `null`，如果不传这个参数，会返回实际正在使用的主题
   * @param saveMode 是否获取当前纯属的主题而不是真实使用的主题
   */
  useMode(saveMode?: boolean): string | null

  /**
   * 设置主题
   * 如果传入 `null` 则是切换为跟随系统，或者自动选择
   * @param mode 主题
   */
  setMode(mode: string | null): void

  /**
   * 判断当前使用的后者传入的主题是否是暗黑模式
   * 不传入mode参数则判断当前是否正在使用暗黑模式
   * @param mode 传入模式的话判断传入的模式是不是暗黑模式
   */
  isDark(mode?: string | null): boolean

  /**
   * 判断当前使用的后者传入的主题是否是暗黑模式
   * 不传入mode参数则判断当前是否正在使用暗黑模式
   * @param mode 传入模式的话判断传入的模式是不是暗黑模式
   */
  useIsDark(mode?: string | null): boolean

  /**
   * 在某些情况下你直接调用主题，在切换主题的时候不会生效，就需要使用这个hook获取主题
   * @param app 指定使用哪个模块的主题
   */
  useTheme(app?: string): Record<string, any> | AppThemes
}

export const theme: Theme
