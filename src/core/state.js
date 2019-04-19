import { Vector3 } from '../libs/threejs'
import { ViewMode } from '../constants'
import TWEEN from '../libs/Tween'

const __mapState__ = new WeakMap()
const __mapStateReset__ = new WeakMap()
const __animationList__ = new WeakMap()

const ANIMATE_DURATION = 150

const MAX_SCALE = 5
const MIN_SCALE = 0.2

function initState(mo) {
    let {
        rotateAngle = 0,
        tiltAngle = 60,
        maxTiltAngle = 75,
        minTiltAngle = 0,
        showAllFloors = false,
        showNames = true,
        showPubPoints = true,
        backgroundColor,
    } = mo.options
    let state = {
        rotateAngle: rotateAngle,
        tiltAngle: tiltAngle,
        maxTiltAngle: maxTiltAngle,
        minTiltAngle: minTiltAngle,
        center: new Vector3(0, 0, 0),
        scale: 1,
        height: 5000,
        viewMode: mo.options.viewMode || ViewMode.MODE_3D,
        showAllFloors: !!showAllFloors,
        showNames: !!showNames,
        showPubPoints: !!showPubPoints,
        backgroundColor,
    }
    let resetState = {
        ...state,
        center: new Vector3(0, 0, 0),
    }
    let tilt = Math.min(state.maxTiltAngle, Math.max(state.tiltAngle, state.minTiltAngle))
    tilt = Math.max(0, Math.min(90, tilt))
    state.tiltAngle = tilt
    __mapState__.set(mo, state)
    __mapStateReset__.set(mo, resetState)
    __animationList__.set(mo, new Map())

    mo.on('mapLoaded', () => {
        mo.setShowAllFloors(state.showAllFloors)
        changeViewMode(mo, state.viewMode === ViewMode.MODE_3D)
        state.needsUpdate = true
    })
}

function changeViewMode(mo, is3dMode) {
    function changeMode(object) {
        if (object.onViewModeChange) object.onViewModeChange(is3dMode)
        if (object.children && object.children.length > 0) {
            object.children.forEach(obj => changeMode(obj))
        }
    }
    changeMode(mo.mapScene)
}

function _transform_(mo, name, value, duration, callback) {
    let before = __animationList__.get(mo).get(name)
    if (before) {
        before.stop()
        __animationList__.get(mo).delete(name)
    }
    let state = __mapState__.get(mo)
    let obj, to
    if (typeof value === 'object') {
        obj = state[name]
        to = value
    } else {
        obj = state
        to = { [name]: value }
    }
    if (duration > 0) {
        let animation = new TWEEN.Tween(obj)
            .to(to, duration)
            .onComplete(() => {
                state.needsUpdate = true
                __animationList__.get(mo).delete(name)
                callback && callback()
            })
            .onStop(() => callback && callback(false))
            .start()
        __animationList__.get(mo).set(name, animation)
    } else {
        if (typeof value === 'object') {
            state[name].copy(value)
        } else {
            state[name] = value
        }
        state.needsUpdate = true
        callback && callback()
    }
}

function stateMixin(XMap) {
    Object.assign(XMap.prototype, {
        reset() {
            let state = __mapState__.get(this)
            let resetState = __mapStateReset__.get(this)
            Object.entries(resetState).forEach(([k, v]) => (state[k] = v))

            __mapState__.get(this).needsUpdate = true

            this.dispatchEvent({ type: 'stateChanged' })
        },

        setViewMode(mode) {
            if ((mode !== ViewMode.MODE_2D && mode !== ViewMode.MODE_3D) || mode === __mapState__.get(this).viewMode) {
                return
            }
            __mapState__.get(this).viewMode = mode
            __mapState__.get(this).needsUpdate = true

            changeViewMode(this, mode === ViewMode.MODE_3D)

            this.dispatchEvent({ type: 'stateChanged', message: this.mapScene.currentFloorNum })
        },

        flyHome(duration, callback) {
            let resetState = __mapStateReset__.get(this)
            this.flyTo(
                { x: 0, y: 0 },
                {
                    tilt: resetState.tiltAngle,
                    rotate: resetState.rotateAngle,
                    scale: resetState.scale,
                    duration,
                    callback,
                    animate: true,
                }
            )
        },

        flyTo(target, { tilt, rotate, scale, duration = ANIMATE_DURATION, callback, animate = true } = {}) {
            if (!target) {
                throw new Error('invalid target')
            }

            let center = new Vector3(0, 0, 0)
            if (target.isOverlay) {
                if (!target.object3D) {
                    throw new Error('invalid overlay')
                }
                if (!target.object3D.parent) {
                    throw new Error('overlay still not be placed on map')
                }
                if (!target.worldPosition) {
                    throw new Error('unknown error')
                }
                center.copy(target.worldPosition)
                this.setFloor(target.floor)
            } else {
                center.copy(target)
            }

            let defer = 1,
                stop = 1
            let listen = () => {
                defer << 1
                if (defer === stop) callback && callback()
            }
            if (Number.isFinite(tilt)) {
                stop << 1
                this.tiltTo({ angle: tilt, duration, callback: listen, animate })
            }
            if (Number.isFinite(rotate)) {
                stop << 1
                this.rotateTo({ angle: rotate, duration, callback: listen, animate })
            }
            if (Number.isFinite(scale)) {
                stop << 1
                this.scaleTo({ scale, duration, callback: listen, animate })
            }
            stop << 1
            this.moveTo({ position: center, duration, callback: listen, animate })
        },

        rotateTo({ angle, duration = ANIMATE_DURATION, callback, animate = true }) {
            if (!Number.isFinite(angle)) {
                throw new Error('invalid angle')
            }
            _transform_(this, 'rotateAngle', angle, animate ? duration : 0, callback)
        },

        tiltTo({ angle, duration = ANIMATE_DURATION, callback, animate = true }) {
            if (!Number.isFinite(angle)) {
                throw new Error('invalid angle')
            }
            let state = __mapState__.get(this)
            angle = Math.min(state.maxTiltAngle, Math.max(angle, state.minTiltAngle))
            angle = Math.max(0, Math.min(90, angle))
            if (__mapState__.get(this).viewMode === ViewMode.MODE_2D) {
                return
            }
            _transform_(this, 'tiltAngle', angle, animate ? duration : 0, callback)
        },

        moveTo({ position: { x = 0, y = 0 } = {}, duration = ANIMATE_DURATION, callback, animate = true }) {
            _transform_(this, 'center', { x, y, z: 0 }, animate ? duration : 0, callback)
        },

        scaleTo({ scale = 1, duration = ANIMATE_DURATION, callback, animate = true }) {
            scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
            _transform_(this, 'scale', scale, animate ? duration : 0, callback)
        },

        zoomIn(scale = 1.25) {
            this._scale_(scale)
        },

        zoomOut(scale = 0.8) {
            this._scale_(scale)
        },

        setFloor(floor) {
            let state = __mapState__.get(this)
            let before = __animationList__.get(this).get('floor')
            if (before) {
                before.stop()
                __animationList__.get(this).delete('floor')
            }
            let animation = this.mapScene.showFloor(floor)
            if (animation) {
                animation
                    .onComplete(() => {
                        state.needsUpdate = true
                        __animationList__.get(this).delete('floor')
                    })
                    .start()
                __animationList__.get(this).set('floor', animation)
            }
            state.needsUpdate = true

            this.dispatchEvent({ type: 'floorChanged', message: floor })
        },

        setShowAllFloors(showAll = true) {
            __mapState__.get(this).showAllFloors = !!showAll
            this.mapScene.showAllFloors(showAll)
            __mapState__.get(this).needsUpdate = true

            this.dispatchEvent({ type: 'stateChanged' })
        },

        forceUpdate() {
            __mapState__.get(this).needsUpdate = true
        },

        _scale_(scalar) {
            let scale = __mapState__.get(this).scale * scalar
            scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
            __mapState__.get(this).scale = scale
            __mapState__.get(this).needsUpdate = true
        },

        _translate_({ x, y, z }) {
            __mapState__.get(this).center.add({ x, y, z })
            __mapState__.get(this).needsUpdate = true
        },

        _update_: (function() {
            let offsetVector = new Vector3()
            let ZeroVector = new Vector3(0, 0, 0)
            return function(scene, camera) {
                let state = __mapState__.get(this)
                state.needsUpdate = false

                let rotate = state.rotateAngle
                let tilt = 0
                let radius = state.height / state.scale
                let center = state.center

                if (state.viewMode === ViewMode.MODE_3D) {
                    tilt = Math.min(state.maxTiltAngle, Math.max(state.tiltAngle, state.minTiltAngle))
                    tilt = Math.max(0, Math.min(90, tilt))
                }
                rotate = -(rotate / 180) * Math.PI
                tilt = (tilt / 180) * Math.PI
                camera.position.set(0, 0, radius)
                camera.lookAt(ZeroVector)
                camera.rotateOnAxis({ x: 0, y: 0, z: 1 }, rotate)
                camera.rotateOnAxis({ x: 1, y: 0, z: 0 }, tilt)

                offsetVector.x = radius * Math.sin(tilt) * Math.sin(rotate)
                offsetVector.y = -radius * Math.sin(tilt) * Math.cos(rotate)
                offsetVector.z = radius * Math.cos(tilt) - radius

                camera.position.add(offsetVector).add(center)
            }
        })(),
    })
    Object.defineProperties(XMap.prototype, {
        rotateAngle: {
            get: function() {
                return __mapState__.get(this).rotateAngle
            },
        },
        tiltAngle: {
            get: function() {
                return __mapState__.get(this).tiltAngle
            },
        },
        scale: {
            get: function() {
                return __mapState__.get(this).scale
            },
        },
        viewMode: {
            get: function() {
                return __mapState__.get(this).viewMode
            },
        },
        needsUpdate: {
            get: function() {
                let { needsUpdate = true } = __mapState__.get(this)
                return needsUpdate || __animationList__.get(this).size > 0
            },
        },
        currentFloor: {
            get: function() {
                return this.mapScene.currentFloorNum
            },
            set: function(value) {
                this.setFloor(value)
            },
        },
        showAllFloors: {
            get: function() {
                return __mapState__.get(this).showAllFloors
            },
            set: function(value) {
                this.setShowAllFloors(value)
            },
        },
        showNames: {
            get: function() {
                return __mapState__.get(this).showNames
            },
            set: function(value) {
                __mapState__.get(this).showNames = !!value
                __mapState__.get(this).needsUpdate = true
            },
        },
        showPubPoints: {
            get: function() {
                return __mapState__.get(this).showPubPoints
            },
            set: function(value) {
                __mapState__.get(this).showPubPoints = !!value
                __mapState__.get(this).needsUpdate = true
            },
        },
        backgroundColor: {
            get: function() {
                return __mapState__.get(this).backgroundColor || this.getMapStyle().background || 'white'
            },
        },
    })
}

export { stateMixin, initState }
