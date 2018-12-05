import BaseControl from './base-control'
import { addEvent, removeEvent } from '../utils/event'
import Point from '../model/point'

class IndicatorControl extends BaseControl {
    constructor(renderer) {
        super(renderer)

        this._initListeners()
    }

    destroy() {
        this._initListeners(true)
    }

    reset() {}

    _initListeners(remove) {
        var eventType = remove ? removeEvent : addEvent
        eventType(this.canvas, 'mousedown', this)
        eventType(window, 'mouseup', this)
        eventType(this.canvas, 'mousemove', this)
        eventType(this.canvas, 'mousewheel', this)
    }

    handleEvent(e) {
        switch (e.type) {
        case 'mousedown':
            this._start(e)
            break
        case 'mousemove':
            this._move(e)
            break
        case 'mouseout':
            this.initiated = false
            break
        case 'mouseup':
            this._end(e)
            break
        case 'mousewheel':
            this._wheel(e)
            break
        }
    }

    _start(e) {
        this.initiated = true
        this.prePoint = null
        this.startPoint = new Point(e.clientX, e.clientY)
    }

    _move(e) {
        if (!this.initiated) {
            return
        }

        let prePoint = this.prePoint || this.startPoint.clone()

        let x = e.clientX,
            y = e.clientY
        if (Math.abs(x - prePoint.x) > 0 || Math.abs(y - prePoint.y) > 0) {
            this.prePoint = prePoint
            this.renderer.translate(x - this.prePoint.x, y - this.prePoint.y)
            this.prePoint.set(x, y)
        }
    }

    _end(e) {
        if (!this.initiated) {
            return
        }
        this.initiated = false
        if (this.prePoint === null) {
            console.log(`click at ${e.clientX}, ${e.clientY}`)
            console.log(
                this.renderer.worldToLocal(new Point(e.clientX, e.clientY))
            )
        }
    }

    _wheel(e) {
        let delta = e.wheelDelta ? e.wheelDelta / 120 : -e.detail / 3
        let scale = Math.pow(1.05, delta)
        this.renderer.scale(scale, {
            x: event.clientX,
            y: event.clientY,
        })
    }
}

export default IndicatorControl
