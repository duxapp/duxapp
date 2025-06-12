/**
 * color转rgb 获取颜色rgb值 用于计算
 * @param hexcolor
 * @return rgb颜色值 数组
 */
export function colorToRgb(hexcolor: string): number[]

/**
 * 将rgb转化为Hex颜色值
 * @param rgb 由rgb组成的数组
 */
export function rgbToHexColor(rgb: number[]): string

/**
 * 颜色减淡
 * @param color hex颜色值
 * @param level 0-1
 * @return rgb颜色值
 */
export function colorLighten(color: string, level: number): string
/**
 * 颜色加深
 * @param color hex颜色值
 * @param level 0-1
 * @return rgb颜色值
 */
export function colorDark(color: string, level: number): string

/**
 * 计算出具有较高对比度的颜色是白色还是黑色
 * @param hexcolor hex颜色 或者rgb颜色
 * 传入一个hex颜色值会自动对比用这个颜色做为背景，文字应该用白色还是黑色
 */
export function getContrastYIQ(color: string): 'black' | 'white'

/**
 * 验证是否是合法的颜色值
 * @param color 颜色值
 */
export function isColorString(color: string): boolean
