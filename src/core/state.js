import { Vector3 } from '../libs/threejs/three.module'
import { ViewMode } from '../constants'
import TWEEN from '../libs/Tween'

const __mapState__ = new WeakMap()
const __mapStateReset__ = new WeakMap()
const __animationList__ = new WeakMap()

const EPS = 1e-7
const ANIMATE_DURATION = 150

export function initState(mo) {
    let {
        rotateAngle = 0,
        tiltAngle = 60,
        maxTiltAngle = 75,
        minTiltAngle = 0,
        showAllFloors = false,
        showNames = true,
        showPubPoints = true,
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
    }
    let resetState = {
        ...state,
        center: new Vector3(0, 0, 0),
    }
    let tilt = Math.min(state.maxTiltAngle, Math.max(state.tiltAngle, state.minTiltAngle))
    tilt = Math.max(EPS, Math.min(90 - EPS, tilt))
    state.tiltAngle = tilt
    __mapState__.set(mo, state)
    __mapStateReset__.set(mo, resetState)
    __animationList__.set(mo, new Set())

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
    changeMode(mo.building)
}

export function stateMixin(XMap) {
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

            this.dispatchEvent({ type: 'stateChanged', message: this.building.currentFloorNum })
        },

        rotateTo({ angle, duration = ANIMATE_DURATION, callback, animate = true }) {
            let state = __mapState__.get(this)
            if (animate) {
                let animation = new TWEEN.Tween(state)
                    .to({ rotateAngle: angle }, duration)
                    .onComplete(() => {
                        state.needsUpdate = true
                        __animationList__.get(this).delete(animation)
                    })
                    .start()
                __animationList__.get(this).add(animation)
            } else {
                state.rotateAngle = angle
                state.needsUpdate = true
                callback && callback()
            }
        },

        tiltTo({ angle, duration = ANIMATE_DURATION, callback, animate = true }) {
            let state = __mapState__.get(this)
            angle = Math.min(state.maxTiltAngle, Math.max(angle, state.minTiltAngle))
            angle = Math.max(EPS, Math.min(90 - EPS, angle))
            if (__mapState__.get(this).viewMode === ViewMode.MODE_2D) {
                return
            }
            if (animate) {
                let animation = new TWEEN.Tween(state)
                    .to({ tiltAngle: angle }, duration)
                    .onComplete(() => {
                        state.needsUpdate = true
                        __animationList__.get(this).delete(animation)
                    })
                    .start()
                __animationList__.get(this).add(animation)
            } else {
                __mapState__.get(this).tiltAngle = angle
                __mapState__.get(this).needsUpdate = true
                callback && callback()
            }
        },

        zoomIn(scale = 1.25) {
            this._scale_(scale)
        },

        zoomOut(scale = 0.8) {
            this._scale_(scale)
        },

        setFloor(floor) {
            this.building.showFloor(floor)
            __mapState__.get(this).needsUpdate = true

            this.dispatchEvent({ type: 'floorChanged', message: floor })
        },

        setShowAllFloors(showAll = true) {
            __mapState__.get(this).showAllFloors = !!showAll
            this.building.showAllFloors(showAll)
            __mapState__.get(this).needsUpdate = true

            this.dispatchEvent({ type: 'stateChanged' })
        },

        _scale_(scale) {
            __mapState__.get(this).scale *= scale
            __mapState__.get(this).needsUpdate = true
        },

        _translate_({ x, y, z }) {
            __mapState__.get(this).center.add({ x, y, z })
            __mapState__.get(this).needsUpdate = true
        },

        _update_: (function() {
            let offsetVector = new Vector3()
            return function(scene, camera) {
                let state = __mapState__.get(this)
                state.needsUpdate = false
                let position = camera.position

                let rotate = state.rotateAngle - 90
                let tilt = EPS
                let radius = state.height / state.scale
                let center = state.center

                if (state.viewMode === ViewMode.MODE_3D) {
                    tilt = Math.min(state.maxTiltAngle, Math.max(state.tiltAngle, state.minTiltAngle))
                    tilt = Math.max(EPS, Math.min(90 - EPS, tilt))
                }
                rotate = (rotate / 180) * Math.PI
                tilt = (tilt / 180) * Math.PI
                offsetVector.x = radius * Math.sin(tilt) * Math.sin(rotate)
                offsetVector.y = radius * Math.cos(tilt)
                offsetVector.z = radius * Math.sin(tilt) * Math.cos(rotate)

                position.copy(center).add(offsetVector)
                camera.lookAt(center)
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
                return this.building.currentFloorNum
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
    })
}
