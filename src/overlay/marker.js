import Overlay from './overlay'
import THREE from '../libs/threejs/index'

const PUB_POINT_SIZE = new THREE.Vector2(20, 20)

class Marker extends Overlay {
    constructor(location, options = {}) {
        super()

        this.options = options

        this.location = location
        this.floor = location.floor
        this.position = location.localPosition

        this.makeObject3D()
    }

    makeObject3D() {
        let { icon } = this.options

        this.texture = new THREE.TextureLoader().load(icon, t => {
            t.needsUpdate = true
        })
        this.texture.minFilter = THREE.LinearFilter
        this.material = new THREE.SpriteMaterial({
            map: this.texture,
            sizeAttenuation: false,
            transparent: true,
            depthTest: false,
        })

        let sprite = new THREE.Sprite(this.material)
        let size = this.options.size || PUB_POINT_SIZE
        let align = this.options.align || 'CENTER'
        sprite.width = size.width
        sprite.height = size.height
        sprite.scale.set(size.width / this.canvasScale, size.width / this.canvasScale, 1)
        sprite.position.copy(this.position)
        sprite.handler = this
        sprite.type = 'Marker'
        if (align === 'CENTER') {
            sprite.center.set(0.5, 0.5)
        } else if (align === 'BOTTOM') {
            sprite.center.set(0.5, 0)
        }
        sprite.renderOrder = 10
        this.object3D = sprite
        return sprite
    }
}

export default Marker
