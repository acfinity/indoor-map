import { Path, Shape, Mesh, ExtrudeBufferGeometry, ShapeGeometry, MeshLambertMaterial } from '../libs/threejs/index'
import { mixinMapObject } from './map-object'
import Room from './room'
import PubPoint from './pub-point'
import { parsePoints } from '../utils/view'

class Floor extends Mesh {
    constructor(attr) {
        super()
        this.info = attr

        let points = parsePoints(this.info.outline[0][0]).reverse()
        let extrudeSettings = {
            depth: 10,
            bevelEnabled: false,
        }
        let shape = new Shape(points)
        if (this.info.outline[1]) {
            this.info.outline[1].map(array => {
                shape.holes.push(new Path(parsePoints(array)))
            })
        }

        let geometry3d = new ExtrudeBufferGeometry(shape, extrudeSettings)
        let geometry2d = new ShapeGeometry(shape)
        this.geometry = geometry2d
        let board = new Mesh(geometry3d)
        this.material = new MeshLambertMaterial()
        board.material = this.material
        this.onThemeChange = theme => {
            this.material.setValues(theme.floor)
        }
        this.add(board)
        board.position.set(0, 0, -10)
        board.onViewModeChange = is3dMode => (board.visible = is3dMode)
        let floorHeight = this.info.height
        if (!floorHeight || floorHeight < 1e-4) {
            floorHeight = 500.0
        }
        this.info.height = floorHeight
        this.height = floorHeight
        this.handler = this
        this.type = 'Floor'
        this.sprites = []
        
        this.renderOrder = 1

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
        this.initObject()
    }

    initObject() {
        this.rooms
            .filter(r => r.name !== '中空区域')
            .forEach(room => {
                this.sprites.push(room.label)
                this.add(room)
            })

        this.pubPoints.forEach(pp => {
            this.sprites.push(pp)
            this.add(pp)
        })
    }
}

mixinMapObject(Floor)

Object.defineProperties(Floor.prototype, {
    isFloor: {
        configurable: false,
        writable: false,
        value: true,
    },
})

export default Floor
