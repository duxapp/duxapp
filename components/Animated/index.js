import { create } from './create'
import { View } from './View'

export const Animated = {
  create,
  View,
  defaultState: process.env.TARO_PLATFORM === 'mini' ? {} : null
}
