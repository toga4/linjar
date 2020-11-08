import { h } from './vnode'
import { render } from './render'

describe('render', () => {
  describe('Basic JSX', () => {
    it('should render JSX', () => {
      expect(render(<div class="foo">bar</div>)).toEqual(
        `<div class="foo">bar</div>`
      )
    })
  })
})
