import Base from './map-object'
import THREE from '../libs/threejs/index'
import { parsePoints } from '../utils/view'
import Label from '../objects/label'

class Room extends Base {
    constructor(floor, attr) {
        super(attr)
        this.floor = floor
        this.info = attr
        let { name } = attr
        this.name = name
        // this.outline = new Shape(parsePoints(this.info.outline[0][0]))
        // this.boundBox = this.getBoundingRect(this.outline.getPoints())
    }

    render(context) {
        if (!this.drawOutline) {
            throw new Error('call updateOutline first')
        }

        context.beginPath()
        this.drawOutline.getPoints().forEach((p, index) => {
            if (index === 0) {
                context.moveTo(p.x, -p.y)
            } else {
                context.lineTo(p.x, -p.y)
            }
        })
        context.closePath()

        context.fillStyle = '#c49c94'
        context.fill()
        context.stroke()

        if (this.nameVisible) {
            context.fillStyle = '#333333'
            context.textBaseline = 'middle'
            context.font =
                "13px/1.4 'Lantinghei SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Helvetica Neue', Helvetica, STHeiTi, Arial, sans-serif"
            context.fillText(this.name, this.nameBounds.left, -this.nameBounds.center.y)
        }
    }

    makeObject3D() {
        let points = parsePoints(this.info.outline[0][0])
        let shape = new THREE.Shape(points)
        let object = new THREE.Group()

        // var center = funcArea.Center;
        // floorObj.points.push({
        //     name: funcArea.Name,
        //     type: funcArea.Type,
        //     position: new THREE.Vector3(center[0] * scale, floorHeight * scale, -center[1] * scale)
        // });

        //solid model
        let extrudeSettings = {
            depth: this.floor.info.height,
            bevelEnabled: false,
        }
        let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        let material
        let mesh

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
        // mesh.center.set(0, 0)
        object.add(mesh)

        //top wireframe

        if (this.info.walls) {
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
                let geometry = new THREE.BoxGeometry(5, points[0].distanceTo(points[1]), this.floor.info.height)
                let cube = new THREE.Mesh(geometry, material)
                cube.position.set(
                    (points[0].x + points[1].x) / 2,
                    (points[0].y + points[1].y) / 2,
                    this.floor.info.height / 2
                )
                cube.rotation.z = points[0].sub(points[1]).angle() + Math.PI / 2
                object.add(cube)
            })
        } else {
            material = new THREE.MeshLambertMaterial(
                this.mapStyle.roomStyle[this.info.category || this.info.type] || this.mapStyle.roomStyle['default']
            )
            // material.depthTest = false
            mesh = new THREE.Mesh(geometry, material)
            object.add(mesh)

            geometry = new THREE.Geometry().setFromPoints(points)
            let wire = new THREE.Line(geometry, new THREE.LineBasicMaterial(this.mapStyle.strokeStyle))
            wire.position.set(0, 0, this.floor.info.height)
            object.add(wire)
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
                let geometry = new THREE.BoxBufferGeometry(size.width, size.height, this.floor.info.height)
                let cube = new THREE.Mesh(geometry, material)
                cube.position.set(center.x, center.y, this.floor.info.height / 2)
                object.add(cube)
            })
        }

        // object.add(wire)

        object.name = 'room'
        object.handler = this
        object.box = new THREE.Box2().setFromPoints(points)

        let sprite = new Label(this.info.name)
        if (sprite) {
            let center = object.box.getCenter(new THREE.Vector2())
            sprite.position.set(center.x, center.y, this.floor.info.height + 5)
            sprite.center.set(0.5, 0)
            object.add(sprite)
        }

        object.label = sprite

        return object
    }
}

export default Room
