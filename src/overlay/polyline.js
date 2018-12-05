import Overlay from './overlay'

class Polyline extends Overlay {
    constructor(points, options = {}) {
        super()
        this.options = {
            strokeColor: 'green',
            strokeWidth: 2,
            lineJoin: 'round',
            lineCap: 'round',
            ...options,
        }
        this.points = points
    }

    render() {
        let drawPoints = this.points.map(p => this.parsePoint(p))
        this.context.lineWidth = this.options.strokeWidth
        this.context.strokeStyle = this.options.strokeColor
        this.context.lineJoin = 'round'
        this.context.lineCap = 'round'
        this.context.globalAlpha = this.options.opacity
        this.context.beginPath()
        drawPoints.forEach((dp, index) => {
            this.context[index === 0 ? 'moveTo' : 'lineTo'](dp.x, dp.y)
        })
        this.context.stroke()
    }
}

export default Polyline
