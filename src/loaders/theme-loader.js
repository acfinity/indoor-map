import THREE from '../libs/threejs/index'

class ThemeLoader {
    constructor() {
        this.jsonLoader = new THREE.FileLoader()
        this.textureLoader = new THREE.TextureLoader()
        this.themeMap = new Map()
    }

    load(name, url) {
        this.jsonLoader.load(
            url,
            json => {
                let theme = JSON.parse(json)
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
                        })
                        theme.materialMap.set(k, material)
                    })
                }
                this.themeUpdated = true
            },
            undefined,
            e => console.error(e)
        )
    }

    getTheme(name = 'normal') {
        return this.themeMap.get(name) || this.themeMap.get('normal')
    }
}

Object.assign(ThemeLoader.prototype, Object.create(THREE.Loader.prototype).__proto__)

export default ThemeLoader
