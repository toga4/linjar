import { Fragment, VNode } from './vnode'

export const render = (node: VNode | string): string => {
  if (typeof node === 'string') {
    return escape(node)
  }

  const type = node.type
  const attributes = node.attributes || {}
  const children = node.children.flat()

  const renderChildren = () => children.map((child) => render(child)).join('')

  if (type === Fragment) {
    return renderChildren()
  }
  if (typeof type === 'function') {
    return render(type({ ...attributes, children }))
  }

  const { dangerouslySetInnerHTML: raw, ...attrsWithoutRawHtml } = attributes

  const attrClause = Object.entries(attrsWithoutRawHtml)
    .map(([attrName, attrValue]) => ` ${attrName}="${escape(attrValue)}"`)
    .join('')

  const innerHtml = raw?.__html || renderChildren()

  return `<${type}${attrClause}>${innerHtml}</${type}>`
}

const escape = (value: unknown): string => {
  if (typeof value !== 'string') {
    return String(value)
  }

  return value
    .replace('&', '&amp;')
    .replace('<', '&lt;')
    .replace('>', '&gt;')
    .replace('"', '&quot;')
}
