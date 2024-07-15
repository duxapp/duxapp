import { useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { noop } from '@/duxapp/utils'
import { ListLoading } from './Loading'
import { ListSelect } from './Select'
import { ScrollView } from '../ScrollView'
import { FlatList } from '../FlatList'
import empty from './image/empty.png'
import './index.scss'

export {
  ListLoading
}

const Empty = ({
  onEmptyClick,
  emptyTitle
}) => {
  return <View
    className='list-empty'
    onClick={onEmptyClick}
  >
    <Image src={empty} className='list-empty__icon' />
    <Text className='list-empty__title'>{emptyTitle}</Text>
  </View>
}

export const createList = usePageData => {
  return ({
    renderItem: Item,
    renderLine,
    listCallback,
    listField = 'list',
    keyField = 'id',
    reloadForShow,
    url,
    data,
    requestOption,
    option,
    renderHeader,
    renderFooter,
    columns,
    // 是否分页 默认是有分页的 某些数据后台是一次性返回的，没有分页
    page = true,
    // 为空提示文字
    emptyTitle = '暂无数据',
    // 自定义为空时候的提示渲染
    renderEmpty,
    // 为空部分点击事件
    onEmptyClick,
    // 数据操作的回调
    onAction,
    // 是否启用缓存
    cache,
    listStyle,
    listClassName,
    ...props
  }) => {

    const [list, action] = usePageData({ url, data, ...requestOption }, { field: listField, listCallback, cache, ...option })
    useDidShow(() => {
      if (option?.ready === false) {
        return
      }
      // 在上面页面关掉的时候刷新数据
      reloadForShow === true && action.reload()
    })

    // 如果传入TabBar组件，则使用TabBar组件的显示hook加载数据
    reloadForShow?.useShow?.(() => {
      if (option?.ready === false) {
        return
      }
      action.reload()
    })

    useEffect(() => {
      if (typeof onAction === 'function') {
        onAction?.(action)
      } else if (onAction) {
        onAction.current = action
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action])

    const emptyStatus = !action.loading && !list.length

    return <ListSelect>
      {
        process.env.TARO_ENV === 'rn' ?
          <FlatList
            nestedScrollEnabled
            numColumns={columns}
            refresh={action.loading && action.refresh}
            {...props}
            onScrollToLower={page && action.next || noop}
            onRefresh={action.reload}
            keyExtractor={(item, index) => item[keyField] || index}
            data={list}
            renderItem={({ item, index }) => {
              return <ListSelect.Item key={item[keyField] || index} item={item} index={index}>
                <Item item={item} index={index} list={list} action={action} />
              </ListSelect.Item>
            }}
            ItemSeparatorComponent={renderLine}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={!action.loading && (renderEmpty || <Empty onEmptyClick={onEmptyClick} emptyTitle={emptyTitle} />)}
            ListFooterComponent={<>
              {renderFooter}
              {(page && !action.refresh && list.length > 5 || (action.loadEnd && list.length !== 0)) && <ListLoading
                loading={action.loading}
                text={action.loading ? '加载中' : action.loadEnd ? '没有更多了' : '上拉加载'}
              />}
            </>}
          /> :
          <ScrollView
            refresh={action.loading && action.refresh}
            {...props}
            onScrollToLower={page && action.next || noop}
            onRefresh={action.reload}
          >
            {renderHeader}
            <View style={listStyle} className={listClassName}>
              {
                emptyStatus ?
                  (!action.loading && (renderEmpty || <Empty onEmptyClick={onEmptyClick} emptyTitle={emptyTitle} />)) :
                  list.map((item, index) => <>
                    {!!index && renderLine}
                    <ListSelect.Item key={item[keyField] || index} item={item} index={index}>
                      <Item item={item} index={index} list={list} action={action} />
                    </ListSelect.Item>
                  </>)
              }
            </View>
            {renderFooter}
            {(page && !action.refresh && list.length > 5 || (!emptyStatus && action.loadEnd)) && <ListLoading
              loading={action.loading}
              text={action.loading ? '加载中' : action.loadEnd ? '没有更多了' : '上拉加载'}
            />}
          </ScrollView>
      }
      <ListSelect.Submit />
    </ListSelect>
  }
}

