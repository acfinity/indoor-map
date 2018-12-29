import { Vector2, EventDispatcher } from '../libs/threejs/index'
import { getCameraRaycast } from './view'

const __preHover__ = new WeakMap()
const __pickMode__ = new WeakMap()

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
        pickStart() {
            __pickMode__.set(this, true)
        },
        pickEnd() {
            __pickMode__.delete(this)
        },
    })
}

const mouse = new Vector2()
function intersectObjects(eventType, mo, e) {
    if (!mo.mapScene) {
        return
    }
    let point = e.touches ? e.touches[0] : e
    mouse.set(point.pageX, point.pageY)

    let objects = Array.from(mo.mapScene.floors)
    if (!__pickMode__.get(mo)) {
        objects.splice(
            0,
            0,
            ...Array.from(mo._overlays)
                .filter(
                    it =>
                        it.hasEventListener(eventType) &&
                        it.object3D &&
                        it.object3D.parent &&
                        it.object3D.parent.visible
                )
                .map(it => it.object3D)
        )
    }
    objects = objects.filter(it => it.visible)

    let raycaster = getCameraRaycast(mo, mouse)
    return raycaster.intersectObjects(objects, false)
}

function pickOverlay(intersects) {
    let overlays = intersects.filter(it => it.object.handler && it.object.handler.isOverlay)
    let fronts = overlays.filter(it => !it.object.material.depthTest)
    let floor = intersects.find(it => it.object.isFloor)
    let overlay
    if (fronts.length > 0) {
        overlay = fronts[0]
    } else if (overlays.length > 0) {
        overlay = !floor || floor.distance + 1 > overlays[0].distance ? overlays[0] : undefined
    }
    if (overlay) {
        overlay = overlay.object.handler
    }
    return overlay
}

function dispatchMapEvent(mo, type, e, intersects, overlay) {
    if (mo.hasEventListener(type)) {
        let floor = intersects.filter(it => it.object.isFloor)[0]
        if (floor) {
            mo.dispatchEvent({
                type,
                message: {
                    x: Math.round(floor.point.x),
                    y: Math.round(floor.point.y),
                    floor: floor.object.handler.name,
                    target: mo,
                    currentTarget: overlay,
                    domEvent: e,
                },
            })
        }
    }
}

export const initEvent = function(mo) {
    mo.gestureControl.onClickListener = e => {
        if (__pickMode__.get(mo) && e.button !== 0) return
        let eventType = e.button === 0 ? 'click' : 'rightClick'
        let intersects = intersectObjects(eventType, mo, e)
        if (!intersects || intersects.length === 0) {
            return
        }
        let overlay = pickOverlay(intersects)
        if (overlay) {
            overlay.dispatchEvent({ type: eventType, message: { target: overlay, domEvent: e } })
        }

        dispatchMapEvent(mo, eventType, e, intersects, overlay)
    }
    mo.gestureControl.onHoverListener = e => {
        if (__pickMode__.get(mo)) return
        let intersects = intersectObjects('hover', mo, e)
        if (!intersects || intersects.length === 0) {
            return
        }
        let overlay = pickOverlay(intersects)
        let preHover = __preHover__.get(this)
        if (preHover != overlay) {
            overlay &&
                overlay.dispatchEvent({ type: 'hover', message: { target: overlay, domEvent: e, hovered: true } })
            preHover &&
                preHover.dispatchEvent({ type: 'hover', message: { target: overlay, domEvent: e, hovered: false } })
        }
        dispatchMapEvent(mo, 'hover', e, intersects, overlay)
    }
}
