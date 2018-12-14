import { Vector3 } from '../libs/threejs/three.module'
import { ViewMode } from '../constants'

const __mapState__ = new WeakMap()
const EPS = 1e-7

export function initState(mo) {
    let { rotateAngle = 0, tiltAngle = 60, maxTiltAngle = 75, minTiltAngle = 0 } = mo.options
    let state = {
        rotateAngle: (rotateAngle / 180) * Math.PI,
        tiltAngle: (tiltAngle / 180) * Math.PI,
        maxTiltAngle: (maxTiltAngle / 180) * Math.PI,
        minTiltAngle: (minTiltAngle / 180) * Math.PI,
        center: new Vector3(0, 0, 0),
        scale: 1,
        height: 5000,
        viewMode: mo.options.viewMode || ViewMode.MODE_3D,
    }
    let tilt = Math.min(state.maxTiltAngle, Math.max(state.tiltAngle, state.minTiltAngle))
    tilt = Math.max(EPS, Math.min(Math.PI * 0.37 - EPS, tilt))
    state.tiltAngle = tilt
    __mapState__.set(mo, state)

    mo.on('floorChanged', () => (state.needsUpdate = true))
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
            let camAngle = Math.PI / 2
            let camDir = [Math.cos(camAngle), Math.sin(camAngle)]
            let camLen = 5000
            let tiltAngle = (75.0 * Math.PI) / 180.0
            this._camera.position.set(-camDir[1] * camLen, Math.sin(tiltAngle) * camLen, camDir[0] * camLen)
            this._camera.lookAt(this._scene.position)
        },

        setViewMode(mode) {
            if ((mode !== ViewMode.MODE_2D && mode !== ViewMode.MODE_3D) || mode === __mapState__.get(this).viewMode) {
                return
            }
            __mapState__.get(this).viewMode = mode
            __mapState__.get(this).needsUpdate = true
            changeViewMode(this, mode === ViewMode.MODE_3D)
        },

        rotateTo({ angle, /*duration,*/ callback, animate }) {
            let state = __mapState__.get(this)
            if (animate) {
                // TODO
            } else {
                state.rotateAngle = angle
                state.needsUpdate = true
                callback && callback()
            }
        },

        tiltTo({ angle, /*duration,*/ callback, animate }) {
            let state = __mapState__.get(this)
            angle = Math.min(state.maxTiltAngle, Math.max(angle, state.minTiltAngle))
            angle = Math.max(EPS, Math.min(Math.PI * 0.37 - EPS, angle))
            if (__mapState__.get(this).viewMode === ViewMode.MODE_2D) {
                return
            }
            if (animate) {
                // TODO
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
            return function() {
                let state = __mapState__.get(this)
                state.needsUpdate = false
                let position = this._camera.position

                let rotate = state.rotateAngle - Math.PI / 2
                let tilt = EPS
                let radius = state.height / state.scale
                let center = state.center

                if (state.viewMode === ViewMode.MODE_3D) {
                    tilt = Math.min(state.maxTiltAngle, Math.max(state.tiltAngle, state.minTiltAngle))
                    tilt = Math.max(EPS, Math.min(Math.PI * 0.37 - EPS, tilt))
                }

                offsetVector.x = radius * Math.sin(tilt) * Math.sin(rotate)
                offsetVector.y = radius * Math.cos(tilt)
                offsetVector.z = radius * Math.sin(tilt) * Math.cos(rotate)

                position.copy(center).add(offsetVector)
                this._camera.lookAt(center)
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
        needsUpdate: {
            get: function() {
                let { needsUpdate = true } = __mapState__.get(this)
                return needsUpdate
            },
        },
    })
}
