import { FlatList as FlatListRN } from 'react-native'

export const FlatList = ({ refresh, onScrollToLower, ...props }) => {

  return <FlatListRN
    refreshing={refresh}
    onEndReached={onScrollToLower}
    onEndReachedThreshold={0.2}
    {...props}
  />
}
