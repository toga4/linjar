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
  })
})
