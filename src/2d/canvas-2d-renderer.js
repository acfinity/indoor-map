import Rect from '../model/rect'
import Size from '../model/size'
import Point from '../model/point'

export default class Renderer {
    constructor(map) {
        this.map = map
        this.canvas = document.createElement('canvas')
        this.map.wrapper.appendChild(this.canvas)
        this.context = this.canvas.getContext('2d')
        this.transform = {
            translate: [0, 0],
            scale: 1.0
        }
        this.updateViewport()
    }

    updateViewport() {
        this.canvasSize = this.map.wrapperSize.clone()

        let halfWidth = this.canvasSize.width / 2,
            halfHeight = this.canvasSize.height / 2
        this.bounds = new Rect(-halfWidth, -halfHeight, halfWidth, halfHeight)

        this.devicePixelRatio = window.devicePixelRatio || 1
        var area = this.canvasSize.width * this.canvasSize.height * this.devicePixelRatio * this.devicePixelRatio
        this.devicePixelRatio = (area > 5E6) ? 1 : this.devicePixelRatio
        this.canvas.width = this.canvasSize.width * this.devicePixelRatio
        this.canvas.height = this.canvasSize.height * this.devicePixelRatio
        this.context.scale(this.devicePixelRatio, this.devicePixelRatio)
        this.context.translate(halfWidth, halfHeight)
    }

    render() {
        if (!this.map.mall) {
            return;
        }

        this.map.mall.render(this.context)

        this.map.getAllOverlays().forEach(ol => {
            this.context.save()
            ol.render(this.context, input => this.outlineParser(input))
            this.context.restore()
        })
    }

    translate(x = 0, y = 0) {
        this.transform.translate[0] += x;
        this.transform.translate[1] += y;
        this.context.translate(x, y);
        this.clearBg();
        this.render();
    }

    scale(scale, {
        x: originX = this.canvasSize.width / 2,
        y: originY = this.canvasSize.height / 2
    } = {}) {
        this.transform.scale *= scale;
        this.map.mall.updateOutline(input => this.outlineParser(input))

        let deltaX = originX - this.canvasSize.width / 2,
            deltaY = originY - this.canvasSize.height / 2;
        this.context.translate(-this.transform.translate[0], -this.transform.translate[1]);
        this.transform.translate[0] = this.transform.translate[0] * scale - (scale - 1) * deltaX;
        this.transform.translate[1] = this.transform.translate[1] * scale - (scale - 1) * deltaY;;
        this.context.translate(...this.transform.translate);
        this.clearBg();
        this.render();
    }

    setDefaultView() {
        let floor = this.map.mall.getFloor(this.map.mall.getCurrentFloor())
        this.mapCenter = floor.bounds.center;
        this.map.mall.updateOutline(input => this.outlineParser(input))
        let floorSize = floor.bounds.size
        var scaleX = (this.map.wrapperSize.width * (1 - 0.2)) / floorSize.width;
        var scaleY = (this.map.wrapperSize.height * (1 - 0.2)) / floorSize.height;

        this.context.translate(-this.transform.translate[0], -this.transform.translate[1]);
        this.transform.scale = 1.0;
        this.transform.translate = [0, 0]
        this.scale(Math.min(scaleX, scaleY));
    }

    reset() { }

    outlineParser(input) {
        if (typeof input === 'string') {
            this.context.font = "13px/1.4 'Lantinghei SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Helvetica Neue', Helvetica, STHeiTi, Arial, sans-serif"
            return new Size(this.context.measureText(input).width, 13)
        } else {
            return new Point(...this.updatePoint([input.x, input.y], this.transform.scale))
        }
    }

    updatePoint(point, scale) {
        return [((point[0] - this.mapCenter.x) * scale) >> 0, ((point[1] - this.mapCenter.y) * scale) >> 0];
    }

    localToWorld(pt) {
        return new Point((pt.x + this.transform.translate[0] + this.map.wrapperSize.width) >> 1,
            (pt.y + this.transform.translate[1] + this.map.wrapperSize.height) >> 1);
    }

    worldToLocal(pt) {
        return new Point((pt.x - this.transform.translate[0] - this.canvasSize.width / 2) / this.transform.scale,
            (pt.y - this.transform.translate[1] - this.canvasSize.height / 2) / this.transform.scale);
    }

    clearBg() {
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.fillStyle = '#ffffff';
        this.context.fillRect(0, 0, this.canvasSize.width * this.devicePixelRatio, this.canvasSize.height * this.devicePixelRatio);
        this.context.restore();
    }

}