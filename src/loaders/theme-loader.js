import { Loader, FileLoader, TextureLoader, LinearFilter, SpriteMaterial } from '../libs/threejs/three.module'
import themeNormal from '../assets/theme/normal'

class ThemeLoader extends Loader {
    constructor() {
        super()
        this.jsonLoader = new FileLoader()
        this.textureLoader = new TextureLoader()
        this.themeMap = new Map()

        this._loadTheme('normal', themeNormal)
    }

    load(name, url) {
        return new Promise((resolve, reject) => {
            if (this.themeMap.has(name)) {
                reject(new Error('duplicate theme name'))
                return
            }
            this.jsonLoader.load(
                url,
                json => {
                    resolve(this._loadTheme(name, json))
                },
                undefined,
                e => {
                    reject(e)
                }
            )
        })
    }

    getTheme(name = 'normal') {
        return this.themeMap.get(name)
    }

    _loadTheme(name, theme) {
        theme = typeof theme === 'string' ? JSON.parse(theme) : theme
        this.themeMap.set(name, theme)
        if (Object.keys(theme.pubPointImg)) {
            theme.materialMap = new Map()
            Object.entries(theme.pubPointImg).forEach(([k, v]) => {
                let texture = this.textureLoader.load(v, t => {
                    t.needsUpdate = true
                    this.textureUpdated = true
                })
                texture.minFilter = LinearFilter
                let material = new SpriteMaterial({
                    map: texture,
                    sizeAttenuation: false,
                    transparent: true,
                    alphaTest: 0.1,
                })
                theme.materialMap.set(k, material)
            })
        }
        return theme
    }
}

export default ThemeLoader
