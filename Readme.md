# duxapp

duxapp框架的基础模块，里面放了框架必备组件、函数、主题系统、全局样式等

## 安装

```bash
yarn duxapp app add duxapp
```

此模块需要在 [duxapp 框架](https://app.docs.dux.plus) 中运行

## 文档

[http://www.duxapp.cn/docs/duxapp/start](http://www.duxapp.cn/docs/duxapp/start)

## 组件库

### TopView
框架最基础的组件，用于页面嵌套，需要在每个页面的最外层嵌套上此组件，且每个页面只能放一次  
弹窗、路由等功能与此组件息息相关，如果不放此组件将无法实现这些功能  

推荐使用示例
```jsx
import { View } from '@tarojs/components'
import { Header, ScrollView, TopView } from '@/duxapp'

import './index.scss'

export default TopView.HOC(function Duxapp() {

  return <>
    <Header title='duxapp' titleCenter />
    <ScrollView>
      <View className='duxapp-demo__title'>欢迎使用duxapp</View>
      <View className='duxapp-demo__p'>添加模块: yarn duxapp app add app名称</View>
      <View className='duxapp-demo__p'>创建模块: yarn duxapp app create app名称</View>
    </ScrollView>
  </>
})

```

### Header
头部导航组件，如上面的示例中的Header，组件需要放在组件的第一个，集成了返回，返回主页等功能

### ScrollView
滚动条组件，组件有 `flex: 1`属性，自动占据最大空间，如上面的示例所示，滚动将占据头部以外的所有空间，请特别注意  

- 组件集成了多个平台的下拉刷新功能
- 横向滚动请使用 `ScrollView.Horizontal` 组件

### PullView
弹出组件，可以定义从上下左右四个方向弹出的组件
```jsx
<PullView onClose={() => console.log('关闭')}>
  <Text>弹出内容</Text>
</PullView>
```

此组件是基于TopView组件实现的

### Absolute
次组件可以将子元素转发到最外层渲染，用来实现全局弹窗的效果
```jsx
<Absolute>
  <View className='absolute inset-0'>
    <Text>弹出内容</Text>
  </View>
</PullView>
```

### RenderHook
渲染钩子，这是一个工具库，用于在页面或者组件定义钩子，然后在合适的位置指定钩子，将内容插入到钩子的位置进行渲染,使用方法，请查看组件的d.ts文件  

这在多模块系统中开发一些公共模块来说，是很有效的工具

### Loading
菊花加在中效果

### List
分页列表组件。  

如果后端提供的接口是使用get参数的page进行分页的，可以使用此组件极大的简化列表开发的难度，这个组件集成了下拉刷新，上拉分页、加载完成等

```jsx
import { Empty, Column, Header, Text, TopView, Status } from '@/duxui'
import { List } from '@/duxslim'

export default function GroundLog() {

  return <TopView>
    <Header title='申请记录' />
    <List
      url='mode/landing'
      renderItem={Item}
      renderEmpty={<Empty title='暂无记录' />}
    />
  </TopView>
}

const Item = ({ item }) => {
  return <Column className='gap-2 mt-3 mh-3 bg-white r-2 p-3 overflow-hidden'>
    <Status horizontal='right' status={<Status.Common size='l' radius>{item.status}</Status.Common>} />
    <Text size={4} bold>{item.type}</Text>
    <Text className='mt-2'>申请时间：{item.created_at}</Text>
    <Text>申请地区：{item.city}{item.region}</Text>
    <Text className='mt-1'>备      注：{item.note}</Text>
  </Column>
}
```
需要注意的是List组件需要先创建后使用，传入的`usePageData`，在后面的函数库中会有介绍

```js
import { createDetail, createList } from '@/duxapp/components'

const Detail = createDetail(useRequest)
const List = createList(usePageData)

export {
  Detail,
  List
}

```

### Detail
详情页面组件，与列表组件类似，详情页面也是集成了下拉刷新等功能的快速开发页面的组件，使用方法可以参考duxui示例代码库

### Layout
用于获取布局信息的组件，请参考duxui示例代码库

### ActionSheet
弹出列表组件

## 函数库
### 路由
在duxapp中跳转页面，请使用次模块提供的路由方法，路由方法经过封装，支持一下功能

- 路由拦截器
- 网址跳转
- 地图跳转
- 支持传递复杂对象到下一个页面
- 跳转页面获取返回参数
- 支持按协议进行跳转，方便后端进行返回跳转路由

```js
import { route, nav, useRoute } from '@/duxapp'

nav('duxapp/index/index') // 等同于
route.push('duxapp/index/index')

nav('redirect:duxapp/index/index') // 等同于
route.redirect('duxapp/index/index')

nav('back:') // 等同于
route.back()

// 获取跳转参数
const { backData } = await nav('duxapp/index/index')
const pageData = await backData() // pageData 就是跳转过去的页面返回的参数

// 在跳转过去的页面执行
nav('back:', { data: '这是返回上一个页面的参数' })

// 路由拦截
route.onNavBefore(async (params, option) => {
  if(xxx) {
    throw '抛出错误 会终止页面跳转'
  }
})

// 路由钩子
const { params } = useRoute()
// params 页面参数
```

### 请求、上传
请使用模块提供的请求方法，请求方法集成了请求拦截器、请求loading，请求错误提示，过快请求拦截等功能、具体用法参阅 duxcms模块

针对请求方法，扩展了请求钩子、分页请求钩子，传入的request参数是通过创建请求函数创建的

```jsx


const { request, throttleRequest, middle: requestMiddle } = createRequest(duxcmsRequestConfig)

const { upload, uploadTempFile, middle: uploadMiddle } = createUpload(duxcmsRequestConfig)

const { useRequest, usePageData } = createRequestHooks(request)

// 请求使用示例
const res = await request('content/article')
const res = await request({
  url: 'content/article',
  method: 'POST',
  loading: true,
  toast: true
})
// 上传使用示例
const urls = upload('image', { count: 1 })
const urls = upload('video')
// 请求钩子
const [data] = useRequest('content/article')
const [data] = useRequest({
  url: 'content/article',
  method: 'POST',
  loading: true,
  toast: true
})
```

### 全局用户配置
用户读取用户的配置文件内容，仅duxapp模块中才会提供次配置的导出

```js
import { userConfig } from '@/duxapp'

console.log(userConfig.option.duxapp)
```

### 全局状态

```jsx
import { creatGlobalState, contextState } from '@/duxapp'

/** APP全局状态 */
const globalState = creatGlobalState({ text: '默认值' })

// 任何地方设置值
globalState.setState({ text: '设置的值' })

// 在组件或者hook中取值
const data = globalState.useState()

/** 局部状态 */
// 在contextState.Provider范围内的组件将共享状态值和设置状态值的函数
const Top = () => {
  return <contextState.Provider>
    <Child1 />
    <Child2 />
  </contextState.Provider>
}

const Child1 = () => {
  const [data, setData] = contextState.useState()
}

const Child2 = () => {
  const [data, setData] = contextState.useState()
}
```

### 字体
集成了一个支持多端的图标字体功能，下面是一个集成字体图标的方法示例

```js
import { Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useMemo } from 'react'
import { font } from '@/duxapp'
import icons from './icons.json'
import './index.scss'

font.load('BaseIcon', 'https://pictcdn.client.jujiang.me/fonts/BaseIcon.1700126329540.ttf')

export const BaseIcon = ({ name, color, size, style, className, ...props }) => {

  const _style = useMemo(() => {
    const sty = { ...style }
    if (color) {
      sty.color = color
    }
    if (size) {
      sty.fontSize = px(size)
    }
    return sty
  }, [color, size, style])

  if (!icons[name]) {
    return console.log(`BaseIcon的${name}图标不存在`)
  }

  const status = font.useFont('BaseIcon')

  if (!status) {
    return null
  }

  return <Text
    className={`BaseIcon${className ? ' ' + className : ''}`}
    style={_style}
    {...props}
  >
    {String.fromCharCode(icons[name])}
  </Text>
}

```

### 经纬度相关
- 集成个 wgs85 gcj02 bd09各个坐标系之间的转换功能
- 坐标距离计算
- 获取当前GPS坐标函数

### 颜色相关
- 颜色加深
- 颜色减淡
- 颜色转换为rbg参数

### 数据存储(ObjectManage)
提供了数据本地缓存、数据调用钩子，这是一个类，需要new，或者扩展此类进行使用  

例如存储用户信息到本地，并且通过hook能获取到存储的数据，而且能设置是用户信息，并且这个钩子将是全局的，任何地方都能调用到存储的用户信息

### 日期相关
请参考 dayjs 文档

### 其他工具
- toast 显示一个轻提示
- isIphoneX 判断是不是有刘海的机型
- asyncTimeOut 倒计时定时器的异步封装
- getPlatform 获取当前平台标识
- stopPropagation 防止事件穿透的函数
- px Taro.pxTransform 的缩写版，且支持缓存

## 主题
这些是duxapp模块的主题配置内容，你可以将它配置在用户配置用，让不同的应用呈现不同的效果
```js
const config = {
  // General
  primaryColor: '#337ab7', // 主色
  secondaryColor: '#5bc0de', // 辅色
  successColor: '#34a853',
  dangerColor: '#ea4335',
  warningColor: '#fbbc05',
  pageColor: '#fafbf8',

  //用户自定义颜色1
  customColor1: '#337ab7',
  customColor2: '#337ab7',
  customColor3: '#337ab7',

  // 文本颜色 从暗色到亮色
  textColor1: '#373D52',
  textColor2: '#73778E',
  textColor3: '#A1A6B6',
  textColor4: '#FFF',

  // 文本尺寸 从小到大
  textSize1: 24,
  textSize2: 26,
  textSize3: 28,
  textSize4: 30,
  textSize5: 32,
  textSize6: 34,
  textSize7: 36,

  header: {
    color: '#fff', // 仅支持rgb hex值，请勿使用纯单词 设置为数组将显示一个渐变按钮
    textColor: '#000', // 文本颜色
    showWechat: false, // 微信公众号是否显示header
    showWap: true, // h5是否显示header
  }
}
```

如何使用主题配置

- 在scss文件中

```scss
color: $duxappPrimaryColor;
color: $duxappSecondaryColor;
color: $duxappSuccessColor;
color: $duxappDangerColor;

fontSize: $duxappTextSize1;
```
- 在jsx中

```jsx
import { duxappTheme } from '@/duxapp'

duxappTheme.primaryColor
duxappTheme.secondaryColor
duxappTheme.textColor1

```
你也可以给你的模块定制自己的主题，请参考duxapp模块的主题功能

## 全局样式
为了快速布局，duxapp提供了常见的样式，这样可以方便你快速完成页面的编写，而无需编写 scss 文件，下面这样样式你可以在任何地方进行引用

```scss

/*  #ifndef rn h5  */
page {
  height: 100vh;
}

/*  #endif  */

/*  #ifdef h5  */
.taro_page {
  height: 100vh;
}

/*  #endif  */


/*  #ifdef h5  */
taro-view-core {
  display: flex;
  flex-direction: column;
  position: relative;
  border-style: solid;
  border-width: 0;
}
input,
textarea,
taro-view-core {
  box-sizing: border-box;
}
taro-view-core,
taro-text-core {
  line-height: 1;
}
taro-image-core {
  width: auto;
  height: auto;
}
/*  #endif  */
/*  #ifndef rn h5  */
view {
  display: flex;
  flex-direction: column;
  position: relative;
  border-style: solid;
  border-width: 0;
}
input,
textarea,
view {
  box-sizing: border-box;
}
view,
text {
  line-height: 1;
}
/*  #endif  */

/*  #ifdef h5  */
taro-input-core {
  position: relative;

  input {
    position: absolute;
    transform: translateY(-50%);
    top: 50%;
  }
}

/*  #endif  */

/*  #ifdef weapp  */
.button-clean {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-left: initial;
  margin-right: initial;
  padding-left: initial;
  padding-right: initial;
  line-height: initial;
  font-size: initial;
  background-color: initial;
  border: initial;
  padding: 0;
  box-sizing: border-box;
  text-decoration: none;
  border-radius: 0;
  -webkit-tap-highlight-color: transparent;
  color: transparent;

  &::after {
    border: none;
  }
}

/*  #endif  */

.bg-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

/* overflow */
.overflow-hidden {
  overflow: hidden;
}

/* 定位 */
.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}

.top-0 {
  top: 0;
}

.right-0 {
  right: 0;
}

.bottom-0 {
  bottom: 0;
}

.left-0 {
  left: 0;
}

/* z-index */

.z-0 {
  z-index: 0;
}

.z-1 {
  z-index: 1;
}

.z-2 {
  z-index: 2;
}

/* flex */
.flex-row {
  flex-direction: row;
}

.flex-row-reverse {
  flex-direction: row-reverse;
}

.flex-col-reverse {
  flex-direction: column-reverse;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-wrap-reverse {
  flex-wrap: wrap-reverse;
}

.flex-grow {
  flex: 1;
}

.flex-shrink {
  flex-shrink: 0;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

.justify-evenly {
  justify-content: space-evenly;
}

.content-center {
  align-content: center;
}

.content-start {
  align-content: flex-start;
}

.content-end {
  align-content: flex-end;
}

.content-between {
  align-content: space-between;
}

.content-around {
  align-content: space-around;
}

.items-start {
  align-items: flex-start;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.items-baseline {
  align-items: baseline;
}

.self-start {
  align-self: flex-start;
}

.self-end {
  align-self: flex-end;
}

.self-center {
  align-self: center;
}

.self-stretch {
  align-self: stretch;
}

.self-baseline {
  align-self: baseline;
}

/* size */
.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.w-0 {
  width: 0;
}

.h-0 {
  height: 0;
}

/* 斜体 */
.italic {
  font-style: italic;
}

/* 加粗 */
.bold {
  font-weight: bold;
}

/* 文本对齐 */
.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-justify {
  text-align: justify;
}

/* 文本颜色 */
.text-transparent {
  color: transparent;
}

.text-black {
  color: #000;
}

.text-white {
  color: #fff;
}

.text-c1 {
  color: $duxappTextColor1;
}

.text-c2 {
  color: $duxappTextColor2;
}

.text-c3 {
  color: $duxappTextColor3;
}

.text-c4 {
  color: $duxappTextColor4;
}

.text-primary {
  color: $duxappPrimaryColor;
}

.text-secondary {
  color: $duxappSecondaryColor;
}

.text-success {
  color: $duxappSuccessColor;
}

.text-danger {
  color: $duxappDangerColor;
}

.text-warning {
  color: $duxappWarningColor;
}

// 文本尺寸
.text-s1 {
  font-size: $duxappTextSize1;
}

.text-s2 {
  font-size: $duxappTextSize2;
}

.text-s3 {
  font-size: $duxappTextSize3;
}

.text-s4 {
  font-size: $duxappTextSize4;
}

.text-s5 {
  font-size: $duxappTextSize5;
}

.text-s6 {
  font-size: $duxappTextSize6;
}

.text-s7 {
  font-size: $duxappTextSize7;
}

/* 文本装饰 */
.underline {
  text-decoration: underline;
}

.line-through {
  text-decoration: line-through;
}

/* 文本转换 */
.uppercase {
  text-transform: uppercase;
}

.lowercase {
  text-transform: lowercase;
}

.capitalize {
  text-transform: capitalize;
}

/* 边框颜色 */
.border-black {
  border-color: #000;
}

.border-white {
  border-color: #fff;
}

.border-primary {
  border-color: $duxappPrimaryColor;
}

.border-secondary {
  border-color: $duxappSecondaryColor;
}

.border-success {
  border-color: $duxappSuccessColor;
}

.border-danger {
  border-color: $duxappDangerColor;
}

.border-warning {
  border-color: $duxappWarningColor;
}

// 边框宽度
.border-w1 {
  border-width: 2px;
}

/* 边框样式 */
.border-dotted {
  border-style: dotted;
}

.border-dashed {
  border-style: dashed;
}

// 内边距
.p-1 {
  padding: 8px;
}

.p-2 {
  padding: 16px;
}

.p-3 {
  padding: 24px;
}

.pv-1 {
  padding-top: 8px;
  padding-bottom: 8px;
}

.pv-2 {
  padding-top: 16px;
  padding-bottom: 16px;
}

.pv-3 {
  padding-top: 24px;
  padding-bottom: 24px;
}

.ph-1 {
  padding-left: 8px;
  padding-right: 8px;
}

.ph-2 {
  padding-left: 16px;
  padding-right: 16px;
}

.ph-3 {
  padding-left: 24px;
  padding-right: 24px;
}

// 外边距
.m-1 {
  margin: 8px;
}

.m-2 {
  margin: 16px;
}

.m-3 {
  margin: 24px;
}

.mv-1 {
  margin-top: 8px;
  margin-bottom: 8px;
}

.mv-2 {
  margin-top: 16px;
  margin-bottom: 16px;
}

.mv-3 {
  margin-top: 24px;
  margin-bottom: 24px;
}

.mt-1 {
  margin-top: 8px;
}

.mt-2 {
  margin-top: 16px;
}

.mt-3 {
  margin-top: 24px;
}

.mt-3 {
  margin-top: 32px;
}

.mh-1 {
  margin-left: 8px;
  margin-right: 8px;
}

.mh-2 {
  margin-left: 16px;
  margin-right: 16px;
}

.mh-3 {
  margin-left: 24px;
  margin-right: 24px;
}

// 圆角
.r-1 {
  border-radius: 8px;
}

.r-2 {
  border-radius: 16px;
}

.r-3 {
  border-radius: 24px;
}

.r-max {
  border-radius: 750px;
}

.rt-1 {
  border-radius: 8px 8px 0 0;
}

.rt-2 {
  border-radius: 16px 16px 0 0;
}

.rt-3 {
  border-radius: 24px 24px 0 0;
}

.rb-1 {
  border-radius: 0 0 8px 8px;
}

.rb-2 {
  border-radius: 0 0 16px 16px;
}

.rb-3 {
  border-radius: 0 0 24px 24px;
}

// 间距
.gap-1 {
  gap: 8px;
}

.gap-2 {
  gap: 16px;
}

.gap-3 {
  gap: 24px;
}

.gap-4 {
  gap: 32px;
}

// 背景
.bg-white {
  background-color: white;
}

.bg-primary {
  background-color: $duxappPrimaryColor;
}

.bg-secondary {
  background-color: $duxappSecondaryColor;
}

.bg-success {
  background-color: $duxappSuccessColor;
}

.bg-danger {
  background-color: $duxappDangerColor;
}

.bg-warning {
  background-color: $duxappWarningColor;
}

.bg-page {
  background-color: $duxappPageColor;
}

// 其他
.square {
  aspect-ratio: 1;
}


```
