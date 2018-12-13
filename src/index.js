import Map from './core/map'
import * as Constants from './constants'
import Models from './model/index'
import Overlays from './overlay/index'
import Objects from './objects/index'

if (IS_DEBUG) {
    console.log(process.env.NODE_ENV)
}

export default {
    Map: Map,
    ...Constants,
    ...Models,
    ...Overlays,
    ...Objects
}
