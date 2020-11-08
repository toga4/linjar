import { h } from './vnode'
import { render } from './render'

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
  })
})
