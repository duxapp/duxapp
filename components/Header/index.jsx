import { useMemo, createContext, useContext as useReactContext, useEffect } from 'react'
import { useDidShow, setNavigationBarTitle, getMenuButtonBoundingClientRect, setNavigationBarColor } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { getContrastYIQ, route, pages as routePages, px, getWindowInfo } from '@/duxapp/utils'
import theme from '@/duxapp/config/theme'
import { getPlatform, isPlatformMini, pxNum } from '@/duxapp/utils/util'
import { TopView } from '../TopView'

import back from './images/back.png'
import backWhite from './images/back-white.png'
import home from './images/home.png'
import homeWhite from './images/home-white.png'

import './index.scss'

const headerContext = createContext({})

const useContext = () => useReactContext(headerContext)

export const Header = ({
  color, // 文字及返回按钮颜色 默认自动处理
  title, // 标题
  navTitle = title, // h5端页面标题
  absolute = false, // 是否使用绝对定位，不占位置
  show = true, // 是否显示配合absolute使用，直接使用则会直接出现
  transparent,
  bgColor,
  style,
  renderMain = false, // 是否替换头部中间部分
  renderHeader, // 是否替换头部整个头部
  renderRight,// 右侧组件
  renderLeft,
  showStatus,// 使用了absolute的情况下时候显示status状态栏
  titleCenter, // 强制让title显示在中间 tabbar页面生效
  onBackClick, // 如果存在点击事件 则点击按钮时不会触发返回操作
  ...props
}) => {

  // 兼容旧的主题字段
  const isOld = theme.header.textColor
  if (typeof color === 'undefined') {
    color = theme.header[isOld ? 'textColor' : 'color']
  }

  const { path } = route.useRoute()

  const { pages, paths } = useMemo(() => route.getPathPosition(Object.keys(routePages)[0]), [])

  /**
   * 收集当前页面配置
   */
  const { setConfig } = TopView.useContext()
  useMemo(() => {
    setConfig({
      title: navTitle
    })
  }, [setConfig, navTitle])

  useDidShow(() => {
    if (process.env.TARO_ENV === 'h5' && navTitle) {
      setNavigationBarTitle({ title: navTitle })
    }
  }, [])

  // 计算属性
  const rn = process.env.TARO_ENV === 'rn'
  const h5 = process.env.TARO_ENV === 'h5'
  const harmony = process.env.TARO_ENV === 'harmony_cpp'

  let headerHeight = pxNum(88)
  // 小程序胶囊按钮宽度
  let jiaonangWidth = 0
  // 获取胶囊信息
  const statusBarHeight = h5 ? 0 : (getWindowInfo().statusBarHeight || 0)
  if (isPlatformMini) {
    const { width, height, top } = getMenuButtonBoundingClientRect() || {}
    if (width && top) {
      jiaonangWidth = width + 10
      // 动态计算header高度，让header文本和胶囊完全居中
      headerHeight = height + (top - statusBarHeight) * 2
    }
  }

  const current = routePages[path]

  // 是否显示header
  const showHeader = rn || isPlatformMini || harmony
    || (getPlatform() === 'wechat' && theme.header.showWechat)
    || (getPlatform() === 'wap' && theme.header.showWap)
    || !!renderMain || !!renderHeader

  const bgc = bgColor || (transparent ? 'transparent' : (style?.backgroundColor || theme.header[isOld ? 'color' : 'bgColor'] || '#fff'))

  const showHeight = headerHeight + (showStatus ? 0 : statusBarHeight)

  const option = {
    headerHeight,
    statusBarHeight,
    isBack: pages.length > 1,
    isBackHome: paths[0] === undefined && !current?.home,
    jiaonangWidth,
    rn,
    harmony,
    h5,
    weapp: isPlatformMini,
    showHeader,
    bgColor: bgc,
    color,
    showHeight
  }

  useEffect(() => {
    // 设置状态栏颜色
    setTimeout(() => {
      setNavigationBarColor({
        frontColor: getContrastYIQ(color) === 'white' ? '#000000' : '#ffffff',
        backgroundColor: 'transparent',
        animation: {
          duration: 400,
          timingFunc: 'easeIn'
        }
      })
    }, 100)
  }, [color])

  return <headerContext.Provider value={{ ...option, onBackClick }}>
    {
      option.showHeader ? <>
        {!show && showStatus && <View
          style={{
            height: option.statusBarHeight,
            backgroundColor: option.bgColor
          }}
        />}
        {(show || absolute) && <View
          style={style}
          className={`Header${absolute ? ' Header--absolute' : ''}`}
          {...props}
        >
          {(!absolute || option.rn || option.harmony) && <View
            style={{
              height: option.showHeight
            }}
          />}
          <View
            style={{
              backgroundColor: option.bgColor
            }}
            className={`Header__main${show ? ' Header__main--show' : ''}`}
          >
            <View style={{ height: option.statusBarHeight }} />
            {
              renderHeader ?
                <View
                  style={{ paddingRight: option.jiaonangWidth, height: option.headerHeight }}
                >
                  {renderHeader}
                </View>
                :
                <View
                  className='Header__nav'
                  style={{ height: option.headerHeight }}
                >
                  {renderLeft || <HeaderBack show={!!renderRight} />}
                  <View className='Header__nav__main'>
                    {
                      renderMain || <Text
                        className='Header__nav__title'
                        numberOfLines={1}
                        style={{
                          color,
                          // 文本居中判断
                          textAlign: option.weapp && (option.isBack || !titleCenter) ? 'left' : 'center'
                        }}
                      >{title}</Text>
                    }
                  </View>
                  {(option.isBack || option.isBackHome || !!renderRight) && <View className='Header__nav__right'
                    style={option.weapp
                      ? {
                        marginRight: option.jiaonangWidth
                      } : {}
                    }
                  >
                    {renderRight}
                  </View>}
                </View>
            }
          </View>
        </View>}
      </>
        : null
    }
  </headerContext.Provider>
}

export const HeaderBack = ({
  show
}) => {

  const option = useContext()

  const color = getContrastYIQ(option.color)

  return (option.isBack || option.isBackHome || show) && <View
    className='Header__nav__left'
    style={option.weapp ? { width: px(80) } : {}}
    onClick={async () => {
      if (option.onBackClick) {
        let res = option.onBackClick(option)
        if (res instanceof Promise) {
          res = await res
        }
        if (res !== true) {
          return
        }
      }
      option.isBack ? route.nav('back:') : option.isBackHome ? route.nav('back:home') : ''
    }}
  >
    {
      !['alipay', 'tt'].includes(process.env.TARO_ENV) && <>
        {option.isBack && <Image src={color === 'black' ? backWhite : back} className='Header__nav__left__icon' />}
        {!option.isBack && option.isBackHome && <Image src={color === 'black' ? homeWhite : home} className='Header__nav__left__icon' />}
      </>
    }
  </View>
}

Header.Back = HeaderBack
