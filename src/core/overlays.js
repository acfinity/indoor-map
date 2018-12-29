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
            if (this.mapScene) {
                if (overlay.isHTMLOverlay) {
                    this.$overlayWrapper.appendChild(overlay.$el)
                    overlay.render(this.locationToViewport(overlay.location))
                } else {
                    let floorObj = this.mapScene.getFloor(overlay.floor)
                    if (floorObj) {
                        floorObj.add(overlay.object3D)
                    } else {
                        throw new Error('invalid floor')
                    }
                }
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
