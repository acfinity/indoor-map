import GestureControl from '../controls/gesture-control'
import FloorControl from '../controls/floor-control'
import { initView } from './view'
import { initEvent } from './event'
import { initLoaders } from './loader'
import { startRenderer } from './render'
import { initState } from './state'

export function initMixin(XMap) {
    Object.assign(XMap.prototype, {
        _init(el, options) {
            this.options = options
            this.$wrapper = typeof el == 'string' ? document.querySelector(el) : el
            this.$wrapper.style.overflow = 'hidden'
            this.$wrapper.style.position = 'relative !important'

            this._overlays = new Set()

            initView(this)
            initState(this)

            this.gestureControl = new GestureControl(this)
            new FloorControl(this)

            initEvent(this)

            initLoaders(this)
            startRenderer(this)
        },
    })
    Object.defineProperties(XMap.prototype, {
        isMap: {
            writable: false,
            value: true
        }
    })
}
