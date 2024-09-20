import { useMemo, useEffect, isValidElement, cloneElement, Fragment } from 'react'
import { ScrollView } from '../ScrollView'

/**
 * 用于详情页面的渲染
 * @param {*} param0
 * @returns
 */


export const createDetail = useRequest => {
  return ({
    url,
    data: requestData,
    method,
    cache,
    reloadForShow,
    detailCallback,
    defaultData,
    field,
    children,
    refresh = true,
    renderHeader,
    renderFooter,
    onAction,
    container: Container = Empty
  }) => {

    const [data, action] = useRequest({
      url,
      toast: true,
      data: requestData,
      method
    }, { detailCallback, field, defaultData, reloadForShow, cache })

    useEffect(() => {
      if (typeof onAction === 'function') {
        onAction?.(action)
      } else if (onAction) {
        onAction.current = action
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action])

    const child = useMemo(() => {
      if (typeof children === 'function') {
        const Child = children
        return <Child data={data} action={action} />
      }
      return isValidElement(children)
        ? cloneElement(children, { data, action })
        : children
    }, [action, children, data])

    return <Container data={data} action={action}>
      {renderHeader?.({ data, action })}
      <ScrollView
        refresh={refresh && action.status}
        onRefresh={action.reload}
      >
        {child}
      </ScrollView>
      {renderFooter?.({ data, action })}
    </Container>
  }
}

const Empty = ({ children }) => {
  return children
}
