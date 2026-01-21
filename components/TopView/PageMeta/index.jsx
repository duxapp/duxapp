/* eslint-disable react-hooks/rules-of-hooks */
import { PageMeta as TaroPageMeta } from '@tarojs/components'
import { ObjectManage, duxappTheme, isDesktop, useWindowInfo } from '@/duxapp/utils'

export const PageMeta = props => {
  const [status, _props] = RemFontSize.getInstance().usePageMetaProps(props)
  if (status) {
    return <TaroPageMeta {..._props} />
  }
}

class RemFontSize extends ObjectManage {

  constructor() {
    super({})
    const config = duxappTheme.topView?.weappRem
    this.config.open = !!config
    this.config = {
      ...this.config,
      ...(typeof config === 'boolean' ? {} : config)
    }
  }

  config = {
    open: false,
    maxSize: 28,
    maxSizePhone: 22,
    minSize: 16
  }

  usePageMetaProps(props) {
    if (!this.config.open) {
      return [Object.keys(props).length > 0, props]
    }

    const info = useWindowInfo()

    const size = 40 * info.screenWidth / 750

    const fontSize = Math.min(
      Math.max(size, this.config.minSize),
      isDesktop({ includeIPad: true }) ? this.config.maxSize : this.config.maxSizePhone
    )

    return [
      true,
      {
        ...props,
        rootFontSize: fontSize + 'px'
      }
    ]
  }
}
