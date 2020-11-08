import { ChildNodes, Fragment, VNode } from './vnode'

const VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/

interface Options {
  xml?: boolean
}

export const render = (node: VNode, options?: Options): string => {
  const type = node.type
  const attributes = node.attributes || {}
  const children = node.children
  const { xml } = { xml: false, ...(options || {}) }

  if (type === Fragment) {
    return renderChildren(children)
  }
  if (typeof type === 'function') {
    return render(type({ ...attributes, children }))
  }

  const { dangerouslySetInnerHTML: raw, ...attrsWithoutRawHtml } = attributes

  const attrClause = Object.entries(attrsWithoutRawHtml)
    .filter(([attrName, attrValue]) => canRenderAttribute(attrName, attrValue))
    .map(([attrName, attrValue]) => renderAttribute(attrName, attrValue))
    .join('')

  const innerHtml = raw?.__html || renderChildren(children)

  if (xml && !innerHtml) {
    return `<${type}${attrClause} />`
  } else if (VOID_ELEMENTS.test(type) && !innerHtml) {
    return `<${type}${attrClause}>`
  } else {
    return `<${type}${attrClause}>${innerHtml}</${type}>`
  }
}

const renderChildren = (children: ChildNodes): string => {
  return children
    .flat()
    .map((node) => {
      if (typeof node === 'boolean' || node === null || node === undefined) {
        return ''
      } else if (typeof node === 'object' && 'type' in node) {
        return render(node)
      } else {
        return escape(node)
      }
    })
    .join('')
}

const canRenderAttribute = (name: string, value: unknown): boolean => {
  // https://html.spec.whatwg.org/multipage/syntax.html#syntax-attributes
  return (
    // falsy values
    (name.startsWith('aria-') || value !== false) &&
    value !== null &&
    value !== undefined &&
    // name with banned characters
    !/[ "'<>=]/.test(name) &&
    // name with control characters
    !/[\u0000-\u001f]/.test(name)
  )
}

const renderAttribute = (name: string, value: unknown): string => {
  if ((!name.startsWith('aria-') && value === true) || value === '') {
    return ' ' + name
  }
  return ` ${name}="${escape(value)}"`
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
