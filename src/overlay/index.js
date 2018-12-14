import Overlay from './overlay'
import HTMLOverlay from './html-overlay'
import Marker from './marker'
import HTMLInfoWindow from './html-info-window'

export default {
    Overlay,
    HTMLOverlay,
    Marker,
    HTMLInfoWindow,
}

export const overlayMixins = map => {
    Object.defineProperties(Overlay.prototype, {
        canvasScale: {
            enumerable: false,
            configurable: false,
            get: function reactiveGetter() {
                return map._canvasScale
            },
        },
    })
}
