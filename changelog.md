# 1.0.77

## 修复
- 完善虚拟列表功能
- useRequest onError 支持自定义处理
- 将npm依赖移动到 package.json 文件
- 修正一些样式问题

# 1.0.74

## 字体图标支持放在本地

使用创建图标命令的时候，在链接后面加个参数 这个参数传入1，就是创建本地图标

## 修复RN报错

修复RN启动metro报错

# 1.0.72

## List
新增了在小程序和H5端开启虚拟列表的属性 `useVirtualList`，以及其对应的属性设置

## 数据管理
新增了监听没有本地环循的事件

## Types
修复了一些类型提示

## 修复

在模块中添加 browserslist，用来兼容小程序端无法上传，以及一些旧的机型报错的问题

# 1.0.69

## PullView

修复 `mask` 小程序端无效的问题

## hooks

将 `creatGlobalState` 调整为 `createGlobalState`
将 `creatContextState` 调整为 `createContextState`

## Types

修复一些types提示

# 1.0.63

## 主要更改
- Taro更新到4.0.5 RN更新到0.75
- 完善大量类型提示
- 完善开发文档[http://duxapp.com/](http://duxapp.com/)
- RN端引入@shopify/flash-list作为List组件实现
- 小程序端支持转换为rem布局

# 1.0.51
## 初步兼容支付宝、抖音小程序
- 更新cli兼容支付宝、抖音
- 修改Header组件兼容
- 修改Layout组件兼容
- 修改全局样式兼容

## getLocationBase
将RN端的方法移动到RN端模块

## 全局样式
修复错误的全局样式

# V2023-12-02
## 发布说明

- 发布首个版本
