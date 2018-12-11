import Base from './map-object'
import Floor from './floor'
import THREE from '../libs/threejs/index'
import { parsePoints } from '../utils/view'

class Building extends Base {
    constructor(attr = {}) {
        super(attr.building)
        let {
            building,
            building: { groundFloors = 1, underFloors = 0, defaultFloor = 1 },
            floors = [],
            floorSize = floors.length,
        } = attr
        this.info = building
        if (
            groundFloors < 0 ||
            underFloors < 0 ||
            groundFloors + underFloors === 0 ||
            groundFloors + underFloors != floorSize
        ) {
            throw new Error('Invalid floor count.')
        }
        this.groundFloor = groundFloors
        this.underFloor = underFloors
        this.showFloor(defaultFloor)

        // this.outline = new Shape(this.info.outline[0][0])
        // this.bounds = this.getBoundingRect(this.outline.getPoints())

        this.floors = []
        floors.forEach(f => {
            this.floors.push(new Floor(f))
        })

        this.object3D = this.makeObject3D()
    }

    render(context) {
        if (!this.drawOutline) {
            throw new Error('call updateOutline first')
        }

        this.getFloor(this.currentFloorNum).render(context)
    }

    makeObject3D() {
        let object = new THREE.Group()
        object.name = 'building'
        object.sprites = []
        this.floors.forEach(floor => {
            let floorObj = floor.makeObject3D()
            object.add(floorObj)
            object.sprites.push(...floorObj.sprites)
            floorObj.visible = this.getFloor(this.currentFloorNum) === floor
        })

        let points = parsePoints(this.info.outline[0][0])
        if (points.length > 0) {
            let shape = new THREE.Shape(points)
            let extrudeSettings = {
                depth: object.children.map(a => a.height).reduce((a, b) => a + b) * 4,
                bevelEnabled: false,
            }
            let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
            let mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(this.mapStyle.building))
            mesh.material.depthTest = false
            object.outline = mesh
            // object.add(mesh)
        }

        object.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2)
        object.handler = this
        return object
    }

    updateBound(map) {
        this.floors.forEach(floor => {
            if (this.showAll || floor.name === this.currentFloorNum) {
                for (let i in floor.object3D.sprites) {
                    const sprite1 = floor.object3D.sprites[i]
                    sprite1.updateBound(map)
                    sprite1.visible = true
                    for (let j = 0; j < i; j++) {
                        const sprite2 = floor.object3D.sprites[j]
                        if (sprite2.visible && sprite2.boundBox.intersectsBox(sprite1.boundBox)) {
                            sprite1.visible = false
                            break
                        }
                    }
                }
            }
        })
    }

    showFloor(floorNum) {
        if (floorNum > this.groundFloor || floorNum < -this.underFloor || floorNum === 0) {
            throw new Error('Invalid floor number.')
        }
        this.currentFloorNum = floorNum
        this.showAll = false
        if (this.object3D) {
            this.object3D.visible = true
            // this.object3D.outline && (this.object3D.outline.visible = false)
            this.object3D.children
                .filter(obj => obj.name === 'floor')
                .forEach(obj => {
                    obj.visible = obj.handler === this.getFloor(floorNum) || obj.handler.name === floorNum
                    obj.position.set(0, 0, 0)
                })
            this.object3D.scale.set(1, 1, 1)
        }
    }

    showAllFloors(showAll = true) {
        this.showAll = showAll
        if (this.object3D) {
            this.object3D.visible = true
            // this.object3D.outline && (this.object3D.outline.visible = true)
            let offset = 4
            this.object3D.children.forEach((obj, index) => {
                obj.visible = true
                if (obj.name === 'floor') {
                    obj.position.set(0, 0, index * obj.height * offset)
                }
            })
            this.object3D.scale.set(1, 1, 1)
        }
    }

    getCurrentFloor() {
        return this.currentFloorNum
    }

    getFloor(floorNum) {
        return this.floors.find(f => f.name == floorNum)
    }
}

export default Building
