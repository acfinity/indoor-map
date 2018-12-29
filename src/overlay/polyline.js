import Overlay from './overlay'
import { Color, LineMaterial, LineGeometry, Line2 } from '../libs/threejs'

const __options__ = new WeakMap()

function initObject3D(obj, points) {
    let { lineColor, lineWidth } = __options__.get(obj)

    let material = new LineMaterial({
        color: lineColor,
        lineWidth: lineWidth,
    })
    points = points.map(it => it.localPosition.setZ(2))
    if (closed) {
        points.push(points[0])
    }
    let geometry = new LineGeometry().setFromPoints(points)
    let line = new Line2(geometry, material)
    line.handler = obj
    return line
}

class Polyline extends Overlay {
    constructor(points, options) {
        super()
        __options__.set(this, {})
        this.setOptions(options)

        Object.defineProperties(this, {
            object3D: {
                configurable: false,
                writable: false,
                value: initObject3D(this, points),
            },
            floor: {
                value: points[0].floor,
            },
        })
    }

    setOptions({ lineColor = 'white', lineWidth = 3 } = {}) {
        let options = __options__.get(this)
        options.lineColor = new Color(lineColor)
        options.lineWidth = Number(lineWidth)
    }
}

export default Polyline
