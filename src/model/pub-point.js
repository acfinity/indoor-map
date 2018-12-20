import { Vector2 } from '../libs/threejs/three.module'
import { mixinMapObject } from './map-object'
import XSprite from '../objects/XSprite'

export const PUB_POINT_SIZE = new Vector2(24, 24)

class PubPoint extends XSprite {
    constructor(attr, floor) {
        super()
        this.info = attr
        let { name } = attr
        this.name = name
        this.floor = floor
        this.center = new Vector2(this.info.outline[0][0][0], this.info.outline[0][0][1])

        this.initObject3D()
    }

    initObject3D() {
        let sprite = this
        sprite.onThemeChange = theme => {
            if (theme.materialMap.has(this.info.type)) {
                sprite.material = theme.materialMap.get(this.info.type)
            }
        }
        sprite.width = PUB_POINT_SIZE.width
        sprite.height = PUB_POINT_SIZE.height
        this.scale.copy(sprite.scale)
        this.position.copy(this.center).setZ(this.floor.info.height + 5)
        sprite.handler = this
        sprite.center.set(0.5, 0)
        sprite.renderOrder = 1
        sprite.onViewModeChange = is3dMode => sprite.position.setZ(is3dMode ? this.floor.info.height + 5 : 3)
    }
}

mixinMapObject(PubPoint)

Object.defineProperties(PubPoint.prototype, {
    isPubPoint: {
        configurable: false,
        writable: false,
        value: true,
    },
})

export default PubPoint
