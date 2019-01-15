import { Vector2, EventDispatcher } from '../libs/threejs'
import { getCameraRaycast } from './view'
import MapEvent from '../model/map-event'

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
            this.$mapWrapper.classList.add('picking')
        },
        pickEnd() {
            this.$mapWrapper.classList.remove('picking')
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
    mouse.set(point.offsetX, point.offsetY)

    if (typeof eventType === 'string') eventType = [eventType]
    let objects = Array.from(mo.mapScene.floors)
    if (!__pickMode__.get(mo)) {
        objects.splice(
            0,
            0,
            ...Array.from(mo._overlays)
                .filter(
                    it =>
                        it.object3D &&
                        it.hasEventListener &&
                        eventType.find(it2 => it.hasEventListener(it2)) &&
                        it.object3D.parent &&
                        it.object3D.parent.visible
                )
                .map(it => it.object3D)
        )
    }
    objects = objects.filter(it => it.visible)

    let raycaster = getCameraRaycast(mo, mouse)
    let intersects = raycaster.intersectObjects(objects, false)
    let top = intersects.find(it => it.object.isFloor)
    if (top) {
        let intersectsRooms = raycaster.intersectObjects(top.object.rooms, false)
        intersectsRooms && intersects.push(...intersectsRooms)
    }
    return intersects
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
        let floor = intersects && intersects.find(it => it.object.isFloor)
        let room = intersects && intersects.find(it => it.object.isRoom)
        if (floor) {
            mo.dispatchEvent({
                type,
                message: new MapEvent({
                    type,
                    x: Math.round(floor.point.x) + 0,
                    y: Math.round(floor.point.y) + 0,
                    floor: floor.object.name,
                    target: mo,
                    currentTarget: overlay,
                    domEvent: e,
                    address: `${mo.mapScene.name} ${floor.object.name} ${(room && room.object.name) || ''}`.trim(),
                    outside: false,
                }),
            })
        } else {
            mo.dispatchEvent({
                type,
                message: new MapEvent({
                    type,
                    domEvent: e,
                    currentTarget: overlay,
                    outside: true,
                }),
            })
        }
    }
}

function updateCursor(mo, intersects) {
    let overlay = null
    if (intersects && intersects.length > 0) {
        intersects = intersects.filter(
            it => !it.object.handler || !it.object.handler.isOverlay || it.object.handler.hasEventListener('click')
        )
        if (intersects.length > 0) {
            overlay = pickOverlay(intersects)
        }
    }
    mo.$mapWrapper.classList[overlay ? 'add' : 'remove']('clickable')
}

export const initEvent = function(mo) {
    mo.gestureControl.onClickListener = e => {
        if (__pickMode__.get(mo) && e.button !== 0) return
        let eventType = e.button === 0 ? 'click' : 'rightClick'
        let intersects = intersectObjects(eventType, mo, e)
        if (!intersects || intersects.length === 0) {
            dispatchMapEvent(mo, eventType, e)
            return
        }
        let overlay = pickOverlay(intersects)
        if (overlay) {
            overlay.dispatchEvent({ type: eventType, message: new MapEvent({ target: overlay, domEvent: e }) })
        }

        dispatchMapEvent(mo, eventType, e, intersects, overlay)
    }
    mo.gestureControl.onHoverListener = e => {
        let preHover = __preHover__.get(mo)
        function clearPreHover() {
            if (preHover) {
                __preHover__.delete(mo)
                preHover.dispatchEvent({
                    type: 'hover',
                    message: new MapEvent({ type: 'hover', target: overlay, domEvent: e, hovered: false }),
                })
            }
        }
        let intersects = intersectObjects(['hover', 'click'], mo, e)
        updateCursor(mo, intersects)
        let overlay = null
        if (intersects && intersects.length > 0) {
            overlay = pickOverlay(intersects)
        }
        if (preHover != overlay) {
            clearPreHover()
            if (overlay) {
                __preHover__.set(mo, overlay)
                overlay.dispatchEvent({
                    type: 'hover',
                    message: new MapEvent({ type: 'hover', target: overlay, domEvent: e, hovered: true }),
                })
            }
        }
        dispatchMapEvent(mo, 'hover', e, intersects, overlay)
    }
}
