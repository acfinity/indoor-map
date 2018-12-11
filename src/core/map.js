import { overlayMixin } from '../overlay/index.js'
import { initMixin } from './init'
import { eventMixin } from './event'
import { loaderMixin } from './loader'
import { viewMixin } from './view'
import { renderMixin } from './render'
import '../assets/css/main.css'

class XMap {
    constructor(el, options = {}) {
        this._init(el, options)
    }
}
initMixin(XMap)
eventMixin(XMap)
overlayMixin(XMap)
loaderMixin(XMap)
viewMixin(XMap)
renderMixin(XMap)

export default XMap
