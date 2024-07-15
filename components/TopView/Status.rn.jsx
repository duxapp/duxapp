import { StatusBar } from 'react-native'

export const Status = ({ barStyle }) => {

  // barStyle ['light-content', 'dark-content', 'default']
  return <StatusBar
    animated
    hidden={false}
    backgroundColor='transparent'
    translucent
    barStyle={barStyle}
  />
}
