import {
    Vector2,
    Box2,
    Shape,
    Mesh,
    LineLoop,
    Geometry,
    BoxGeometry,
    BoxBufferGeometry,
    PlaneGeometry,
    ShapeGeometry,
    ExtrudeGeometry,
    LineBasicMaterial,
    MeshPhongMaterial,
    MeshLambertMaterial,
    // TextureLoader,
    DoubleSide,
    // LinearFilter,
    // RepeatWrapping,
} from '../libs/threejs/three.module'
import { mixinMapObject } from './map-object'
import { parsePoints } from '../utils/view'
import Label from './label'

class Room extends Mesh {
    constructor(floor, attr) {
        super()
        this.floor = floor
        this.info = attr
        let { name } = attr
        this.name = name

        this.initObject3D()
    }

    initObject3D() {
        let points = parsePoints(this.info.outline[0][0])
        let shape = new Shape(points)

        let geometry

        let extrudeSettings = {
            depth: this.floor.info.height,
            bevelEnabled: false,
        }
        let geometry3d = new ExtrudeGeometry(shape, extrudeSettings)
        let geometry2d = new ShapeGeometry(shape)
        this.geometry = geometry3d
        this.material = new MeshLambertMaterial()
        this.material.depthWrite = false
        let object = this
        object.onViewModeChange = is3dMode => {
            object.geometry = is3dMode ? geometry3d : geometry2d
            object.position.setZ(is3dMode ? 0 : 1)
        }
        object.type = 'Room'
        object.handler = this
        object.box = new Box2().setFromPoints(points)

        if (this.info.walls) {
            object.material.opacity = 0
            this.material.alphaTest = 0.1
            // geometry = new ShapeGeometry(shape)
            // let groundMaterial = new MeshPhongMaterial()
            // let textureLoader = new TextureLoader()
            // textureLoader.load('./textures/floor-board.jpg', function(texture) {
            //     texture.minFilter = LinearFilter
            //     texture.wrapS = RepeatWrapping
            //     texture.wrapT = RepeatWrapping
            //     texture.anisotropy = 16
            //     texture.repeat.set(0.01, 0.01)
            //     groundMaterial.needsUpdate = true
            //     groundMaterial.map = texture
            // })
            // mesh = new Mesh(geometry, groundMaterial)
            // mesh.position.set(0, 0, 1)
            // object.add(mesh)
            let material = new MeshPhongMaterial({
                color: 0x156289,
                emissive: 0x072534,
                side: DoubleSide,
                flatShading: true,
                opacity: 0.5,
                transparent: true,
                depthWrite: false,
            })
            this.info.walls.forEach(wall => {
                let points = parsePoints(wall)
                let geometry3d = new BoxGeometry(5, points[0].distanceTo(points[1]), this.floor.info.height)
                let geometry2d = new PlaneGeometry(5, points[0].distanceTo(points[1]))
                let cube = new Mesh(geometry3d, material)
                cube.position.set(
                    (points[0].x + points[1].x) / 2,
                    (points[0].y + points[1].y) / 2,
                    this.floor.info.height / 2
                )
                cube.rotation.z = points[0].sub(points[1]).angle() + (Math.PI * 3) / 2
                cube.onViewModeChange = is3dMode => {
                    cube.geometry = is3dMode ? geometry3d : geometry2d
                    cube.position.setZ(is3dMode ? this.floor.info.height / 2 : 2)
                }
                object.add(cube)
            })
        } else {
            geometry = new Geometry().setFromPoints(points)
            let wire = new LineLoop(geometry)
            wire.material = new LineBasicMaterial()
            wire.material.depthWrite = false
            wire.position.set(0, 0, this.floor.info.height)
            wire.onViewModeChange = is3dMode => wire.position.setZ(is3dMode ? this.floor.info.height : 2)
            object.add(wire)

            this.onThemeChange = theme => {
                let roomStyle = theme.roomStyle[this.info.category] || theme.roomStyle['default']
                this.material.setValues(roomStyle)
                wire.material.setValues(roomStyle)
                wire.material.color.multiplyScalar(0.8)
            }
        }
        if (this.info.pillars) {
            let material = new MeshLambertMaterial({
                color: 0xffffff,
                emissive: 0x555555,
            })
            let box = new Box2(),
                center = new Vector2(),
                size = new Vector2()
            this.info.pillars.forEach(pillar => {
                let points = parsePoints(pillar)
                box.setFromPoints(points).getCenter(center)
                box.getSize(size)
                let geometry3d = new BoxBufferGeometry(size.width, size.height, this.floor.info.height)
                let geometry2d = new PlaneGeometry(size.width, size.height)
                let cube = new Mesh(geometry3d, material)
                cube.position.set(center.x, center.y, this.floor.info.height / 2)
                cube.onViewModeChange = is3dMode => {
                    cube.geometry = is3dMode ? geometry3d : geometry2d
                    cube.position.setZ(is3dMode ? this.floor.info.height / 2 : 2)
                }
                object.add(cube)
            })
        }

        let sprite = new Label(this.info.name)
        sprite.onThemeChange = theme => {
            let material = theme.materialMap.get(this.info.category + '')
            sprite.setOptions(theme.fontStyle)
            if (!material || !material.map) {
                sprite.setIcon()
            } else {
                sprite.setIcon({ icon: material.map })
            }
            sprite.needsUpdate = true
        }
        if (sprite) {
            let center = object.box.getCenter(new Vector2())
            sprite.position.set(center.x, center.y, this.floor.info.height + 5)
            sprite.center.set(0.5, 0)
            sprite.renderOrder = 1
            sprite.onViewModeChange = is3dMode => sprite.position.setZ(is3dMode ? this.floor.info.height + 5 : 3)
            object.add(sprite)
        }

        object.label = sprite
    }
}

mixinMapObject(Room, 'Room')

export default Room
