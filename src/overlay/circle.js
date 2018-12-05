import Overlay from './overlay'

class Circle extends Overlay {
    constructor(center, radius, options = {}) {
        super()
        this.position = center
        this.radius = radius
        this.options = {
            strokeColor: 'blue',
            strokeWidth: 2,
            fillColor: 'rgba(255,255,255,0.5)',
            opacity: 0.8,
            ...options,
        }
    }

    render() {
        // this.context.save()
        let drawPoint = this.parsePoint(this.position)
        this.context.beginPath()
        this.context.arc(drawPoint.x, drawPoint.y, this.radius * this.rendererScale, 0, 2 * Math.PI, true)
        this.context.fillStyle = this.options.fillColor
        this.context.strokeStyle = this.options.strokeColor
        this.context.lineWidth = this.options.strokeWidth
        this.context.globalAlpha = this.options.opacity
        this.context.closePath()

        this.context.fill()
        this.options.strokeWidth > 0 && this.context.stroke()

        // this.context.restore()
    }
}

export default Circle
