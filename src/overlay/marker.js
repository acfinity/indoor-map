import { Vector2, Sprite, SpriteMaterial, TextureLoader, LinearFilter } from '../libs/threejs/three.module'
import Overlay from './overlay'

const PUB_POINT_SIZE = new Vector2(20, 20)

class Marker extends Overlay {
    constructor(location, options = {}) {
        super()

        this.options = options
        this.currentLocation = location
        this.location = location
        this.floor = location.floor
        this.position = location.localPosition

        this.initObject3D()
    }

    initObject3D() {
        let { icon } = this.options

        this.texture = new TextureLoader().load(icon, t => {
            t.needsUpdate = true
        })
        this.texture.minFilter = LinearFilter
        this.material = new SpriteMaterial({
            map: this.texture,
            sizeAttenuation: false,
            transparent: true,
            alphaTest: 0.1,
            depthTest: false,
        })

        let sprite = new Sprite(this.material)
        let size = PUB_POINT_SIZE
        if (typeof this.options.size === 'number' || typeof this.options.size === 'string') {
            size = Number(this.options.size)
            size = new Vector2(size, size)
        } else if (this.options.size && this.options.size.width > 0) {
            size = this.options.size
        }
        let align = this.options.align || 'CENTER'
        sprite.width = size.width
        sprite.height = size.height
        sprite.position.copy(this.position)
        sprite.handler = this
        sprite.type = 'Marker'
        if (align === 'CENTER') {
            sprite.center.set(0.5, 0.5)
        } else if (align === 'BOTTOM') {
            sprite.center.set(0.5, 0)
        }
        sprite.renderOrder = 10
        sprite.onViewModeChange = is3dMode => sprite.position.setZ(is3dMode ? this.currentLocation.z : 4)
        this.object3D = sprite
        return sprite
    }
}

export default Marker
