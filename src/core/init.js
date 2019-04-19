import GestureControl from '../controls/gesture-control'
import FloorControl from '../controls/floor-control'
import { initView, startRenderer } from './view'
import { initEvents } from './events'
import { initLoaders } from './loader'
import { initState } from './state'

export function initMixin(XMap) {
    Object.assign(XMap.prototype, {
        _init_(el, options) {
            this.options = options
            this.$wrapper = typeof el == 'string' ? document.querySelector(el) : el
            this.$wrapper.style.overflow = 'hidden'
            this.$wrapper.style.position = 'relative !important'

            this._overlays = new Set()

            initView(this)
            initState(this)

            Object.defineProperties(this, {
                gestureControl: {
                    configurable: false,
                    writable: false,
                    enumerable: false,
                    value: new GestureControl(this),
                },
                floorControl: {
                    configurable: false,
                    writable: false,
                    enumerable: false,
                    value: new FloorControl(this),
                },
            })

            initEvents(this)

            initLoaders(this)
            startRenderer(this)
        },
    })
    Object.defineProperties(XMap.prototype, {
        isMap: {
            writable: false,
            value: true,
        },
    })
}
