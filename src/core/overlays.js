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
                if (overlay.isHTMLOverlay) {
                    this.$overlayWrapper.appendChild(overlay.$el)
                    overlay.render(this.locationToViewport(overlay.location))
                } else {
                    let floorObj = this.building.getFloor(overlay.floor)
                    if (floorObj) {
                        floorObj.add(overlay.object3D)
                        if (overlay.object3D.isSprite) {
                            overlay.object3D.scale.set(
                                overlay.object3D.width / this._canvasScale,
                                overlay.object3D.height / this._canvasScale,
                                1
                            )
                        }
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
