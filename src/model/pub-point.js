import MapObject from './map-object'
import THREE from '../libs/threejs/index'

export const PUB_POINT_SIZE = new THREE.Vector2(20, 20)

class PubPoint extends MapObject {
    constructor(attr, floor) {
        super(attr)
        this.info = attr
        let { name } = attr
        this.name = name
        this.floor = floor
        this.center = new THREE.Vector2(this.info.outline[0][0][0], this.info.outline[0][0][1])
        this.boundBox = new THREE.Box2()
    }

    render() {
        if (!this.bounds) {
            throw new Error('call updateOutline first')
        }
    }

    makeObject3D() {
        let material = this.mapStyle.materialMap.get(this.info.type)
        let sprite = new THREE.Sprite(material)
        sprite.width = PUB_POINT_SIZE.width
        sprite.height = PUB_POINT_SIZE.height
        sprite.scale.set(
            PUB_POINT_SIZE.width / this.canvasScale / 2.4,
            PUB_POINT_SIZE.width / this.canvasScale / 2.4,
            1
        )
        sprite.position.copy(this.center).setZ(this.floor.info.height + 5)
        sprite.handler = this
        sprite.center.set(0.5, 0)
        sprite.updateBound = camera => this.updateBound(camera)
        sprite.boundBox = new THREE.Box2()
        this.object3D = sprite
        return sprite
    }
}

Object.assign(PubPoint.prototype, {
    updateBound: (function() {
        const mvPosition = new THREE.Vector3()
        const vpPosition = new THREE.Vector4()

        const viewportMatrix = new THREE.Matrix4()
        return function(camera) {
            let sprite = this.object3D
            mvPosition.copy(sprite.position)
            sprite.parent.localToWorld(mvPosition)

            mvPosition.project(camera)

            var a = 800 / 2
            var b = 800 / 2
            viewportMatrix.set(a, 0, 0, a /**/, 0, -b, 0, b /**/)
            vpPosition.copy(mvPosition).applyMatrix4(viewportMatrix)

            sprite.boundBox.setFromCenterAndSize(vpPosition, PUB_POINT_SIZE)
        }
    })(),
})

export default PubPoint
