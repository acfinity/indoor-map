import Overlay from './overlay'

class Polygon extends Overlay {
    constructor(points, options = {}) {
        super()
        this.options = {
            strokeColor: 'blue',
            strokeWidth: 2,
            lineJoin: 'round',
            lineCap: 'round',
            fillColor: 'rgba(255,255,255,0.5)',
            opcaity: 0.8,
            clickable: true,
            ...options,
        }
        this.points = points
    }

    render() {
        let drawPoints = this.points.map(p => this.parsePoint(p))
        this.context.lineWidth = this.options.strokeWidth
        this.context.strokeStyle = this.options.strokeColor
        this.context.lineJoin = this.options.lineJoin
        this.context.lineCap = this.options.lineCap
        this.context.fillStyle = this.options.fillColor
        this.context.globalAlpha = this.options.opcaity
        this.context.beginPath()
        drawPoints.forEach((dp, index) => {
            this.context[index === 0 ? 'moveTo' : 'lineTo'](dp.x, dp.y)
        })
        this.context.closePath()
        this.context.fill()
        this.options.strokeWidth > 0 && this.context.stroke()
    }
}

export default Polygon
