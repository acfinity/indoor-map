import THREE from '../libs/threejs/index'
import themeNormal from '../assets/theme/normal'

class ThemeLoader extends THREE.Loader {
    constructor() {
        super()
        this.jsonLoader = new THREE.FileLoader()
        this.textureLoader = new THREE.TextureLoader()
        this.themeMap = new Map()

        this._loadTheme('normal', themeNormal)
    }

    load(name, url) {
        this.jsonLoader.load(url, json => this._loadTheme(name, json), undefined, e => console.error(e))
    }

    getTheme(name = 'normal') {
        return this.themeMap.get(name) || this.themeMap.get('normal')
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
                texture.minFilter = THREE.LinearFilter
                let material = new THREE.SpriteMaterial({
                    map: texture,
                    sizeAttenuation: false,
                    transparent: true,
                    alphaTest: 0.1,
                })
                theme.materialMap.set(k, material)
            })
        }
        this.themeUpdated = true
    }
}

export default ThemeLoader
