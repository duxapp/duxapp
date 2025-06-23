const capitalizeFirstLetter = str => {
  if (typeof str !== 'string') {
    return ''
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const scssData = {
  '': [`// ---- 基础模块主题配置 ----

// 基础样式
$duxappPrimaryColor: #337ab7;
$duxappSecondaryColor: #5bc0de;
$duxappSuccessColor: #34a853;
$duxappDangerColor: #ea4335;
$duxappWarningColor: #fbbc05;
$duxappPageColor: #fafbf8;

$duxappWhiteColor: #fff;
$duxappBlackColor: #000;
$duxappLineColor: #f5f5f5;

$duxappCustomColor1: #337ab7;
$duxappCustomColor2: #337ab7;
$duxappCustomColor3: #337ab7;

$duxappTextColor1: #373D52;
$duxappTextColor2: #73778E;
$duxappTextColor3: #A1A6B6;
$duxappTextColor4: #FFF;

$duxappTextSize1: 24px;
$duxappTextSize2: 26px;
$duxappTextSize3: 28px;
$duxappTextSize4: 30px;
$duxappTextSize5: 32px;
$duxappTextSize6: 34px;
$duxappTextSize7: 36px;

$duxappRadius: 16px;
`],
  header: [`
// Header组件
$duxappHeaderColor: #fff;
$duxappHeaderTextColor: #000;`]
}

export default theme => {
  Object.keys(theme).forEach(key => {
    const value = theme[key]
    if (typeof value !== 'object') {
      scssData[''].push(`$duxapp${capitalizeFirstLetter(key)}: ${typeof value === 'number'
        ? `${value}px`
        : value
        };`
      )
    } else {
      switch (key) {
        case 'header': {
          if (value.color) {
            scssData.header.push(`$duxappHeaderColor: ${value.color};`)
          }
          if (value.textColor) {
            scssData.header.push(`$duxappHeaderTextColor: ${value.textColor};`)
          }
          break
        }
      }
    }
  })
  return Object.keys(scssData).map(key => {
    scssData[key].splice(1, 0, '\n// 用户样式')
    return scssData[key].join('\n')
  }).join('\n')
}
