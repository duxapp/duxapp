import { getWindowInfo, onWindowResize } from '@tarojs/taro'
import { PageMeta } from '@tarojs/components'
import { ObjectManage, duxappTheme } from '@/duxapp/utils'

const WeappRemComp = ({ config }) => {

  const fontSize = RemFontSize.useFontSize(config)

  return <PageMeta rootFontSize={fontSize + 'px'} />
}

export const WeappRem = () => {
  const rem = duxappTheme.topView?.weappRem
  if (process.env.TARO_ENV === 'weapp' && rem) {
    return <WeappRemComp config={rem} />
  }
}

class RemFontSize extends ObjectManage {

  constructor(config) {
    super({})
    this.config = {
      ...this.config,
      ...(typeof config === 'boolean' ? {} : config)
    }

    onWindowResize(() => {
      this.set({
        fontSize: this.getFontSize()
      })
    })
  }

  config = {
    maxSize: 28,
    minSize: 16
  }

  getFontSize = () => {
    const size = 40 * getWindowInfo().screenWidth / 750
    if (size < this.config.minSize) {
      return 16
    } else if (size > this.config.maxSize) {
      return 28
    } else {
      return size
    }
  }

  data = {
    fontSize: this.getFontSize()
  }

  static useFontSize = config => {
    if (!RemFontSize.instance) {
      RemFontSize.instance = new RemFontSize(config)
    }

    const { fontSize } = RemFontSize.instance.useData()

    return fontSize
  }
}
