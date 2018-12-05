import Overlay from './overlay'
import Marker from './marker'

export default {
    Overlay,
    Marker,
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
