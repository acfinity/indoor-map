import MapLoader from '../loaders/map-loader'
import themeLoader from '../loaders/theme-loader'
import { clearRenderer, loadModel } from './view'

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
        clearRenderer(mo, color, alpha)
    } else {
        if (typeof background !== 'string') {
            background = '#f9f9f9'
        }
        clearRenderer(mo, background, 1)
    }
    mo.building && changeTheme(mo.building)
}

export function loaderMixin(XMap) {
    Object.assign(XMap.prototype, {
        load(fileName) {
            return new Promise((resolve, reject) => {
                this.clear()
                this.mapLoader
                    .load(fileName)
                    .then(building => {
                        loadModel(this, building)
                        changeTheme(this, this.themeLoader.getTheme(this._currentTheme))

                        building.showFloor('F1')

                        this._overlays.forEach(overlay => this._addOverlay(overlay))

                        this.dispatchEvent({ type: 'mapLoaded' })
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
