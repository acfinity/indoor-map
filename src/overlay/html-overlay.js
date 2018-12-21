import Overlay from './overlay'

class HTMLOverlay extends Overlay {
    constructor(location, options) {
        super()

        this.location = location
        this.options = options
        
        if (typeof this.initialize !== 'function' || typeof this.render !== 'function') {
            throw new Error('initialize && render must be implements')
        }
        this.$el = this.initialize()
    }
}

Object.defineProperties(HTMLOverlay.prototype, {
    isHTMLOverlay: {
        configurable: false,
        value: true,
        writable: false,
    },
})

export default HTMLOverlay
