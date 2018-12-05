import THREE from '../libs/threejs/index'
import Building from '../model/building'

class MapLoader {
    constructor(is3d) {
        THREE.Loader.call(this, is3d)

        this.withCredentials = false
        this.is3d = is3d

        this.jsonLoader = new THREE.FileLoader()
    }

    load(url) {
        return new Promise((resolve, reject) =>
            this.jsonLoader.load(
                url,
                json => {
                    let data = JSON.parse(json)
                    resolve(this.parse(data))
                },
                undefined,
                e => reject(e)
            )
        )
    }
    parse(json) {
        return new Building(json.data)
    }
}

Object.assign(MapLoader.prototype, Object.create(THREE.Loader.prototype).__proto__)

export default MapLoader
