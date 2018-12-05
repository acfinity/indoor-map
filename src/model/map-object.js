import { parsePoints } from '../utils/view'

class MapObejct {
    constructor() {}
}

Object.assign(MapObejct.prototype, {
    parsePoints,
})

export default MapObejct

export const mapObejctMixins = map => {
    Object.defineProperties(MapObejct.prototype, {
        mapStyle: {
            enumerable: false,
            configurable: true,
            get: function reactiveGetter() {
                return map.getMapStyle()
            },
        },

        canvasScale: {
            enumerable: false,
            configurable: true,
            get: function reactiveGetter() {
                return map._canvasScale
            },
        },
    })
}
