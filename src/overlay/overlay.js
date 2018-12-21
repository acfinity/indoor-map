import { eventMixin } from '../core/event'

class Overlay {
    constructor() {}

    show() {
        this.visible = true
    }

    hide() {
        this.visible = false
    }

    removeFromParent() {
        if (this.object3D && this.object3D.parent) {
            this.object3D.parent.remove(this.object3D)
        }
    }

    setLocation(location /*, animate*/) {
        this.currentLocation = location
        this.object3D.position.copy(location.localPosition)
    }
}

eventMixin(Overlay)

Object.defineProperties(Overlay.prototype, {
    visible: {
        enumerable: true,
        configurable: false,
        get: function() {
            return this.object3D && this.object3D.visible
        },
        set: function(value) {
            this.object3D && (this.object3D.visible = value)
        },
    },

    isOverlay: {
        configurable: false,
        value: true,
        writable: false,
    },
})

export default Overlay
