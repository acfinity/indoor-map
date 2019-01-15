import Overlay from './overlay'

class HTMLOverlay extends Overlay {
    constructor(location, options = {}) {
        super()

        this.options = options

        if (typeof this.initialize !== 'function' || typeof this.render !== 'function') {
            throw new Error('initialize && render must be implements')
        }

        Object.defineProperties(this, {
            location: {
                enumerable: true,
                configurable: true,
                value: location,
            },
            $el: {
                configurable: false,
                writable: false,
                value: this.initialize(),
            },
        })
    }

    setOptions(options = {}) {
        this.options = { ...this.options, ...options }
    }

    setLocation(location) {
        Object.defineProperties(this, {
            location: {
                enumerable: true,
                configurable: true,
                value: location,
            },
        })
    }

    // show() {
    //     this.visible = true
    // }

    // hide() {
    //     this.visible = false
    // }

    // get visible() {
    //     return this.$el && this.$el.style.display !== 'none'
    // }

    // set visible(value) {
    //     if (this.$el) {
    //         this.$el.style.display = value ? 'block' : 'none'
    //     }
    // }
}

Object.defineProperties(HTMLOverlay.prototype, {
    isHTMLOverlay: {
        configurable: false,
        value: true,
        writable: false,
    },
})

export default HTMLOverlay
