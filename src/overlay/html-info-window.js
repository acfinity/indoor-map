import HTMLOverlay from './html-overlay'

class HTMLInfoWindow extends HTMLOverlay {
    constructor(location, options = {}) {
        super(location)
        this.options = options
    }

    initialize() {
        let span = document.createElement('span')
        span.style.border = 'solid 1px red'
        span.style.background = 'white'
        span.style.position = 'absolute'
        span.style.padding = '3px 4px'
        span.style.padding = '3px 4px'
        span.style.width = '130px'
        span.style.fontSize = '14px'
        span.appendChild(document.createTextNode(this.options.content))
        return span
    }

    render(position) {
        this.$el.style.left = position.x + 'px'
        this.$el.style.top = position.y - this.$el.clientHeight + 'px'
        this.$el.style.zIndex = position.zIndex
    }
}

export default HTMLInfoWindow
