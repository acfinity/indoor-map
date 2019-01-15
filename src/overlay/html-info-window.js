import HTMLOverlay from './html-overlay'

class HTMLInfoWindow extends HTMLOverlay {
    initialize() {
        let span = document.createElement('span')
        span.style.border = 'solid 1px red'
        span.style.background = 'white'
        span.style.position = 'absolute'
        span.style.padding = '3px 4px'
        span.style.width = '130px'
        span.style.fontSize = '14px'
        let textNode = document.createTextNode(this.options.content)
        span.appendChild(textNode)
        Object.defineProperties(this, {
            textNode: {
                configurable: false,
                writable: false,
                value: textNode,
            },
        })
        return span
    }

    render({ x, y, zIndex, visible }) {
        if (visible) {
            let { offset: { x: offsetX = 0, y: offsetY = 0 } = {} } = this.options || {}

            this.$el.style.left = x + offsetX + 'px'
            this.$el.style.top = y - this.$el.clientHeight + offsetY + 'px'
            this.$el.style.zIndex = zIndex
            this.$el.style.display = 'block'
        } else {
            this.$el.style.display = 'none'
        }
    }

    setOptions(options = {}) {
        super.setOptions(options)
        if (options.content) {
            this.textNode.replaceWith(options.content)
        }
    }
}

Object.defineProperties(HTMLInfoWindow.prototype, {
    isHTMLInfoWindow: {
        configurable: false,
        writable: false,
        value: true,
    },
})

export default HTMLInfoWindow
