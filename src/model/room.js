import { mixinMapObject } from './map-object'
import THREE from '../libs/threejs/index'
import { parsePoints } from '../utils/view'
import Label from './label'

class Room extends THREE.Mesh {
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
        let shape = new THREE.Shape(points)

        let geometry, mesh

        let extrudeSettings = {
            depth: this.floor.info.height,
            bevelEnabled: false,
        }
        let geometry3d = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        let geometry2d = new THREE.ShapeGeometry(shape)
        this.geometry = geometry3d
        this.onThemeChange = theme => {
            let roomStyle = theme.roomStyle[this.info.category] || theme.roomStyle['default']
            this.material = new THREE.MeshLambertMaterial(roomStyle)
        }
        let object = this
        object.onViewModeChange = is3dMode => {
            object.geometry = is3dMode ? geometry3d : geometry2d
            object.position.setZ(is3dMode ? 0 : 1)
        }
        object.type = 'Room'
        object.handler = this
        object.box = new THREE.Box2().setFromPoints(points)

        geometry = new THREE.Geometry().setFromPoints(points)
        let wire = new THREE.LineLoop(geometry)
        wire.position.set(0, 0, this.floor.info.height)
        wire.onViewModeChange = is3dMode => wire.position.setZ(is3dMode ? this.floor.info.height : 2)
        wire.onThemeChange = theme => (wire.material = new THREE.LineBasicMaterial(theme.strokeStyle))
        object.add(wire)

        if (this.info.walls) {
            object.material.opacity = 0
            geometry = new THREE.ShapeGeometry(shape)
            let groundMaterial = new THREE.MeshStandardMaterial({
                roughness: 0.8,
                metalness: 0.5,
            })
            let textureLoader = new THREE.TextureLoader()
            textureLoader.load('./textures/floor-board.jpg', function(map) {
                map.wrapS = THREE.RepeatWrapping
                map.wrapT = THREE.RepeatWrapping
                map.anisotropy = 16
                map.repeat.set(0.005, 0.005)
                map.minFilter = THREE.LinearFilter
                groundMaterial.map = map
                groundMaterial.needsUpdate = true
            })
            mesh = new THREE.Mesh(geometry, groundMaterial)
            mesh.position.set(0, 0, 1)
            object.add(mesh)
            let material = new THREE.MeshPhongMaterial({
                color: 0x156289,
                emissive: 0x072534,
                side: THREE.DoubleSide,
                flatShading: true,
                opacity: 0.5,
                transparent: true,
            })
            this.info.walls.forEach(wall => {
                let points = parsePoints(wall)
                let geometry3d = new THREE.BoxGeometry(5, points[0].distanceTo(points[1]), this.floor.info.height)
                let geometry2d = new THREE.PlaneGeometry(5, points[0].distanceTo(points[1]))
                let cube = new THREE.Mesh(geometry3d, material)
                cube.position.set(
                    (points[0].x + points[1].x) / 2,
                    (points[0].y + points[1].y) / 2,
                    this.floor.info.height / 2
                )
                cube.rotation.z = points[0].sub(points[1]).angle() + Math.PI / 2
                cube.onViewModeChange = is3dMode => {
                    cube.geometry = is3dMode ? geometry3d : geometry2d
                    cube.position.setZ(is3dMode ? this.floor.info.height / 2 : 2)
                }
                object.add(cube)
            })
        }
        if (this.info.pillars) {
            let material = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                emissive: 0x555555,
            })
            let box = new THREE.Box2(),
                center = new THREE.Vector2(),
                size = new THREE.Vector2()
            this.info.pillars.forEach(pillar => {
                let points = parsePoints(pillar)
                box.setFromPoints(points).getCenter(center)
                box.getSize(size)
                let geometry3d = new THREE.BoxBufferGeometry(size.width, size.height, this.floor.info.height)
                let geometry2d = new THREE.PlaneGeometry(size.width, size.height)
                let cube = new THREE.Mesh(geometry3d, material)
                cube.position.set(center.x, center.y, this.floor.info.height / 2)
                cube.onViewModeChange = is3dMode => {
                    cube.geometry = is3dMode ? geometry3d : geometry2d
                    cube.position.setZ(is3dMode ? this.floor.info.height / 2 : 2)
                }
                object.add(cube)
            })
        }

        let sprite = new Label(this.info.name)
        if (sprite) {
            let center = object.box.getCenter(new THREE.Vector2())
            sprite.position.set(center.x, center.y, this.floor.info.height + 5)
            sprite.center.set(0.5, 0)
            sprite.onViewModeChange = is3dMode => sprite.position.setZ(is3dMode ? this.floor.info.height + 5 : 3)
            object.add(sprite)
        }

        object.label = sprite
    }
}

mixinMapObject(Room)

export default Room
