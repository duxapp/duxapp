import { Fragment, useMemo } from 'react'

export class RenderHook {

  elements = {}

  addElement = (mark, type, element) => {
    if (!this.elements[mark]) {
      this.elements[mark] = {
        self: [],
        before: [],
        after: [],
        container: []
      }
    }
    this.elements[mark][type].push(...element)
  }

  add = (mark, ...element) => {
    this.addElement(mark, 'self', element)
  }

  addBefore = (mark, ...element) => {
    this.addElement(mark, 'before', element)
  }

  addAfter = (mark, ...element) => {
    this.addElement(mark, 'after', element)
  }

  addContainer = (mark, ...container) => {
    this.addElement(mark, 'container', container)
  }

  useMark = (mark, type = 'self') => {
    return this.elements[mark]?.[type] || []
  }

  getMark = (mark, type = 'self') => {
    return this.elements[mark]?.[type] || []
  }

  Render = ({ mark, children, option, max }) => {

    const [element, markItem] = useMemo(() => {
      const _markItem = this.elements[mark] || {}
      const _element = _markItem.self?.length
        ? [...(max ? _markItem.self.slice(_markItem.self.length - max) : _markItem.self)]
        : typeof children !== 'undefined'
          ? [children]
          : []

      if (_markItem.before?.length) {
        _element.unshift(..._markItem.before)
      }
      if (_markItem.after?.length) {
        _element.push(..._markItem.after)
      }
      return [
        _element.map(
          (item, index) => {
            if (typeof item === 'function') {
              const Item = item
              return <Item key={index} {...option}>{children}</Item>
            } else if (item instanceof Array && typeof item[0] === 'function') {
              const [Item, props] = item
              return <Item key={index} {...props} {...option}>{children}</Item>
            } else {
              return <Fragment key={index}>
                {item}
              </Fragment>
            }
          }
        ),
        _markItem
      ]
    }, [children, mark, max, option])

    if (!markItem.container?.length) {
      return element
    }

    return <Container containers={markItem.container} option={option}>
      {element}
    </Container>
  }
}

const Container = ({ containers, option, index = 0, children }) => {
  if (!containers?.length || index === containers.length) {
    return children
  }

  const Item = containers[index]

  return <Item {...option}>
    <Container index={index + 1} containers={containers} option={option}>
      {children}
    </Container>
  </Item>
}

export const duxappHook = new RenderHook()
