module.exports = async function init(info, {
  inquirer,
  path,
  file,
  project,
  coding,
  rn,
  util,
  android
}) {
  console.log('[2/3]模板处理中...')
  // 删除当前的远程地址 避免同步到远程
  await coding.clearRemote(info.name)

  // 处理 ReactNative 端 CodePush 等
  rn.packageName(info.name, info.description)
  rn.appName(info.displayName)
  await rn.appID()
  try {
    await android.keystore()
  } catch (error) {
    console.log('安卓端证书生成失败', error)
  }

  // 清理资源
  project.clearStatic()

  // 删除初始化文件
  file.delete('duxapp.init.js')
  console.log('[3/3]安装依赖(时间较长，你可以取消进程手动安装)...')
  await util.asyncExec(`cd ${info.name} && yarn`)
  console.log(`项目初始化成功 请打开 ${info.name} 目录，开始编码`)
}
