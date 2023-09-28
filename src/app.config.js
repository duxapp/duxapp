import route from './route'
import duxapp from './duxappTaroEntry'

// eslint-disable-next-line no-undef
const config = {
  window: {
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black',
    // 自定义头部
    navigationStyle: 'custom',
    // 禁用页面滚动
    disableScroll: true,
  },
  // 开启动画
  animation: {
    duration: 300
  },
  // h5要在哪个节点渲染
  appId: 'app',
  pages: [],
  subPackages: [],
  ...duxapp.appConfig,
  rn: {
    useNativeStack: true,
    ...duxapp.appConfig?.rn
  }
}

const pageFilter = item => {
  // 判断平台
  if (item.platform && !item.platform?.includes(process.env.TARO_ENV)) {
    return false
  }
  // 判断是否禁用
  if (duxapp.disablePages?.some(page => item.page.includes(page))) {
    return false
  }
  // 判断默认是否启用
  if (item.disable && !duxapp.openPages?.includes(item.page)) {
    return false
  }
  return true
}

config.subPackages = []
const _pages = Object.values(route).map(v => {
  return Object.entries(v.pages).map(([_path, _config]) => {
    if (v.path) {
      const paths = _path.split('/')
      paths.splice(1, 0, v.path)
      _path = paths.join('/')
    }
    return [_path, _config]
  })
}).flat()

// 首页页面 这些页面将会优先排到前面
const homePages = []

config.pages.push(..._pages
  .map(([key, _config]) => {
    const { pages: subPages, subPackage, ...arg } = _config
    if (subPages && subPackage) {
      const keys = Object.keys(subPages).filter(item => pageFilter({ ...arg, ...subPages[item], page: `${key}/${item}` }))
      if (keys.length) {
        config.subPackages.push({
          root: `${key}/`,
          pages: keys
        })
      }
      // 分包
      return []
    } else if (subPages) {
      // 未分包的分组
      return Object.keys(subPages)
        .filter(item => pageFilter({ ...arg, ...subPages[item], page: `${key}/${item}` }))
        .map(item => {
          const page = `${key}/${item}`
          if (subPages[item].home) {
            homePages.push(page)
          }
          return page
        })
    } else {
      // 普通页面
      return [key].filter(() => pageFilter({ ...arg, page: key })).map(page => {
        if (_config.home) {
          homePages.push(page)
        }
        return page
      })
    }
  })
  .flat()
  // 去重 排序
  .reduce((prev, current, index, arr) => {
    if (homePages.includes(current)) {
      prev[0].push(current)
    } else {
      prev[1].push(current)
    }
    if (index === arr.length - 1) {
      return [...new Set(prev.flat())]
    } else {
      return prev
    }
  }, [[], []])
)

export default config
