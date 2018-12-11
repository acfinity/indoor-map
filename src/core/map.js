import { overlayMixin } from '../overlay/index.js'
import { initMixin } from './init'
import { eventMixin } from './event'
import { loaderMixin } from './loader'
import { viewMixin } from './view'

class XMap {
    constructor(el, options = {}) {
        this._init(el, options)
    }

    animate() {
        requestAnimationFrame(() => this.animate())
        this.control.update()
        if (this.control.viewChanged) {
            this.building && this.building.updateBound(this)
        }

        this.renderer.clear()
        this.renderer.render(this._scene, this._camera)
        this.renderer.clearDepth()
        this.control.viewChanged = false
    }
}
initMixin(XMap)
eventMixin(XMap)
overlayMixin(XMap)
loaderMixin(XMap)
viewMixin(XMap)

export default XMap
