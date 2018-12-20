import { Loader, FileLoader, TextureLoader, LinearFilter, SpriteMaterial } from '../libs/threejs/three.module'
import themeNormal from '../assets/theme/normal'

class ThemeLoader extends Loader {
    constructor() {
        super()
        this.jsonLoader = new FileLoader()
        this.textureLoader = new TextureLoader()
        this.themeMap = new Map()

        this._loadTheme_('normal', themeNormal)
    }

    load(name, option) {
        return new Promise((resolve, reject) => {
            if (this.themeMap.has(name)) {
                reject(new Error('duplicate theme name'))
                return
            } else if (typeof option != 'string') {
                reject(new Error('invalid theme'))
                return
            } else if (option.startsWith('{')) {
                this._loadTheme_(name, option)
            } else {
                this.jsonLoader.load(
                    option,
                    json => {
                        resolve(this._loadTheme_(name, json))
                    },
                    undefined,
                    e => {
                        reject(e)
                    }
                )
            }
        })
    }

    getTheme(name = 'normal') {
        return this.themeMap.get(name)
    }

    _loadTheme_(name, theme) {
        theme = typeof theme === 'string' ? JSON.parse(theme) : theme
        this.themeMap.set(name, theme)
        theme.materialMap = new Map()
        if (theme.pubPointImg && Object.keys(theme.pubPointImg)) {
            Object.entries(theme.pubPointImg).forEach(([k, v]) => {
                let texture = this.textureLoader.load(v, t => {
                    t.dispatchEvent({ type: 'load' })
                    t.needsUpdate = true
                    this.textureNeedsUpdated = true
                })
                texture.minFilter = LinearFilter
                let material = new SpriteMaterial({
                    map: texture,
                    sizeAttenuation: false,
                    transparent: true,
                    depthWrite: false,
                })
                theme.materialMap.set(k, material)
            })
        }
        return theme
    }
}

export default new ThemeLoader()
