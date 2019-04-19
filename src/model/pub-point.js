import { Vector2 } from '../libs/threejs'
import { mixinMapObject } from './map-object'
import XSprite from '../objects/XSprite'

const PUB_POINT_SIZE = new Vector2(24, 24)

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
        this.width = PUB_POINT_SIZE.width
        this.height = PUB_POINT_SIZE.height
        this.scale.copy(sprite.scale)
        this.position.copy(this.center).setZ(this.floor.info.height + 5)
        this.center.set(0.5, 0)
        this.renderOrder = 99
    }

    onThemeChange(theme) {
        if (theme.materialMap.has(this.info.type)) {
            this.width = PUB_POINT_SIZE.width
            this.height = PUB_POINT_SIZE.height
            this.material = theme.materialMap.get(this.info.type).clone()
        } else {
            this.width = 0
            this.height = 0
        }
    }

    onViewModeChange(is3dMode) {
        this.position.setZ(is3dMode ? this.floor.info.height + 5 : 3)
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

export { PUB_POINT_SIZE }
