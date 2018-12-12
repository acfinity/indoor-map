import { mixinMapObject } from './map-object'
import THREE from '../libs/threejs/index'

export const PUB_POINT_SIZE = new THREE.Vector2(24, 24)

class PubPoint extends THREE.Sprite {
    constructor(attr, floor) {
        super()
        this.info = attr
        let { name } = attr
        this.name = name
        this.floor = floor
        this.center = new THREE.Vector2(this.info.outline[0][0][0], this.info.outline[0][0][1])
        this.boundBox = new THREE.Box2()

        this.initObject3D()
    }

    initObject3D() {
        let sprite = this
        sprite.onThemeChange = theme => {
            if (theme.materialMap.has(this.info.type)) sprite.material = theme.materialMap.get(this.info.type)
        }
        sprite.width = PUB_POINT_SIZE.width
        sprite.height = PUB_POINT_SIZE.height
        sprite.scale.set(PUB_POINT_SIZE.width / this.canvasScale, PUB_POINT_SIZE.height / this.canvasScale, 1)
        sprite.position.copy(this.center).setZ(this.floor.info.height + 5)
        sprite.handler = this
        sprite.center.set(0.5, 0)
        sprite.boundBox = new THREE.Box2()
        sprite.onViewModeChange = is3dMode => sprite.position.setZ(is3dMode ? this.floor.info.height + 5 : 3)
    }
}

mixinMapObject(PubPoint)

export default PubPoint
