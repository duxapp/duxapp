export type LangResources = Record<string, unknown>

export type LangLoader<R extends LangResources = LangResources> = () => Promise<R> | R

export type LangResourceOrLoader<R extends LangResources = LangResources> = R | Promise<R> | LangLoader<R>

/**
 * 内置支持的语言标识（系统语言自动识别会归一化到这些值）
 *
 * 标识 -> 中文说明：
 * - `zh`：简体中文
 * - `zhHant`：繁体中文
 * - `en`：英语
 * - `ja`：日语
 * - `ko`：韩语
 * - `ru`：俄语
 * - `fr`：法语
 * - `de`：德语
 * - `es`：西班牙语
 * - `pt`：葡萄牙语
 * - `it`：意大利语
 * - `ar`：阿拉伯语
 * - `th`：泰语
 * - `vi`：越南语
 * - `id`：印尼语
 * - `ms`：马来语
 * - `tr`：土耳其语
 * - `hi`：印地语
 */
export type LangSupported =
  | 'zh'
  | 'zhHant'
  | 'en'
  | 'ja'
  | 'ko'
  | 'ru'
  | 'fr'
  | 'de'
  | 'es'
  | 'pt'
  | 'it'
  | 'ar'
  | 'th'
  | 'vi'
  | 'id'
  | 'ms'
  | 'tr'
  | 'hi'

export interface LangModuleRuntime<R extends LangResources = LangResources> {
  fallback: string
  resources: Record<string, R>
  loaders: Record<string, LangLoader<R>>
  loading: Record<string, Promise<R | void>>
}

export interface LangModuleConfig<R extends LangResources = LangResources> {
  /**
   * 模块自己的回退语言（优先于全局回退）
   */
  fallback?: string
  /**
   * 直接注入的语言包集合：{ zh: {...}, en: {...} }
   */
  resources?: Record<string, R>
  /**
   * 异步/懒加载语言包：{ zh: () => import('./zh'), en: () => fetch... }
   */
  loaders?: Record<string, LangLoader<R>>
}

/**
 * 全局语言配置（来自 `userConfig.option?.duxapp?.langConfig` 或 `userConfig.option?.duxapp?.lang`）
 */
export interface LangGlobalConfig {
  /**
   * 默认语言；未配置时会尝试读取系统语言（Taro `getSystemInfoSync().language`）
   * - `zh_CN/zh-SG` 等会推断为 `zh`（简体）
   * - `zh_TW/zh-HK` 等会推断为 `zhHant`（繁体）
   * - 其他常见语言会映射为固定标识（如 `en`/`ja`/`ko`/`ru`）
   *
   * 内置支持的语言标识见 `LangSupported`（也允许自定义字符串）。
   */
  default?: string
  /**
   * 全局回退语言；未配置时等于 default
   */
  fallback?: string
  /**
   * 是否在首次使用时根据设备语言自动选择并保存
   * - 仅在本地未保存过语言（lang=null）时生效
   * - 只有当设备语言归一化后的值存在于 `langs` 列表中才会切换
   */
  autoDetect?: boolean
  /**
   * 支持的语言列表（用于给 UI 做语言切换选项；CLI 也可据此自动导入语言包）
   * - 未配置时会自动包含 default/fallback/zh 之一
   */
  langs?: string[]
}

export interface LangItem {
  /** 语言中文名（内置映射，未知则回退为 value） */
  name: string
  /** 语言标识（如 zh / zhHant / en） */
  value: string
}

interface LangSetOptions {
  /**
   * 是否在切换语言后预加载（默认 true）
   */
  preload?: boolean
  /**
   * 仅预加载指定模块；不传则预加载已注册的全部模块
   */
  moduleNames?: string[]
}

export interface LangTOptions<TDefault = unknown> {
  /**
   * 指定本次翻译使用的语言，不传则使用当前语言
   */
  lang?: string
  /**
   * 插值参数：支持 `{{name}}` 形式
   */
  params?: Record<string, unknown>
  /**
   * 找不到 key 时的默认值
   */
  defaultValue?: TDefault
}

export interface LangAddOptions {
  /**
   * 注册后立即触发一次 load（仅对 loader 生效）
   */
  eager?: boolean
  /**
   * 注入对象时是否深度合并（默认 true）
   */
  merge?: boolean
}

export interface LangBoundModule<R extends LangResources = LangResources> {
  add: (lang: string, resourcesOrLoader: LangResourceOrLoader<R>, options?: LangAddOptions) => void
  addMany: (resourcesMap: Record<string, LangResourceOrLoader<R>>, options?: LangAddOptions) => void
  addResources: (lang: string, resources: R, options?: { merge?: boolean }) => void
  addLoader: (lang: string, loader: LangLoader<R>) => void
  load: (lang?: string) => Promise<R | void>
  /**
   * - 传字符串：作为 defaultValue
   * - 传对象且包含 defaultValue/lang/params：作为选项
   * - 传对象且不包含这些字段：作为插值参数 params
   */
  t: <TReturn = string>(key: string, paramsOrOptions?: TReturn | Record<string, unknown> | (LangTOptions<TReturn> & { params?: Record<string, unknown> })) => TReturn
  getT: () => <TReturn = string>(key: string, paramsOrOptions?: TReturn | Record<string, unknown> | (LangTOptions<TReturn> & { params?: Record<string, unknown> })) => TReturn
  useT: () => <TReturn = string>(key: string, paramsOrOptions?: TReturn | Record<string, unknown> | (LangTOptions<TReturn> & { params?: Record<string, unknown> })) => TReturn
}

/**
 * 多语言管理（轻量，无 i18next 依赖）
 * - 支持按模块独立命名空间
 * - 支持语言包异步注入 / 懒加载
 */
declare class Lang extends ObjectManage<{
  lang: string | null
  version: number
}> {

  /**
   * 内部状态：
   * - lang: 保存到本地的语言（null 表示使用默认值）
   * - version: 资源更新版本号（用于触发 useT 重新计算）
   */
  /**
   * 创建/获取一个模块命名空间（每个模块互相隔离，允许相同 key）
   */
  createModule<R extends LangResources = LangResources>(name: string, options?: LangModuleConfig<R>): LangModuleRuntime<R>

  /**
   * 直接注入语言包（可选择 merge 深度合并，默认 merge=true）
   */
  addResources<R extends LangResources = LangResources>(moduleName: string, lang: string, resources: R, options?: { merge?: boolean }): void

  /**
   * 注册某个语言的异步 loader（不立即执行，直到 load/t/preload 触发）
   */
  addLoader<R extends LangResources = LangResources>(moduleName: string, lang: string, loader: LangLoader<R>): void

  /**
   * 注册语言资源或 loader：
   * - 传对象：立即注入
   * - 传 Promise / 函数：作为懒加载 loader
   * - eager=true 时会立即触发一次 load
   */
  add<R extends LangResources = LangResources>(moduleName: string, lang: string, resourcesOrLoader: LangResourceOrLoader<R>, options?: LangAddOptions): void

  /**
   * 批量注册语言包/loader
   * @example
   * lang.addMany('duxcmsUser', {
   *   zh: () => import('./lang/zh'),
   *   zhHant: () => import('./lang/zhHant'),
   *   en: () => import('./lang/en')
   * })
   */
  addMany<R extends LangResources = LangResources>(moduleName: string, resourcesMap: Record<string, LangResourceOrLoader<R>>, options?: LangAddOptions): void

  /**
   * 触发加载某模块的某语言资源（如果已存在则直接返回）
   */
  load<R extends LangResources = LangResources>(moduleName: string, lang?: string): Promise<R | void>

  /**
   * 预加载指定语言的资源（可限制模块列表）
   */
  preload(lang: string, moduleNames?: string[]): Promise<void>

  /**
   * 获取当前语言：
   * - saveLang=true：返回保存的语言（可能为 null）
   * - saveLang=false/不传：返回实际使用语言（含默认值）
   */
  getLang(saveLang?: boolean): string | null

  /**
   * React hook：订阅语言变化并返回当前语言
   * - saveLang=true：返回保存的语言（可能为 null）
   * - saveLang=false/不传：返回实际使用语言（含默认值）
   */
  useLang(saveLang?: boolean): LangItem

  /**
   * 获取语言列表（来自 `userConfig.option?.duxapp?.langConfig.langs`，会做归一化/去重）
   * 返回格式：`[{ name: '简体中文', value: 'zh' }]`
   */
  getLangs(): LangItem[]

  /**
   * React hook：订阅语言变化并返回语言列表（用于语言切换 UI）
   */
  useLangs(): LangItem[]

  /**
   * 设置当前语言（默认会预加载已注册模块的该语言资源）
   */
  setLang(lang: string, options?: LangSetOptions): void

  /**
   * 同步翻译：
   * - moduleName 为模块命名空间（隔离）
   * - key 支持 `a.b.c` 路径
   * - 若当前语言资源未加载且存在 loader，会触发一次后台 load（t 仍保持同步返回）
   */
  t<TReturn = string>(moduleName: string, key: string, paramsOrOptions?: TReturn | Record<string, unknown> | (LangTOptions<TReturn> & { params?: Record<string, unknown> })): TReturn

  /**
   * 获取绑定 moduleName 的 t 函数（便于在模块内复用）
   */
  getT(moduleName: string): <TReturn = string>(key: string, paramsOrOptions?: TReturn | Record<string, unknown> | (LangTOptions<TReturn> & { params?: Record<string, unknown> })) => TReturn

  /**
   * React hook：返回绑定 moduleName 的 t 函数，并在语言/资源变化后更新引用
   */
  useT(moduleName: string): <TReturn = string>(key: string, paramsOrOptions?: TReturn | Record<string, unknown> | (LangTOptions<TReturn> & { params?: Record<string, unknown> })) => TReturn

  /**
   * 监听语言变化
   */
  onChange(callback: (lang: string) => void, options?: { onLast?: boolean }): { remove: () => void }

  /**
   * 模块辅助：先绑定 moduleName，再进行 add/load/t
   */
  module<R extends LangResources = LangResources>(moduleName: string, options?: { fallback?: string }): LangBoundModule<R>
}

/**
 * 使用示例
 *
 * 1) 在模块内注册语言包（支持同步/异步）
 * ```ts
 * import { lang } from '@/duxapp'
 *
 * // 绑定模块命名空间（不同模块互相隔离）
 * const i18n = lang.module('duxcmsUser', { fallback: 'zh' })
 *
 * // 同步注入
 * i18n.add('zh', { common: { ok: '确定' } })
 * i18n.add('zhHant', { common: { ok: '確定' } })
 * i18n.add('en', { common: { ok: 'OK' } })
 *
 * // 异步/懒加载注入（推荐：不会把所有语言打进主包）
 * i18n.add('zh', () => import('./lang/zh'))
 * i18n.add('zhHant', () => import('./lang/zhHant'))
 * i18n.add('en', () => import('./lang/en'))
 * ```
 *
 * 2) 翻译（模块隔离，允许 key 重名）
 * ```ts
 * lang.t('duxcmsUser', 'common.ok') // => '确定' / 'OK'
 * ```
 *
 * 3) React 组件内使用（语言切换/资源更新会自动刷新）
 * ```tsx
 * const t = lang.useT('duxcmsUser')
 * // 或者
 * const t = i18n.useT()
 * return <Text>{t('common.ok')}</Text>
 * ```
 *
 * 4) 切换语言（默认会预加载已注册模块）
 * ```ts
 * lang.setLang('en')
 * ```
 */
export const lang: Lang

export const duxappLang: LangBoundModule
