import Map from './map'
// import { IndoorMap3d } from './3d'
// import Detector from './3d/detector'
import Models from './model/index'
import Overlays from './overlay/index'
import Objects from './objects/index'
import THREE from './libs/threejs/index'

if (IS_DEBUG) {
    console.log(process.env.NODE_ENV)
}

export default {
    Map: Map,
    ...Models,
    ...Overlays,
    ...THREE,
    ...Objects,
}
