import Map from './map'
// import { IndoorMap3d } from './3d'
// import Detector from './3d/detector'
import Models from './model/index'
import Overlays from './overlay/index'
import Objects from './objects/index'
import THREE from './libs/threejs/index'
    ;(function() {
    var lastTime = 0
    var vendors = ['ms', 'moz', 'webkit', 'o']
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime()
            var timeToCall = Math.max(0, 16 - (currTime - lastTime))
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall)
            }, timeToCall)
            lastTime = currTime + timeToCall
            return id
        }
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id)
        }
})()

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
