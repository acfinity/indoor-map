import MapLoader from '../loaders/map-loader'
import ThemeLoader from '../loaders/theme-loader'

export function loaderMixin(XMap) {
    Object.assign(XMap.prototype, {
        load(fileName) {
            this.mapLoader.load(fileName).then(building => {
                this.floorControl.show(this.$controlWrapper, building)
                this.building = building
                this.renderer.setClearColor('#ffffff')
                this._scene.add(building.object3D)
                // building.showAllFloors()
                building.showFloor('F1')
                this.dispatchEvent({ type: 'mapLoaded' })
                this._overlays.forEach(overlay => this._addOverlay(overlay))

                this.setDefaultView()
                if (!this.renderStarted) {
                    this.renderStarted = true
                    this.render()
                }
                this.renderer.domElement.style.opacity = 1
                this.building.updateBound(this)
                this.setViewMode(this.options.viewMode)
            })
        },

        loadTheme() {},

        getMapStyle() {
            return this.themeLoader.getTheme()
        },
    })
}

export function initLoaders(mo) {
    mo.mapLoader = new MapLoader(false)
    mo.themeLoader = new ThemeLoader()
}
