import MapLoader from '../loaders/map-loader'
import ThemeLoader from '../loaders/theme-loader'

function changeTheme(mo, theme) {
    function changeTheme(object) {
        if (object.onThemeChange) object.onThemeChange(theme)
        if (object.children && object.children.length > 0) {
            object.children.forEach(obj => changeTheme(obj))
        }
    }
    mo.building && changeTheme(mo.building)
}

function injectMapInstance(mo, object) {
    if (object.isMapObject) {
        object.$map = mo
        if (object.updateScale) object.updateScale()
    }
    object.children.forEach(obj => injectMapInstance(mo, obj))
}

export function loaderMixin(XMap) {
    Object.assign(XMap.prototype, {
        load(fileName) {
            this.mapLoader.load(fileName).then(building => {
                this.floorControl.show(building)
                this.building = building
                changeTheme(this, this.themeLoader.getTheme(this._currentTheme))
                injectMapInstance(this, this.building)
                this.renderer.setClearColor(this.themeLoader.getTheme().background)
                this._scene.add(building)

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

        loadTheme(name, url) {
            return this.themeLoader.load(name, url)
        },

        setTheme(name) {
            let theme = this.themeLoader.getTheme(name)
            if (!theme) {
                throw new Error('theme not exists')
            }
            this._currentTheme = name
            changeTheme(this, theme)
        },

        getMapStyle() {
            return this.themeLoader.getTheme()
        },
    })
}

export function initLoaders(mo) {
    mo.mapLoader = new MapLoader(false)
    mo.themeLoader = new ThemeLoader()
}
