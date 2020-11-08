import { render } from './lib/render'
import { Component, h } from './lib/vnode'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown
    }
  }
}

const Comp: Component = ({ children }) => (
  <hoge hoge>
    <fuga>foo</fuga>
    {children}
  </hoge>
)

const node = (
  <foo attr="a">
    <bar>
      <baz>hoge</baz>
      fuga
      <hoge />
      <hoge></hoge>
      <Comp>a</Comp>
      <Comp />
    </bar>
  </foo>
)

console.log(render(node))
