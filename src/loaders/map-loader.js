import THREE from '../libs/threejs/index'
import Building from '../model/building'

class MapLoader extends THREE.Loader {
    constructor(is3d) {
        super()

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

export default MapLoader
