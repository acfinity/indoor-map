import Overlay from './overlay'
import {
    Color,
    LineMaterial,
    LineGeometry,
    Line2,
    ShapeGeometry,
    Shape,
    MeshPhongMaterial,
    Mesh,
    Vector3,
    EllipseCurve,
} from '../libs/threejs'

const __options__ = new WeakMap()

function parsePoints(points) {
    if (Array.isArray(points)) {
        return points.map(it => new Vector3().copy(it).setZ(0))
    } else if (points.type) {
        let {
            type,
            center: { x, y },
        } = points
        if (type === 'rectangle') {
            let { width, height } = points
            let hw = width
            let hh = height
            return [
                new Vector3(x - hw, y - hh, 0),
                new Vector3(x - hw, y + hh, 0),
                new Vector3(x + hw, y + hh, 0),
                new Vector3(x + hw, y - hh, 0),
            ]
        } else if (type === 'circle') {
            let { radius, segments = 40 } = points
            let curve = new EllipseCurve(x, y, radius, radius)
            return curve.getPoints(segments)
        } else {
            throw new Error('invalid points')
        }
    }
}

function initObject3D(obj, points) {
    let { color, alpha, lineColor, lineWidth } = __options__.get(obj)

    points = parsePoints(points)

    let shape = new Shape(points)
    let geometry = new ShapeGeometry(shape)
    let material = new MeshPhongMaterial({
        color,
        transparent: true,
        opacity: alpha,
        depthWrite: false,
    })
    let polygon = new Mesh(geometry, material)
    if (lineWidth > 0) {
        let material = new LineMaterial({
            color: lineColor,
            lineWidth: lineWidth,
        })
        points.push(points[0])
        let geometry = new LineGeometry().setFromPoints(points)
        let line = new Line2(geometry, material)
        line.position.setZ(0.1)
        polygon.add(line)
    }
    polygon.handler = obj
    polygon.position.setZ(60)
    polygon.onViewModeChange = is3dMode => {
        // polygon.material.depthTest = is3dMode
        polygon.position.setZ(is3dMode ? 60 : 3)
    }
    polygon.renderOrder = 10
    return polygon
}

class Polygon extends Overlay {
    constructor(options) {
        super()
        __options__.set(this, {})
        this.setOptions(options)
        let { points, floor } = options

        Object.defineProperties(this, {
            object3D: {
                configurable: false,
                writable: false,
                value: initObject3D(this, points),
            },
            floor: {
                value: floor,
            },
        })
    }

    setOptions({ color = 'white', alpha = 0.5, lineColor = 'white', lineWidth = 1 }) {
        let options = __options__.get(this)
        options.color = new Color(color)
        options.alpha = parseFloat(alpha)
        options.lineColor = new Color(lineColor)
        options.lineWidth = parseInt(lineWidth)
    }
}

export default Polygon
