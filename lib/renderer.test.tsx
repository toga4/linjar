import { ChildNodes, Component, Fragment, h } from './vnode'
import { render } from './render'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown
    }
  }
}

describe('render', () => {
  describe('Basic JSX', () => {
    it('should render JSX', () => {
      expect(render(<div class="foo">bar</div>)).toEqual(
        `<div class="foo">bar</div>`
      )
    })

    describe('falsy attribute value', () => {
      it('should omit null attributes', () => {
        expect(render(<div a={null} />)).toEqual(`<div></div>`)
      })

      it('should omit undefined attributes', () => {
        expect(render(<div a={undefined} />)).toEqual(`<div></div>`)
      })

      it('should omit false attributes', () => {
        expect(render(<div a={false} />)).toEqual(`<div></div>`)
      })

      it('should render 0 attributes', () => {
        expect(render(<div a={0} />)).toEqual(`<div a="0"></div>`)
      })

      // Too early to use BigInt value for Node.js compatibility
      // it('should render BigInt 0 attributes', () => {
      //   expect(render(<div a={0n} />)).toEqual(`<div a="0"></div>`)
      // })
    })

    describe('should collapse collapsible attributes', () => {
      it('empty string', () => {
        expect(render(<div a="" b={''} />)).toEqual(`<div a b></div>`)
      })
      it('true', () => {
        expect(render(<div a b={true} />)).toEqual(`<div a b></div>`)
      })
    })

    it('should render boolean aria-* attributes', () => {
      const rendered = render(
        <div
          aria-hidden
          aria-checked={false}
          aria-foo={null}
          aria-bar={undefined}
        />
      )
      const expected = `<div aria-hidden="true" aria-checked="false"></div>`
      expect(rendered).toEqual(expected)
    })

    // https://html.spec.whatwg.org/multipage/syntax.html#syntax-attributes
    describe('attribute name sanitization', () => {
      it.each(Array.from({ length: 32 }, (_, i) => i))(
        'should omit attributes with control characters: %d',
        (codePoint) => {
          const cc = String.fromCodePoint(codePoint)
          const rendered = render(
            h('div', {
              [`${cc}`]: '1',
              [`${cc}foo`]: '1',
              [`foo${cc}`]: '1',
              [`foo${cc}bar`]: '1',
              a: 'b',
            })
          )
          const expected = `<div a="b"></div>`
          expect(rendered).toEqual(expected)
        }
      )
      it.each([` `, `"`, `'`, `<`, `>`])(
        'should omit attributes with banned characters: `%s`',
        (ch) => {
          const rendered = render(
            h('div', {
              [`${ch}`]: '1',
              [`${ch}foo`]: '1',
              [`foo${ch}`]: '1',
              [`foo${ch}bar`]: '1',
              a: 'b',
            })
          )
          const expected = `<div a="b"></div>`
          expect(rendered).toEqual(expected)
        }
      )

      it('should mitigate attribute name injection', () => {
        let rendered = render(
          h('div', {
            '></div><script>alert("hi")</script>': '',
            'foo onclick': 'javascript:alert()',
            a: 'b',
          })
        )
        expect(rendered).toEqual(`<div a="b"></div>`)
      })

      it('should allow emoji attribute names', () => {
        let rendered = render(
          h('div', {
            'a;b': '1',
            'a🧙‍b': '1',
          })
        )
        expect(rendered).toEqual(`<div a;b="1" a🧙‍b="1"></div>`)
      })
    })

    it('should escape entities', () => {
      const rendered = render(<div a={'"<>&'}>{'"<>&'}</div>)
      const expected = `<div a="&quot;&lt;&gt;&amp;">&quot;&lt;&gt;&amp;</div>`
      expect(rendered).toEqual(expected)
    })

    describe('non-text children', () => {
      it('should omit null children', () => {
        expect(render(<div>a{null}b</div>)).toEqual(`<div>ab</div>`)
      })

      it('should omit undefined children', () => {
        expect(render(<div>a{undefined}b</div>)).toEqual(`<div>ab</div>`)
      })

      it('should omit true children', () => {
        expect(render(<div>a{true}b</div>)).toEqual(`<div>ab</div>`)
      })

      it('should omit false children', () => {
        expect(render(<div>a{false}b</div>)).toEqual(`<div>ab</div>`)
      })

      it('should render number children', () => {
        expect(render(<div>a{0}b</div>)).toEqual(`<div>a0b</div>`)
      })
    })

    describe.each([
      'area',
      'base',
      'br',
      'col',
      'embed',
      'hr',
      'img',
      'input',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr',
    ])('void elements: %s', (element) => {
      it('should omit end tags of void elements', () => {
        const rendered = render(h(element, null))
        const expected = `<${element}>`
        expect(rendered).toEqual(expected)
      })

      it('should omit end tags of void elements with attributes', () => {
        const rendered = render(h(element, { a: 'b' }))
        const expected = `<${element} a="b">`
        expect(rendered).toEqual(expected)
      })

      it('should render end tags if void elements has children', () => {
        const rendered = render(h(element, { foo: 'bar' }, 'baz'))
        const expected = `<${element} foo="bar">baz</${element}>`
        expect(rendered).toEqual(expected)
      })

      it('should render end tags if void elements has dangerouslySetInnerHTML prop', () => {
        const rendered = render(
          h(element, { foo: 'bar', dangerouslySetInnerHTML: { __html: 'baz' } })
        )
        const expected = `<${element} foo="bar">baz</${element}>`
        expect(rendered).toEqual(expected)
      })
    })
  })

  describe('Functional Components', () => {
    it('should render functional components', () => {
      const Test = jest.fn(
        ({ foo, children }: { foo: string; children?: ChildNodes }) => (
          <div foo={foo}>{children}</div>
        )
      )
      const rendered = render(<Test foo="test">content</Test>)

      expect(rendered).toEqual(`<div foo="test">content</div>`)
      expect(Test).toHaveBeenCalledTimes(1)
      expect(Test).toHaveBeenCalledWith({ foo: 'test', children: ['content'] })
    })

    it('should render functional components within JSX', () => {
      const Test = jest.fn(
        ({ foo, children }: { foo: number; children?: ChildNodes }) => (
          <div foo={foo}>{children}</div>
        )
      )

      const rendered = render(
        <section>
          <Test foo={1}>
            <span>bar</span>
            <span>baz</span>
          </Test>
        </section>
      )
      const expected = `<section><div foo="1"><span>bar</span><span>baz</span></div></section>`

      expect(rendered).toEqual(expected)
      expect(Test).toHaveBeenCalledTimes(1)
      expect(Test).toHaveBeenCalledWith({
        foo: 1,
        children: [
          { type: 'span', attributes: {}, children: ['bar'] },
          { type: 'span', attributes: {}, children: ['baz'] },
        ],
      })
    })

    it('should render high order components', () => {
      const Inner: Component = ({ children, ...props }) => (
        <div id="inner" {...props} b="c" c="d">
          {children}
        </div>
      )
      const Outer: Component = ({ children, ...props }) => (
        <Inner {...props} a="b">
          child <span>{children}</span>
        </Inner>
      )
      const rendered = render(
        <Outer a="a" b="b" p={1}>
          foo
        </Outer>
      )
      const expected =
        '<div id="inner" a="b" b="c" p="1" c="d">child <span>foo</span></div>'
      expect(rendered).toEqual(expected)
    })
  })

  describe('dangerouslySetInnerHTML', () => {
    it('should support dangerouslySetInnerHTML', () => {
      const rawHtml = '<a foo="bar">baz</a> foo & bar <d><e>foo<e>bar</d>'
      const rendered = render(
        <div foo="bar" dangerouslySetInnerHTML={{ __html: rawHtml }} />
      )
      expect(rendered).toEqual(`<div foo="bar">${rawHtml}</div>`)
    })

    it('should override children', () => {
      let rendered = render(
        <div dangerouslySetInnerHTML={{ __html: 'foo' }}>
          <b>bar</b>
        </div>
      )
      expect(rendered).toEqual('<div>foo</div>')
    })
  })

  describe('Fragments', () => {
    it('should skip Fragment node', () => {
      let html = render(
        <div>
          <Fragment>foo</Fragment>
        </div>
      )
      expect(html).toEqual('<div>foo</div>')
    })

    it('should skip Fragment node with text and element', () => {
      let html = render(
        <div>
          <Fragment>
            foo
            <span>bar</span>
          </Fragment>
        </div>
      )
      expect(html).toEqual('<div>foo<span>bar</span></div>')
    })

    it('should skip Fragment node with multiple elements', () => {
      let html = render(
        <div>
          <Fragment>
            <div>foo</div>
            <div>bar</div>
          </Fragment>
        </div>
      )
      expect(html).toEqual('<div><div>foo</div><div>bar</div></div>')
    })

    it('should skip Fragment with props', () => {
      let html = render(
        <div>
          <Fragment foo="bar">foo</Fragment>
        </div>
      )
      expect(html).toEqual('<div>foo</div>')
    })

    it('should skip sibling Fragments', () => {
      let html = render(
        <div>
          <Fragment>foo</Fragment>
          <Fragment>bar</Fragment>
        </div>
      )
      expect(html).toEqual('<div>foobar</div>')
    })

    it('should skip nested Fragments', () => {
      let html = render(
        <div>
          <Fragment>
            <Fragment>foo</Fragment>
          </Fragment>
        </div>
      )
      expect(html).toEqual('<div>foo</div>')
    })

    it('should skip Fragment as root node', () => {
      let html = render(
        <Fragment>
          <span>foo</span>
          <span>bar</span>
        </Fragment>
      )
      expect(html).toEqual('<span>foo</span><span>bar</span>')
    })
  })
})
