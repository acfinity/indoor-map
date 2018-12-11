import MapObject from './map-object'
import THREE from '../libs/threejs/index'

export const PUB_POINT_SIZE = new THREE.Vector2(18, 18)

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
        sprite.scale.set(PUB_POINT_SIZE.width / this.canvasScale, PUB_POINT_SIZE.height / this.canvasScale, 1)
        sprite.position.copy(this.center).setZ(this.floor.info.height + 5)
        sprite.handler = this
        sprite.center.set(0.5, 0)
        sprite.boundBox = new THREE.Box2()
        sprite.onViewModeChange = is3dMode => sprite.position.setZ(is3dMode ? this.floor.info.height + 5 : 3)
        this.object3D = sprite
        return sprite
    }
}

export default PubPoint
