import { useEffect, useMemo, memo, useRef, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { VirtualList } from '@tarojs/components-advanced/dist/components/virtual-list'
import { VirtualWaterfall } from '@tarojs/components-advanced/dist/components/virtual-waterfall'
import { useDidShow, getSystemInfoSync } from '@tarojs/taro'
import { noop } from '@/duxapp/utils'
import classNames from 'classnames'
import { ListLoading } from './Loading'
import { ListSelect } from './Select'
import { ScrollView } from '../ScrollView'
import { FlatList } from '../FlatList'
import { Layout } from '../Layout'
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

const itemSize = px => px * getSystemInfoSync().screenWidth / 750

export const createList = usePageData => {
  const List = ({
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
    columns = 1,
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
    useVirtualList,
    virtualListProps,
    virtualWaterfallProps,
    ...props
  }) => {

    const [list, action] = usePageData({ url, data, ...requestOption }, { field: listField, listCallback, cache, ...option })

    const ref = useRef({})
    ref.current = { list, action }

    const [height, setHeight] = useState(0)

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

    const { type } = ListSelect.useContext()

    const RenderItem = useMemo(() => {
      return memo(({ data: itemData, id, index, item = itemData?.[index], ...itemProps }) => {
        return <ListSelect.Item item={item} index={index} id={id}>
          <Item item={item} id={type ? undefined : id} index={index} {...itemProps} {...ref.current} />
        </ListSelect.Item>
      })
    }, [type])

    const refresh = action.loading && action.refresh

    const loadMore = (page && !action.refresh && list.length > 5 || (action.loadEnd && !emptyStatus)) && <ListLoading
      loading={action.loading}
      text={action.loading ? '加载中' : action.loadEnd ? '没有更多了' : '上拉加载'}
    />

    // 非RN端虚拟列表
    const isWaterfall = useVirtualList && columns > 1

    const VList = isWaterfall ? VirtualWaterfall : VirtualList

    const [Top, Bottom] = useVirtualList && process.env.TARO_ENV !== 'rn' ? [
      () => <>
        {renderHeader}
        {emptyStatus && (renderEmpty || <Empty onEmptyClick={onEmptyClick} emptyTitle={emptyTitle} />)}
      </>,
      () => <>
        {renderFooter}
        {loadMore}
      </>
    ] : []

    return <ListSelect>
      {
        process.env.TARO_ENV === 'rn' ?
          <FlatList
            nestedScrollEnabled
            numColumns={columns}
            refresh={refresh}
            {...props}
            onScrollToLower={page && action.next || noop}
            onRefresh={action.reload}
            keyExtractor={(item, index) => item[keyField] || index}
            data={list}
            renderItem={RenderItem}
            ItemSeparatorComponent={renderLine}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={!action.loading && (renderEmpty || <Empty onEmptyClick={onEmptyClick} emptyTitle={emptyTitle} />)}
            ListFooterComponent={<>
              {renderFooter}
              {loadMore}
            </>}
          /> : useVirtualList ? (
            height > 0 ?
              <VList
                height={height}
                column={columns}
                className={props.className}
                style={props.style}
                itemData={list}
                itemCount={list.length}
                item={RenderItem}
                // 下拉刷新了上拉加载
                lowerThreshold={200}
                onScrollToLower={page && action.next || noop}
                refresherEnabled={refresh !== undefined}
                refresherThreshold={50}
                onRefresherrefresh={() => {
                  !refresh && action.reload()
                }}
                refresherTriggered={!!refresh}
                refresherBackground='transparent'
                // 自定义渲染
                renderTop={isWaterfall ? Top : <Top />}
                renderBottom={isWaterfall ? Bottom : <Bottom />}

                {...(isWaterfall ? virtualWaterfallProps : virtualListProps)}
              /> :
              <Layout
                className={classNames('flex-grow', props.className)}
                style={props.style}
                onLayout={e => setHeight(e.height)}
              />
          ) :
            <ScrollView
              refresh={refresh}
              lowerThreshold={200}
              {...props}
              onScrollToLower={page && action.next || noop}
              onRefresh={action.reload}
            >
              {renderHeader}
              <View style={listStyle} className={listClassName}>
                {
                  emptyStatus ?
                    (renderEmpty || <Empty onEmptyClick={onEmptyClick} emptyTitle={emptyTitle} />) :
                    list.map((item, index) => <>
                      {!!index && renderLine}
                      <RenderItem key={item[keyField] || index} item={item} index={index} />
                    </>)
                }
              </View>
              {renderFooter}
              {loadMore}
            </ScrollView>
      }
      <ListSelect.Submit />
    </ListSelect>
  }

  List.itemSize = itemSize

  return List
}

