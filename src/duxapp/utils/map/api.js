import Taro from '@tarojs/taro'
import { getLocationBase } from '@/duxapp/utils'

import { mapConfig } from './config'

export const mapApi = {
  request: async (url, data) => {
    const res = await Taro.request({
      url: 'https://restapi.amap.com/v3/' + url,
      data: {
        key: mapConfig.apiKey,
        ...data
      }
    })
    if (res.statusCode === 200 && res.data.status === '1') {
      return res.data
    } else {
      console.log(res.data)
      throw res.data
    }
  },

  /**
   * 地址解析 通过地址信息获得经纬度
   * @param {string} address 地址信息
   */
  getGeocode: async address => {
    const res = await mapApi.request('geocode/geo', {
      address
    })
    const item = res.geocodes[0]
    return {
      province: item.province,
      city: item.city,
      code: item.adcode,
      longitude: Number(item.location.split(',')[0]),
      latitude: Number(item.location.split(',')[1])
    }
  },

  /**
   * 逆地址解析 通过经纬度信息获得地址信息
   * @param {string} longitude 精度
   * @param {string} latitude 纬度
   * @param {string} isPoi 是否用pio信息替代地址信息
   */
  getRegeo: async (longitude, latitude, isPoi = false) => {
    const res = await mapApi.request('geocode/regeo', {
      location: longitude + ',' + latitude,
      extensions: 'all',
      radius: 100,
      roadlevel: 0
    })
    const item = res.regeocode.addressComponent
    const name = res.regeocode.formatted_address
    const add = `${item.province}${item.city}${item.district}${item.township}`
    const poi = res.regeocode.pois.map(poiItem => ({ distance: Number(poiItem.distance), name: poiItem.name })).sort((a, b) => a.distance - b.distance)[0]
    const data = {
      ...item,
      code: item.adcode,
      addname: name.substr(name.indexOf(add) + add.length) || name,
      longitude,
      latitude
    }
    if (isPoi && poi && Number(poi.distance) <= 100) {
      data.addname = poi.name
    }
    return data
  },


  /**
   * 解析最近的pio信息
   * @param {*} longitude
   * @param {*} latitude
   */
  getPoi: async (longitude, latitude) => {
    const types = (() => {
      const typesArr = []
      for (let i = 1; i <= 15; i++) {
        typesArr.push((i < 10 ? '0' + i : i) + '0000')
      }
      return typesArr.join('|')
    })()
    const res = await mapApi.request('place/around', {
      location: longitude + ',' + latitude,
      radius: 100,
      types: types
    })
    const item = res.pois[0]
    if (!item) {
      return mapApi.getRegeo(longitude, latitude)
    }
    const location = item.location.split(',').map(e => Number(e))
    return {
      adcode: item.adcode,
      address: item.address,
      addname: item.name,
      city: item.cityname,
      citycode: item.citycode,
      code: item.pcode,
      country: '中国',
      district: item.adname,
      latitude: location[1],
      longitude: location[0],
      province: item.pname,
      towncode: item.gridcode,
      township: ''
    }
  },

  /**
   * 获取周边地址列表
   * @param {*} lat
   * @param {*} lng
   */
  getAround: async (lat, lng) => {
    let latitude = lat
    let longitude = lng
    if (!latitude || !longitude) {
      const { latitude: _latitude, longitude: _longitude } = await getLocationBase()
      latitude = _latitude
      longitude = _longitude
    }
    const types = (() => {
      const typesArr = []
      for (let i = 1; i <= 15; i++) {
        typesArr.push((i < 10 ? '0' + i : i) + '0000')
      }
      return typesArr.join('|')
    })()
    const res = await mapApi.request('place/around', {
      location: longitude + ',' + latitude,
      radius: 300,
      types: types
    })
    let list = []
    for (let i = 0; i < res.pois.length; i++) {
      const item = res.pois[i];
      const location = item.location.split(',')
      list.push({
        latitude: location[1],
        longitude: location[0],
        adcode: item.adcode,
        address: item.address,
        addname: item.name,
        city: item.cityname,
        citycode: item.citycode,
        code: item.pcode,
        country: '中国',
        district: item.adname,
        province: item.pname,
        towncode: item.gridcode,
        township: ''
      })
    }
    return list
  }
}
