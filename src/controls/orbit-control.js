import { addEvent, removeEvent } from '../utils/event'
import THREE from '../libs/threejs/index'

const STATE = {
    NONE: -1,
    ROTATE: 0,
    ZOOM: 1,
    PAN: 2,
    CLICK: 3,
    TOUCH_ROTATE: 5,
    TOUCH_ZOOM_PAN: 6,
}
const userRotateSpeed = 2.0
const autoRotateSpeed = 1.0
const autoRotationAngle = ((2 * Math.PI) / 60 / 60) * autoRotateSpeed
const EPS = 1e-7
const PIXELS_PER_ROUND = 1800
const SCALE_STEP = 1.05
const TOUCH_SCALE_STEP = 1.03

class OrbitControl {
    constructor(camera, wrapper) {
        this.camera = camera
        this.wrapper = wrapper

        this.minPolarAngle = 0 // radians
        this.maxPolarAngle = Math.PI / 2 // radians

        this.minDistance = 0
        this.maxDistance = Infinity

        this.enabled = true
        this.scrollWheelZoomEnabled = true
        this.viewChanged = true

        this.onClickListener = null

        this.onHoverListener = null
        this.is3dMode = true

        this._initListeners()
        this._initVars()
    }

    destroy() {
        this._initListeners(true)
    }

    reset() {
        this._initVars()
    }

    pan(start, end) {
        let vector = this.viewToWorld(start).sub(this.viewToWorld(end))
        // let worldEnd = this.viewToWorld(end)
        // let offset = vector.length()
        // if(offset>)
        // console.log(offset)
        this.camera.position.add(vector)
        this.center.add(vector)

        this.viewChanged = true
    }

    rotateLeft(angle = autoRotationAngle) {
        this.thetaDelta -= angle
    }

    rotateRight(angle = autoRotationAngle) {
        this.thetaDelta += angle
    }

    rotateUp(angle = autoRotationAngle) {
        this.phiDelta -= angle
    }

    rotateDown(angle = autoRotationAngle) {
        this.phiDelta += angle
    }

    zoomIn(scale = 1.25) {
        this.scale *= scale
        this.currentScale *= scale
    }

    zoomOut(scale = 0.8) {
        this.scale *= scale
        this.currentScale *= scale
    }

    changeViewMode(is3dMode) {
        if (this.is3dMode === is3dMode) {
            return
        }
        let count = 10
        this.is3dMode = is3dMode
        if (is3dMode) {
            let temp = setInterval(() => {
                this.phiDelta = this.phi / 10
                count--
                if (!count) {
                    clearInterval(temp)
                }
            }, 1000 / 60)
        } else {
            let temp = setInterval(() => {
                this.phiDelta = -this.phi / 10
                count--
                if (!count) {
                    clearInterval(temp)
                }
            }, 1000 / 60)
        }
    }

    update() {
        let position = this.camera.position
        let offset = position.clone().sub(this.center)

        // angle from z-axis around y-axis
        let theta = Math.atan2(offset.x, offset.z)
        // angle from y-axis

        let phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y)

        if (this.autoRotate) {
            this.rotateLeft(autoRotationAngle)
        }

        theta += this.thetaDelta
        phi += this.phiDelta

        // restrict phi to be between desired limits
        phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi))

        // restrict phi to be betwee EPS and PI-EPS
        phi = this.phi = Math.max(EPS, Math.min(Math.PI * 0.37 - EPS, phi))
        if (this.is3dMode) {
            this.phi = phi
        } else {
            // phi = 0
        }

        let radius = offset.length() / this.scale

        // restrict radius to be between desired limits
        radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius))

        offset.x = radius * Math.sin(phi) * Math.sin(theta)
        offset.y = radius * Math.cos(phi)
        offset.z = radius * Math.sin(phi) * Math.cos(theta)

        position.copy(this.center).add(offset)
        this.camera.lookAt(this.center)
        this.thetaDelta = 0
        this.phiDelta = 0
        this.scale = 1

        if (this.lastPosition.distanceTo(this.camera.position) > 0) {
            this.lastPosition.copy(this.camera.position)
            this.viewChanged = true
        }
    }

    _initVars() {
        this.startPosition = new THREE.Vector2()
        this.endPosition = new THREE.Vector2()
        this.deltaVector = new THREE.Vector2()
        this.touchStartPoints = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()]
        this.touchEndPoints = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()]

        this.cameraInverseMatrix = new THREE.Matrix4()

        this.phiDelta = 0
        this.thetaDelta = 0
        this.scale = 1
        this.currentScale = 1

        this.state = STATE.NONE

        this.lastPosition = new THREE.Vector3()

        this.center = new THREE.Vector3()
    }

    _initListeners(remove) {
        let eventType = remove ? removeEvent : addEvent
        eventType(this.wrapper, 'touchstart', this, {
            passive: false,
        })
        eventType(this.wrapper, 'mousedown', this, {
            passive: false,
        })
        eventType(window, 'touchend', this, {
            passive: false,
        })
        eventType(window, 'mouseup', this, {
            passive: false,
        })
        eventType(window, 'touchmove', this, {
            passive: false,
        })
        eventType(window, 'mousemove', this)
        eventType(this.wrapper, 'mousewheel', this)
        eventType(window, 'contextmenu', this, false)
    }

    handleEvent(e) {
        switch (e.type) {
            case 'touchstart':
            case 'mousedown':
                if (e.touches && e.touches.length > 1) {
                    this._touchStart(e)
                } else {
                    this._start(e)
                }
                break
            case 'touchmove':
            case 'mousemove':
                if (e.touches && e.touches.length > 1 && (this.state === STATE.ZOOM || this.state === STATE.ROTATE)) {
                    this._touchMove(e)
                } else {
                    this._move(e)
                }
                break
            case 'mouseout':
                this.state = STATE.NONE
                break
            case 'touchend':
            case 'mouseup':
                this._end(e)
                break
            case 'mousewheel':
                this._wheel(e)
                break
            case 'contextmenu':
                e.preventDefault()
                break
        }
        e.preventDefault()
    }

    _start(e) {
        if (!this.enabled) return

        // e.preventDefault()

        if (this.state === STATE.NONE) {
            if (e.button === 0 || (e.touches && e.touches.length == 1)) {
                this.state = STATE.CLICK
            } else if (e.button === 1) {
                this.state = STATE.ZOOM
            } else if (e.button === 2) {
                this.state = STATE.ROTATE
            }
        }

        const point = e.touches ? e.touches[0] : e

        this.startPosition.set(point.pageX, point.pageY)
    }

    _move(e) {
        if (!this.enabled) return
        if (this.state !== STATE.NONE) {
            // e.preventDefault()
            const point = e.touches ? e.touches[0] : e

            this.endPosition.set(point.pageX, point.pageY)
            this.deltaVector.subVectors(this.endPosition, this.startPosition)
            if (this.deltaVector.length() == 0) {
                return
            }
            if (this.state === STATE.ROTATE) {
                this.rotateLeft(((2 * Math.PI * this.deltaVector.x) / PIXELS_PER_ROUND) * userRotateSpeed)
                this.is3dMode &&
                    this.rotateUp(((2 * Math.PI * this.deltaVector.y) / PIXELS_PER_ROUND) * userRotateSpeed)
            } else if (this.state === STATE.ZOOM) {
                if (this.deltaVector.y > 0) {
                    this.zoomIn()
                } else {
                    this.zoomOut()
                }
            } else if (this.state === STATE.CLICK || this.state === STATE.PAN) {
                this.state = STATE.PAN
                this.pan(this.startPosition, this.endPosition)
            }
            this.startPosition.copy(this.endPosition)
        } else if (this.onHoverListener && this.wrapper.contains(e.target)) {
            this.onHoverListener(e)
        }
    }

    _end(e) {
        if (!this.enabled) return
        if (this.state === STATE.NONE) return
        let state = this.state
        this.state = STATE.NONE
        if (state === STATE.CLICK && this.onClickListener) {
            this.onClickListener(e)
        }
    }

    _wheel(e) {
        if (!this.enabled) return
        if (!this.scrollWheelZoomEnabled) return

        let delta = e.wheelDelta ? e.wheelDelta / 120 : -e.detail / 3
        let scale = Math.pow(SCALE_STEP, delta)
        this.scale *= scale
        this.currentScale *= scale
    }

    _touchStart(e) {
        if (!this.enabled) return
        ;[...e.touches]
            .filter((_, i) => i < 3)
            .map(({ pageX, pageY }, index) => this.touchStartPoints[index].set(pageX, pageY))
        if (e.touches.length === 2) {
            this.state = STATE.ZOOM
            this.span.innerHTML = '_touchStart'
        } else {
            this.state = STATE.ROTATE
        }
    }

    _touchMove(e) {
        if (!this.enabled) return
        if (this.state === STATE.NONE) return
        ;[...e.touches]
            .filter((_, i) => i < 3)
            .map(({ pageX, pageY }, index) => this.touchEndPoints[index].set(pageX, pageY))
        this.span.innerHTML = '_touchMove'
        if (this.state === STATE.ZOOM) {
            let dStart = this.touchStartPoints[1].distanceTo(this.touchStartPoints[0])
            let dEnd = this.touchEndPoints[1].distanceTo(this.touchEndPoints[0])
            if (Math.abs(dStart - dEnd) < 5) {
                return
            } else if (dStart < dEnd) {
                this.zoomIn(TOUCH_SCALE_STEP)
            } else {
                this.zoomOut(1 / TOUCH_SCALE_STEP)
            }
            // } else if (this.state === STATE.ROTATE) {
        }
        this.touchEndPoints.forEach((p, i) => this.touchStartPoints[i].copy(p))
    }
}

Object.assign(OrbitControl.prototype, Object.create(THREE.EventDispatcher.prototype))
Object.assign(OrbitControl.prototype, {
    viewToWorld: (function() {
        const raycaster = new THREE.Raycaster()
        const vector = new THREE.Vector3(0, 0, 0.5)
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

        return function(point) {
            vector.x = (point.x / this.wrapper.clientWidth) * 2 - 1
            vector.y = -(point.y / this.wrapper.clientHeight) * 2 + 1
            raycaster.setFromCamera(vector, this.camera)
            let result = new THREE.Vector3()
            raycaster.ray.intersectPlane(plane, result)
            return result
        }
    })(),
})

export default OrbitControl
