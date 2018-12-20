import TWEEN from '../libs/Tween'

function updateModels(mo) {
    mo.building && mo.building.updateBound(mo)
    Array.from(mo._overlays)
        .filter(it => it.isHTMLOverlay)
        .map(it => ({
            overlay: it,
            position: mo.locationToViewport(it.location),
        }))
        .sort((a, b) => b.position.distance - a.position.distance)
        .forEach((it, index) => {
            if (it.position.distance === Infinity) {
                it.overlay.render({
                    x: 0,
                    y: 0,
                    zIndex: -100,
                })
            } else {
                it.overlay.render({
                    x: it.position.x,
                    y: it.position.y,
                    zIndex: index + 10,
                })
            }
        })
}

export function startRenderer(mo) {
    mo.render()
}

export function renderMixin(XMap) {
    Object.assign(XMap.prototype, {
        render() {
            requestAnimationFrame(() => this.render())
            if (!this.building) return
            TWEEN.update()

            if (this.needsUpdate) {
                this._update_(this._scene, this._camera)
                this._camera.updateProjectionMatrix()
                this.updateProjectionMatrix = true
                updateModels(this)
            } else if (this.updateProjectionMatrix) {
                this.updateProjectionMatrix = false
                updateModels(this)
            }

            this.renderer.clear()
            this.renderer.render(this._scene, this._camera)
            this.renderer.clearDepth()
        },
    })
}
