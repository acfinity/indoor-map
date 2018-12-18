import MapLoader from '../loaders/map-loader'
import themeLoader from '../loaders/theme-loader'

function changeTheme(mo, theme) {
    function changeTheme(object) {
        if (object.onThemeChange) object.onThemeChange(theme)
        if (object.children && object.children.length > 0) {
            object.children.forEach(obj => changeTheme(obj))
        }
    }
    let { background = '#f9f9f9' } = theme
    if (typeof background === 'object') {
        let { color, alpha = 1 } = background
        mo.renderer.setClearColor(color, alpha)
    } else {
        if (typeof background !== 'string') {
            background = '#f9f9f9'
        }
        mo.renderer.setClearColor(background, 1)
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
            return new Promise((resolve, reject) => {
                if (this.building) {
                    this._scene.remove(this.building)
                    this.building = undefined
                }
                this.mapLoader
                    .load(fileName)
                    .then(building => {
                        this.building = building
                        changeTheme(this, this.themeLoader.getTheme(this._currentTheme))
                        injectMapInstance(this, this.building)

                        this._scene.add(building)

                        building.showFloor('F1')

                        this.dispatchEvent({ type: 'mapLoaded' })
                        this._overlays.forEach(overlay => this._addOverlay(overlay))

                        this.setDefaultView()

                        this.renderer.domElement.style.opacity = 1
                        this.building.updateBound(this)
                        this.setViewMode(this.options.viewMode)
                        resolve(this)
                    })
                    .catch(e => reject(e))
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
    mo.themeLoader = themeLoader
}
