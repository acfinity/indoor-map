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

    setLocation(location /*animate*/) {
        this.object3D.position.copy(location.localPosition)
    }
}

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

    onHover: {
        enumerable: false,
        configurable: false,
        get: function() {
            return this.options && this.options.onHover
        },
    },

    onClick: {
        enumerable: false,
        configurable: false,
        get: function() {
            return this.options && this.options.onClick
        },
    },

    onAppend: {
        enumerable: false,
        configurable: false,
        get: function() {
            return this.options && this.options.onAppend
        },
    },
})

export default Overlay
