import { Loader, FileLoader } from '../libs/threejs/index'
import MapScene from '../model/map-scene'

class MapLoader extends Loader {
    constructor(is3d) {
        super()

        this.withCredentials = false
        this.is3d = is3d

        this.jsonLoader = new FileLoader()
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
        return new MapScene(json.data)
    }
}

export default MapLoader
