import Base from './map-object'
import Room from './room'
import PubPoint from './pub-point'
import THREE from '../libs/threejs/index'
import { parsePoints } from '../utils/view'

class Floor extends Base {
    constructor(attr) {
        super(attr)
        this.info = attr
        let { funcAreas: rooms, pubPoint } = attr
        this.name = this.info.name

        this.rooms = []
        rooms.forEach(r => {
            this.rooms.push(new Room(this, r))
        })
        this.pubPoints = []
        pubPoint.forEach(pp => {
            this.pubPoints.push(new PubPoint(pp, this))
        })

        // this.outline = new Shape(this.info.outline[0][0])
        // this.bounds = getBoundingRect(this.outline.getPoints())
    }

    makeObject3D() {
        let object = new THREE.Group()
        let floorHeight = this.info.height
        if (!floorHeight || floorHeight < 1e-4) {
            floorHeight = 500.0
        }
        this.info.height = floorHeight

        let points = parsePoints(this.info.outline[0][0]).reverse()
        let extrudeSettings = {
            depth: 10,
            bevelEnabled: false,
        }
        let shape = new THREE.Shape(points)
        if (this.info.outline[1]) {
            this.info.outline[1].map(array => {
                shape.holes.push(new THREE.Path(parsePoints(array)))
            })
        }

        {
            let geometry3d = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings)
            let geometry2d = new THREE.ShapeGeometry(shape)
            let material = new THREE.MeshPhongMaterial(this.mapStyle.floor)
            let mesh = new THREE.Mesh(geometry3d, material)
            mesh.name = 'floor'
            mesh.handler = this
            mesh.position.set(0, 0, -10)
            mesh.onViewModeChange = is3dMode => {
                mesh.geometry = is3dMode ? geometry3d : geometry2d
                mesh.position.setZ(is3dMode ? -10 : -1)
            }
            object.add(mesh)
        }

        object.height = floorHeight

        object.handler = this
        object.name = 'floor'
        object.sprites = []

        this.rooms
            .filter(r => r.name !== '中空区域')
            .forEach(room => {
                let roomObj = room.makeObject3D()
                object.sprites.push(roomObj.label)
                object.add(roomObj)
            })

        this.pubPoints.forEach(pp => {
            let pointObj = pp.makeObject3D()
            object.sprites.push(pointObj)
            object.add(pointObj)
        })

        this.object3D = object
        return object
    }

    render(context) {
        context.beginPath()
        this.drawOutline.getPoints().forEach((p, index) => {
            if (index === 0) {
                context.moveTo(p.x, -p.y)
            } else {
                context.lineTo(p.x, -p.y)
            }
        })
        context.closePath()

        context.fillStyle = '#e0e0e0'
        context.fill()
        context.strokeStyle = '#666666'
        context.lineWidth = 1
        context.stroke()

        this.rooms.forEach(room => {
            room.render(context)
        })
    }
}

export default Floor
