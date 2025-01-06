import { useEffect, useMemo, useState } from 'react'
import { toast } from '../util'
import { loadFont, loadLocalFont } from './util'
import { networkVerify } from '../rn'
import { Platform } from '../rn/util'
import { userConfig } from '../../config/userConfig'

export const font = {
  fonts: {},
  loadCallbacks: {},
  isLocalFont: name => {
    const local = userConfig.option.duxapp?.font?.local?.[name]
    if (local === true || local?.[Platform?.OS] === true) {
      return true
    }
  },
  loadLocal: (name, assets) => {
    loadLocalFont(name, assets)
  },
  load: async (name, url, num = 0) => {
    if (num > 5) {
      return toast(name + ' 字体加载失败，请确认网络环境，重启后重试')
    }
    try {
      if (!font.isLocalFont(name)) {
        font.fonts[name] = { status: false }
        await networkVerify()
        await loadFont(name, url)
        font.fonts[name].status = true
      } else {
        font.fonts[name] = { status: true }
      }
      if (font.loadCallbacks[name]?.length) {
        font.loadCallbacks[name].forEach(callback => callback())
        delete font.loadCallbacks[name]
      }
    } catch (error) {
      setTimeout(() => {
        font.load(name, url, num + 1)
      }, 800)
    }
  },
  useFont: name => {

    const defaultStatus = useMemo(() => {
      if (!!font.fonts[name]?.status) {
        return true
      }
      return font.isLocalFont(name)
    }, [name])

    const [status, setStatus] = useState(defaultStatus)

    useEffect(() => {
      if (font.fonts[name]?.status) {
        !defaultStatus && setStatus(true)
        return
      }
      if (!font.loadCallbacks[name]) {
        font.loadCallbacks[name] = []
      }
      font.loadCallbacks[name].push(() => setStatus(true))
    }, [name, defaultStatus])

    return status
  }
}
