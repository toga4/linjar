export interface VNode {
  type: string | Component
  attributes: Attrs | null
  children: ChildNodes
}

export interface Component<P = Record<string, unknown>> {
  (props: P & { children?: ChildNodes }): VNode
}

export type Attrs = { [name: string]: string } & {
  dangerouslySetInnerHTML?: { __html: string }
}
export type ChildNode = VNode | string
export type ChildNodes = ChildNode[]

export const h = (
  type: string | Component,
  props: Attrs | null,
  ...children: ChildNodes
): VNode => ({ type, attributes: props || {}, children })

export const Fragment: Component = () => h('', null)
