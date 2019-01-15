function updateHTMLOverlay(mo, overlay) {
    let position = mo.locationToViewport(overlay.location)
    if (position.distance === Infinity) {
        overlay.render({
            visible: false,
        })
    } else {
        overlay.render({
            x: position.x,
            y: position.y,
            zIndex: -Math.round(position.distance),
            visible: true,
        })
    }
}

export function updateOverlays(mo) {
    Array.from(mo._overlays)
        .filter(it => it.isHTMLOverlay)
        .forEach(it => updateHTMLOverlay(mo, it))
}

export function overlayMixin(XMap) {
    Object.assign(XMap.prototype, {
        addOverlay(overlay) {
            if (overlay) {
                Object.defineProperty(overlay, '$map', { writable: false, value: this })
                this._overlays.add(overlay)
                this._addOverlay(overlay)
            }
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
                    overlay.$el.remove()
                    overlay._location = overlay.location
                    let vm = this
                    Object.defineProperty(overlay, 'location', {
                        set(v) {
                            this._location = v
                            updateHTMLOverlay(vm, overlay)
                        },
                        get() {
                            return this._location
                        },
                    })
                    this.$overlayWrapper.appendChild(overlay.$el)
                    updateHTMLOverlay(this, overlay)
                } else if (overlay.isOverlay && overlay.object3D) {
                    let floorObj = this.mapScene.getFloor(overlay.floor)
                    if (floorObj) {
                        floorObj.add(overlay.object3D)
                        this.needsUpdate = true
                    } else {
                        throw new Error('invalid floor')
                    }
                }
            }
        },

        _removeOverlays(overlays) {
            overlays.forEach(overlay => {
                if (overlay.isHTMLOverlay) {
                    overlay.$el.remove()
                } else {
                    overlay.removeFromParent()
                }
                this._overlays.delete(overlay)
            })
        },
    })
}
