import { Vector2, EventDispatcher } from '../libs/threejs/three.module'
import { getCameraRaycast } from './view'

const __preHover__ = new WeakMap()

export function eventMixin(Class) {
    if (!Class.prototype.dispatchEvent) {
        Object.assign(Class.prototype, EventDispatcher.prototype)
    }
    Object.assign(Class.prototype, {
        hasEventListener: function(type, listener) {
            if (this._listeners === undefined) return false
            var listeners = this._listeners
            return listeners[type] !== undefined && (!listener || listeners[type].indexOf(listener) !== -1)
        },
    })
    const eventMap = new Map()
    const bindEvent = (mo, eventType, fn, once) => {
        let thisMap = eventMap.get(mo)
        if (!thisMap) {
            thisMap = new Map()
            eventMap.set(mo, thisMap)
        }
        let listener = event => {
            once && mo.off(eventType, fn)
            fn(event.message)
        }
        thisMap.set(fn, listener)
        mo.addEventListener(eventType, listener)
    }
    Object.assign(Class.prototype, {
        on(eventType, fn) {
            bindEvent(this, eventType, fn)
        },
        once(eventType, fn) {
            bindEvent(this, eventType, fn, true)
        },
        off(eventType, fn) {
            let thisMap = eventMap.get(this)
            if (thisMap) {
                let listener = thisMap.get(fn)
                if (listener) {
                    thisMap.delete(fn)
                    this.removeEventListener(eventType, listener)
                }
            }
        },
    })
}

export const initEvent = (function() {
    const mouse = new Vector2()
    const intersectObjects = function(eventType, mo, e) {
        if (!mo.building) {
            return
        }
        let point = e.touches ? e.touches[0] : e
        mouse.set(point.pageX, point.pageY)

        let raycaster = getCameraRaycast(mo, mouse)
        return raycaster.intersectObjects(
            [...mo._overlays]
                .filter(it => it.hasEventListener(eventType))
                .map(it => it.object3D)
                .concat(mo.building.floors)
                .filter(it => it.visible),
            false
        )
    }
    return function(mo) {
        mo.gestureControl.onClickListener = e => {
            let intersects = intersectObjects('click', mo, e)
            if (!intersects || intersects.length === 0) {
                return
            }
            let overlay,
                fo = intersects.filter(it => it.object.isFloor || (it.object.handler && it.object.handler.isOverlay))
            if (fo[0] && fo[0].object.handler && fo[0].object.handler.isOverlay) {
                overlay = fo[0].object.handler
                fo[0].object.handler.dispatchEvent({ type: 'click', message: { overlay, domEvent: e } })
            }
            if (mo.hasEventListener('click')) {
                let floor = intersects.filter(it => it.object.isFloor)[0]
                if (floor) {
                    mo.dispatchEvent({
                        type: 'click',
                        message: {
                            x: Math.round(floor.point.x),
                            y: -Math.round(floor.point.z),
                            floor: floor.object.handler.name,
                            overlay,
                            domEvent: e,
                        },
                    })
                }
            }
        }
        mo.gestureControl.onHoverListener = e => {
            let intersects = intersectObjects('hover', mo, e)
            if (!intersects || intersects.length === 0) {
                return
            }
            let overlay,
                preHover = __preHover__.get(this),
                fo = intersects.filter(it => it.object.isFloor || (it.object.handler && it.object.handler.isOverlay))
            if (fo[0] && fo[0].object.handler && fo[0].object.handler.isOverlay) {
                overlay = fo[0].object.handler
            }
            if (preHover != overlay) {
                overlay && overlay.dispatchEvent({ type: 'hover', message: { overlay, domEvent: e, hovered: true } })
                preHover && preHover.dispatchEvent({ type: 'hover', message: { overlay, domEvent: e, hovered: false } })
            }
            if (mo.hasEventListener('hover')) {
                let floor = intersects.filter(it => it.object.isFloor)[0]
                if (floor) {
                    mo.dispatchEvent({
                        type: 'hover',
                        message: {
                            x: Math.round(floor.point.x),
                            y: -Math.round(floor.point.z),
                            floor: floor.object.handler.name,
                            overlay,
                            domEvent: e,
                        },
                    })
                }
            }
        }
    }
})()
