import { Vector2, SpriteMaterial, TextureLoader, LinearFilter } from '../libs/threejs/three.module'
import Overlay from './overlay'
import XSprite from '../objects/XSprite'

const MARKER_SIZE = new Vector2(20, 20)
const __options__ = new WeakMap()

class Marker extends Overlay {
    constructor(location, options = {}) {
        super()
        __options__.set(this, {})
        this.setOptions(options)

        this.currentLocation = location
        this.location = location
        this.floor = location.floor
        this.position = location.localPosition

        this.initObject3D()
    }

    setOptions({ icon, size, offset }) {
        if (typeof icon !== 'undefined') __options__.get(this).icon = icon
        if (typeof size !== 'undefined') __options__.get(this).size = size
        if (typeof offset !== 'undefined') __options__.get(this).offset = offset
        if (this.object3D && icon) {
            new TextureLoader().load(icon, t => {
                t.needsUpdate = true
                t.minFilter = LinearFilter
                this.object3D.material.map = t
            })
        }
        if (this.object3D && offset) {
            this.object3D.center.set(0.5 - offset.x / this.object3D.width, 0.5 + offset.y / this.object3D.height)
        }
    }

    initObject3D() {
        let { icon, size, offset } = __options__.get(this)
        size = size || MARKER_SIZE
        size.ceil()
        let texture = new TextureLoader().load(icon, t => {
            t.needsUpdate = true
        })
        texture.minFilter = LinearFilter
        let material = new SpriteMaterial({
            map: texture,
            sizeAttenuation: false,
            transparent: true,
            alphaTest: 0.1,
            depthTest: false,
        })

        let sprite = new XSprite(material)
        sprite.width = size.width
        sprite.height = size.height
        sprite.position.copy(this.position)
        sprite.handler = this
        sprite.type = 'Marker'
        if (offset) {
            sprite.center.set(0.5 - offset.x / size.width, 0.5 + offset.y / size.height)
        } else {
            sprite.center.set(0.5, 0.5)
        }
        sprite.renderOrder = 10
        sprite.scale.set(1e-7, 1e-7, 1)
        sprite.onViewModeChange = is3dMode => sprite.position.setZ(is3dMode ? this.currentLocation.z : 4)
        this.object3D = sprite
        return sprite
    }

    get isMarker() {
        return true
    }
}

export default Marker
