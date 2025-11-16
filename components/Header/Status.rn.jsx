import { StatusBar } from 'react-native'

export const Status = ({ barStyle }) => {

  return <StatusBar
    animated
    hidden={false}
    backgroundColor='transparent'
    translucent
    barStyle={barStyle}
  />
}
