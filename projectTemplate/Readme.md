# DUXAPP
duxapp是基于Taro开发的模块化的前端框架，同时支持小程序、H5、ReactNative。

## 创建

```bash
npx duxapp-cli create 项目名称
```

项目初始化后将会自动安装依赖，安装完成就可以打开项目进行开发了

## 使用

```bash
# duxapp自定义命令参数：在上面的命令的基础上新增参数
# 调试小程序端 打包基础模块
yarn dev weapp --app=duxapp
# 如果你没有duxui模块需要先安装
yarn duxapp app add duxui
# 调试小程序端 打包duxui模块
yarn dev weapp --app=duxui
```

## 开发文档

如何使用这个框架，请阅读开发文档

[duxapp.com](http://duxapp.com)
