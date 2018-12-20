import { overlayMixin } from './overlays.js'
import { initMixin } from './init'
import { eventMixin } from './event'
import { loaderMixin } from './loader'
import { viewMixin } from './view'
import { stateMixin } from './state'
import '../assets/css/main.css'
import { REVISION } from '../constants.js'

class XMap {
    constructor(el, options = {}) {

        console.log(`XMap init start. ${REVISION}`)

        this._init_(el, options)
        
    }
}
initMixin(XMap)
eventMixin(XMap)
overlayMixin(XMap)
loaderMixin(XMap)
viewMixin(XMap)
stateMixin(XMap)

export default XMap
