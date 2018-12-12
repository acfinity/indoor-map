import OrbitControl from '../controls/orbit-control'
import FloorControl from '../controls/floor-control'
import { overlayMixins } from '../overlay/index.js'
import { initView } from './view'
import { initEvent } from './event'
import { initLoaders } from './loader'

export function initMixin(XMap) {
    Object.assign(XMap.prototype, {
        _init(el, options) {
            this.options = options
            this.$wrapper = typeof el == 'string' ? document.querySelector(el) : el
            this.$wrapper.style.overflow = 'hidden'

            this._overlays = new Set()

            initView(this)

            this.control = new OrbitControl(this._camera, this.$mapWrapper)
            this.floorControl = new FloorControl(this)

            initEvent(this)
            initLoaders(this)
            overlayMixins(this)

            window.map = this
        },
    })
}
