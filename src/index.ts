export { render } from './render'
export { ChildNodes, Component, Fragment, h, VNode } from './vnode'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown
    }
  }
}
