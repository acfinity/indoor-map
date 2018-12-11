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
            it.overlay.render({
                x: it.position.x,
                y: it.position.y,
                zIndex: index + 10,
            })
        })
}

export function renderMixin(XMap) {
    Object.assign(XMap.prototype, {
        render() {
            this.renderStarted = true
            requestAnimationFrame(() => this.render())
            this.control.update()

            if (this.control.viewChanged) {
                this.control.viewChanged = false
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
