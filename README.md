# linjar

The lightweight templating engine that renders HTML/XML from JSX.

----

## Render JSX to HTML

```tsx
/* @jsx h */
import { h, render } from 'linjar'

const node = <div class="foo">bar</div>
const html = render(node)
console.log(html)
// <div class="foo">bar</div>
```

## Use Component and Fragment

```tsx
/* @jsx h */
import { h, render, Component, ChildNodes, Fragment } from 'linjar'

type FooProps = {
  bar: string
  children?: ChildNodes
}
const Foo: Component<FooProps> = ({ bar, children }) => (
  <Fragment>
    <span class={bar}>foo</span>
    {children}
    <span class={bar}>bar</span>
  </Fragment>
)

const node = (
  <div>
    <Foo bar={'baz'}>
      <span>hello</span>
    </Foo>
  </div>
)
const html = render(node)
console.log(html)
// <div><span class="baz">foo</span><span>hello</span><span class="baz">bar</span></div>
```
