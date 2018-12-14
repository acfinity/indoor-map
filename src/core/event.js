import { Vector2, Vector3, Raycaster, EventDispatcher } from '../libs/threejs/three.module'

export function eventMixin(Class) {
    Object.assign(Class.prototype, EventDispatcher.prototype)
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
    const raycaster = new Raycaster()
    const mouse = new Vector2()
    const vector = new Vector3(mouse.x, mouse.y, 0.5)
    // let preHoveredEntity = undefined
    const intersectObjects = function(eventType, mo, e) {
        if (!mo.building) {
            return
        }
        let point = e.touches ? e.touches[0] : e
        vector.set(
            (point.pageX / mo.$wrapper.clientWidth) * 2 - 1,
            -(point.pageY / mo.$wrapper.clientHeight) * 2 + 1,
            0.5
        )
        raycaster.setFromCamera(vector, mo._camera)
        return raycaster.intersectObjects(
            [...mo._overlays]
                .filter(it => it.hasEventListener(eventType))
                .map(it => it.object3D)
                .concat(mo.building.floors)
                .filter(it => it.visible),
            true
        )
    }
    return function(mo) {
        mo.gestureControl.onClickListener = e => {
            let intersects = intersectObjects('click', mo, e)
            if (!intersects || intersects.length === 0) {
                return
            }
            let overlay
            if (intersects[0].object.handler && intersects[0].object.handler.isOverlay) {
                overlay = intersects[0].object.handler
                intersects[0].object.handler.dispatchEvent({ type: 'click', message: { overlay, domEvent: e } })
            }
            intersects
                .filter(it => it.object.isRoom)
                .splice(0, 1)
                .forEach(it => it.object.dispatchEvent({ type: 'click' }))
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
            // let hoveredEntity = null
            // if (intersects[0].object.handler && intersects[0].object.handler.isOverlay) {
            //     intersects[0].object.handler.dispatchEvent('click', { domEvent: e })
            //     // overlay = intersects[0].object.handler
            // }
            // if (hoveredEntity && hoveredEntity.object === preHoveredEntity) {
            //     return
            // } else {
            //     if (this._hoveredEntity != null) {
            //         this._hoveredEntity.handler.onHover && preHoveredEntity.handler.onHover(false)
            //     }
            //     if (hoveredEntity != null) {
            //         this._hoveredEntity = hoveredEntity.object
            //         this._hoveredEntity.handler.onHover && preHoveredEntity.handler.onHover(true)
            //     } else {
            //         this._hoveredEntity = null
            //     }
            // }
        }
    }
})()
