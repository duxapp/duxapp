import qs from 'qs'

const { pages, registerPages, pagesTransfer, routes } = (() => {

  const pageFilter = (item, { openPages, disablePages }) => {
    if (item.platform) {
      return item.platform?.includes(process.env.TARO_ENV)
    }
    // 判断是否禁用
    if (disablePages?.some(page => item.page.includes(page))) {
      return false
    }
    // 判断默认是否启用
    if (item.disable && !openPages?.includes(item.page)) {
      return false
    }
    return true
  }

  const _pages = {}

  const _pagesTransfer = {}

  const _routes = {}

  return {
    pages: _pages,
    pagesTransfer: _pagesTransfer,
    routes: _routes,
    registerPages: (route, userConfig) => {
      Object.keys(_pages).forEach(key => {
        delete _pages[key]
      })
      Object.keys(_routes).forEach(key => {
        delete _routes[key]
      })
      Object.keys(route).forEach(key => {
        _routes[key] = route[key]
      })

      const transfer = Object.values(route)
        .map(v => v.transfer
          ? Object.entries(v.transfer).map(([_path, _config]) => {
            const paths = _path.split('/')
            const appPath = route[paths[0]]?.path
            if (appPath) {
              paths.splice(1, 0, appPath)
              _path = paths.join('/')
            }
            return [_path, _config]
          })
          : []
        )
        .flat()
        .reduce((prev, [key, config]) => {
          if (typeof config === 'string') {
            prev.default[key] = config
          } else {
            prev.start[key] = config.page
          }
          return prev
        }, { default: {}, start: {} })
      _pagesTransfer.default = transfer.default
      _pagesTransfer.start = transfer.start

      const disablePages = Object.values(route).map(item => item.disablePages).flat().filter(v => v)
      const openPages = Object.values(route).map(item => item.openPages).flat().filter(v => v)

      Object.values(route)
        .map(v => {
          return Object.entries(v.pages).map(([_path, _config]) => {
            if (v.path) {
              const paths = _path.split('/')
              paths.splice(1, 0, v.path)
              _path = paths.join('/')
            }
            return [_path, _config]
          })
        })
        .flat()
        .map(([key, _config]) => {
          const { pages: subPages, subPackage, ...arg } = _config
          const pageConfig = {
            openPages: [
              ...openPages,
              ...(userConfig.openPages || [])
            ],
            disablePages: [
              ...disablePages,
              ...(userConfig.disablePages || [])
            ]
          }
          if (subPages) {
            // 分组
            return Object.keys(subPages).filter(item => pageFilter(
              { ...arg, ...subPages[item], page: `${key}/${item}` },
              pageConfig
            )).map(item => [`${key}/${item}`, { ...arg, ...subPages[item] }])
          } else {
            // 普通页面
            return [key].filter(() => pageFilter(
              { ...arg, page: key },
              pageConfig
            )).map(item => [item, arg])
          }
        })
        .flat()
        // 排序
        .reduce((prev, current, index, arr) => {
          if (current[1]?.home) {
            prev[0].push(current)
          } else {
            prev[1].push(current)
          }
          return prev
        }, [[], []])
        .flat()
        .forEach(([page, config]) => {
          _pages[page] = config
        })
    }
  }


})();

/**
 * 进行路由转换 如果经过了多次转换也会执行
 * @param {*} path
 * @param {*} params
 * @returns
 */
const pageTransfer = (path, params) => {
  const defaultKey = Object.keys(pagesTransfer.default).find(item => item.startsWith(path))
  if (defaultKey) {
    // 验证参数是否匹配
    const [, oldQuery] = defaultKey.split('?')
    let [mewPath, newQuery] = pagesTransfer.default[defaultKey].split('?')
    newQuery = newQuery ? qs.parse(newQuery) : {}
    if (oldQuery) {
      params = { ...params }
      const oldParams = qs.parse(oldQuery)
      const oldKeys = Object.keys(oldParams)
      if (oldKeys.every(key => oldParams[key] == params[key])) {
        oldKeys.forEach(key => delete params[key])
        return pageTransfer(mewPath, {
          ...params,
          ...newQuery
        })
      }
    } else {
      return pageTransfer(mewPath, {
        ...params,
        ...newQuery
      })
    }
  }
  const start = path.split('/').slice(0, 2).join('/')
  const startKey = Object.keys(pagesTransfer.start).find(item => item === start)
  if (startKey) {
    return pageTransfer(path.replace(startKey, pagesTransfer.start[startKey]), params)
  }
  return {
    path,
    params
  }
}

export default pages

export {
  pages,
  routes,
  registerPages,
  pagesTransfer,
  pageTransfer
}
