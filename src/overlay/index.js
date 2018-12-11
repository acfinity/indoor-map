import Overlay from './overlay'
import Marker from './marker'

export default {
    Overlay,
    Marker,
}

export function overlayMixin(XMap) {
    Object.assign(XMap.prototype, {
        addOverlay(overlay) {
            this._overlays.add(overlay)
            this._addOverlay(overlay)
        },

        removeOverlay(...overlays) {
            this._removeOverlays(overlays)
        },

        clearOverlays() {
            this._removeOverlays(this._overlays)
        },

        _addOverlay(overlay) {
            if (this.building) {
                let floorObj = this.building.getFloor(overlay.floor).object3D
                floorObj.add(overlay.object3D)
                overlay.onAppend && overlay.onAppend(floorObj)
            }
        },

        _removeOverlays(overlays) {
            overlays.forEach(overlay => {
                overlay.removeFromParent()
                this._overlays.delete(overlay)
            })
        },
    })
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
