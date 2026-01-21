/**
 * 计算两个位置之间的距离，单位米
 */
export const distance: (latA: number, lonA: number, latB: number, lonB: number) => number

/**
 * WGS-84 to GCJ-02
 * GPS坐标转火星坐标(高德)
 */
export const gcjEncrypt: (wgsLat: number, wgsLon: number) => {
  lat: number
  lng: number
}

/**
 * GCJ-02 to WGS-84
 * 火星坐标(高德)转GPS坐标
 */
export const gcjDecrypt: (gcjLat: number, gcjLon: number) => {
  lat: number
  lng: number
}

/**
 * GCJ-02 to WGS-84 exactly
 * 火星坐标(高德)转GPS坐标
 */
export const gcjDecryptExact: (gcjLat: number, gcjLon: number) => {
  lat: number
  lng: number
}

/**
 * GCJ-02 to BD-09
 * 火星坐标(高德)转百度坐标
 */
export const bdEncrypt: (gcjLat: number, gcjLon: number) => {
  lat: number
  lng: number
}

/**
 * BD-09 to GCJ-02
 * 百度坐标转火星坐标(高德)
 */
export const bdDecrypt: (bdLat: number, bdLon: number) => {
  lat: number
  lng: number
}

interface LocationResult {
  latitude: number
  longitude: number
  [key: string]: any
}

interface LocationTask<T = LocationResult> extends Promise<T> {
  /**
   * 预留给外部监听定位变化（当前实现不会主动触发）
   */
  onChange: (callback: (res: T) => void) => LocationTask<T>
}

/**
 * 获取经纬度信息
 * 返回的坐标系为 gcj02(火星坐标系)
 */
export const getLocationBase: (enableHighAccuracy?: boolean) => LocationTask<LocationResult>

export const AppMap: {
  /**
   * 判断是否安装高的地图APP
   */
  isInstallAmap: () => Promise<boolean>
  /**
   * 判断是否安装百度地图APP
   */
  isInstallBaiDuMap: () => Promise<boolean>
  /**
   * 传入位置信息，启动地图APP
   * 你应该使用路由里面的跳转到地址，这个方法仅适用于RN端
   */
  openMap: (pos: {
    latitude: number
    longitude: number
    name: string
    address: string
  }) => void
}
