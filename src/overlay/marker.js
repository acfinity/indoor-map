import { Vector2, SpriteMaterial, TextureLoader, LinearFilter } from '../libs/threejs'
import Overlay from './overlay'
import XSprite from '../objects/XSprite'
import TWEEN from '../libs/Tween'
import { bounceEasing } from '../utils/animation'

const MARKER_SIZE = new Vector2(20, 20)
const __options__ = new WeakMap()

function initObject3D(obj, location) {
    let { icon, size, offset } = __options__.get(obj)
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
    sprite.position.copy(location.localPosition)
    sprite.handler = obj
    sprite.type = 'Marker'
    if (offset) {
        sprite.center.set(0.5 - offset.x / size.width, 0.5 + offset.y / size.height)
    } else {
        sprite.center.set(0.5, 0.5)
    }
    sprite.scale.set(1e-7, 1e-7, 1)
    sprite.renderOrder = 100
    sprite.onViewModeChange = is3dMode => sprite.position.setZ(is3dMode ? location.z : 4)
    return sprite
}

class Marker extends Overlay {
    constructor(location, options = {}) {
        super()
        __options__.set(this, {})
        this.setOptions(options)

        this.currentLocation = location
        this.floor = location.floor
        this.position = location.localPosition

        Object.defineProperties(this, {
            object3D: {
                configurable: false,
                writable: false,
                value: initObject3D(this, location),
            },
        })
    }

    setOptions({ icon, size, offset }) {
        let { icon: oldIcon } = __options__.get(this)
        if (typeof icon !== 'undefined') __options__.get(this).icon = icon
        if (typeof size !== 'undefined') __options__.get(this).size = size
        if (typeof offset !== 'undefined') __options__.get(this).offset = offset
        if (this.object3D && icon && icon !== oldIcon) {
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

    jump({ repeat = -1, duration = 1000, delay = 0, height = 40 } = {}) {
        this.jumpStop()
        if (duration < 1e-3) {
            duration = 1
        }
        delay = Math.max(delay, 0)
        if (height < 1e-3) {
            height = 40
        }
        let revert = () => {
            let { offset } = __options__.get(this)
            if (this.object3D && offset) {
                this.object3D.center.set(0.5 - offset.x / this.object3D.width, 0.5 + offset.y / this.object3D.height)
            }
            this._animation_ = undefined
        }
        this._animation_ = new TWEEN.Tween(this.object3D.center)
            .to({ y: -height / this.object3D.height }, duration + delay)
            .easing(bounceEasing(3, 0.4, delay / (duration + delay)))
            .repeat(repeat > -1 ? repeat : Infinity)
            .onStop(revert)
            .onComplete(revert)
            .start()
    }

    jumpStop() {
        if (this._animation_) {
            this._animation_.stop()
        }
    }

    setLocation(location /*, animate*/) {
        this.currentLocation = location
        this.object3D.position.copy(location.localPosition)
        let floor = this.object3D.parent
        if (floor && floor.isFloor && floor.name != location.floor) {
            let newFloor = floor.parent.getFloor(location.floor)
            if (newFloor) {
                floor.remove(this.object3D)
                newFloor.add(this.object3D)
            } else {
                throw new Error('invalid floor')
            }
        }
        if (this.$map) this.$map.forceUpdate()
    }
}

Object.defineProperties(Marker.prototype, {
    isMarker: {
        configurable: false,
        writable: false,
        value: true,
    },
})

export default Marker
