import { useMemo, createContext, useContext as useReactContext, useEffect } from 'react'
import { useDidShow, setNavigationBarTitle, getMenuButtonBoundingClientRect, setNavigationBarColor, getSystemInfoSync } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { getContrastYIQ, nav, route, pages as routePages, useRoute, px } from '@/duxapp/utils'
import theme from '@/duxapp/config/theme'
import { TopView } from '../TopView'

import back from './images/back.png'
import backWhite from './images/back-white.png'
import home from './images/home.png'
import homeWhite from './images/home-white.png'

import './index.scss'

const headerContext = createContext({})

const useContext = () => useReactContext(headerContext)

export const HeaderBack = ({
  show
}) => {

  const option = useContext()

  const color = getContrastYIQ(option.color)

  return (option.isBack || option.isBackHome || show) && <View
    className='Header__nav__left'
    style={option.weapp ? { width: px(80) } : {}}
    onClick={() => {
      if (option.onBackClick?.()) {
        return
      }
      option.isBack ? nav('back:') : option.isBackHome ? nav('back:home') : ''
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

export const Header = ({
  color = theme.header.textColor, // 文字及返回按钮颜色 默认自动处理
  title, // 标题
  navTitle = title, // h5端页面标题
  absolute = false, // 是否使用绝对定位，不占位置
  show = true, // 是否显示配合absolute使用，直接使用则会直接出现
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

  const { path } = useRoute()

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

  const option = useMemo(() => {
    let headerHeihgt = 44
    // 小程序胶囊按钮宽度
    let jiaonangWidth = 0
    // 获取胶囊信息
    const statusBarHeight = getSystemInfoSync().statusBarHeight || 0
    if (isWeapp) {
      const { width, height, top } = getMenuButtonBoundingClientRect()
      jiaonangWidth = width + 10
      // 动态计算header高度，让header文本和胶囊完全居中
      headerHeihgt = height + (top - statusBarHeight) * 2
    }

    const current = routePages[path]

    const { pages, paths } = route.getPathPosition(Object.keys(routePages)[0])

    const rn = process.env.TARO_ENV === 'rn'
    const h5 = process.env.TARO_ENV === 'h5'

    const weapp = !rn && !h5

    // 是否显示header
    const showHeader = rn || isWeapp || (global.platform === 'wechat' && theme.header.showWechat)
      || (global.platform === 'wap' && theme.header.showWap)
      || !!renderMain || !!renderHeader

    const bgColor = style?.backgroundColor || theme.header.color

    const showHeight = headerHeihgt + (showStatus ? 0 : rn ? statusBarHeight : h5 ? 0 : statusBarHeight)

    return {
      onBackClick,
      headerHeihgt,
      statusBarHeight,
      isBack: pages.length > 1,
      isBackHome: paths[0] === undefined && !current?.home,
      jiaonangWidth,
      rn,
      h5,
      weapp,
      showHeader,
      bgColor,
      color,
      showHeight
    }

  }, [color, onBackClick, path, renderHeader, renderMain, showStatus, style?.backgroundColor])

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

  const headerHeight = option.rn ? option.headerHeihgt : option.h5 ? px(88) : `${option.headerHeihgt}px`

  return <headerContext.Provider value={option}>
    {
      option.showHeader ? <>
        {!show && showStatus && <View
          style={{
            height: option.rn
              ? option.statusBarHeight
              : option.h5
                ? 0
                : `${option.statusBarHeight}px`,
            backgroundColor: option.bgColor
          }}
        />}
        {(show || absolute) && <View
          style={style}
          className={`Header${absolute ? ' Header--absolute' : ''}`}
          {...props}
        >
          {(!absolute || option.rn) && <View
            style={{
              height: option.rn
                ? option.showHeight
                : `${option.showHeight}px`
            }}
          />}
          <View
            style={{
              backgroundColor: option.bgColor
            }}
            className={`Header__main${show ? ' Header__main--show' : ''}`}
          >
            {
              option.rn
                ? <View style={{ height: option.statusBarHeight }} />
                : <View style={{ height: `${option.statusBarHeight}px` }} />
            }
            {
              renderHeader
                ? <View style={{ paddingRight: option.jiaonangWidth, height: headerHeight }}>{renderHeader}</View>
                :
                <View
                  className='Header__nav'
                  style={{ height: headerHeight }}
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
                          textAlign: option.weapp && (option.isBack || !titleCenter) ? 'left' : 'center',
                          // 小程序没有返回按钮时，文本不要在最左边
                          paddingLeft: px(option.weapp && !option.isBack && !titleCenter ? 32 : 0),
                        }}
                      >{title}</Text>
                    }
                  </View>
                  {(option.isBack || option.isBackHome || !!renderRight) && <View className='Header__nav__right'
                    style={option.weapp
                      ? {
                        marginRight: option.jiaonangWidth + 'px'
                      } : {}}
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

Header.Back = HeaderBack

const isWeapp = ['weapp', 'tt', 'alipay', 'swan', 'qq', 'jd', 'quickapp'].includes(process.env.TARO_ENV)
