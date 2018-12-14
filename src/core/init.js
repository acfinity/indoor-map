import GestureControl from '../controls/gesture-control'
import FloorControl from '../controls/floor-control'
import { overlayMixins } from '../overlay/index.js'
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

            this._overlays = new Set()

            initState(this)
            initView(this)

            this.gestureControl = new GestureControl(this)
            this.floorControl = new FloorControl(this)

            initEvent(this)
            initLoaders(this)
            overlayMixins(this)
            startRenderer(this)

            window.map = this
        },
    })
}
