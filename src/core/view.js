import { ViewMode } from '../constants'
import THREE from '../libs/threejs/index'
import { addEvent } from '../utils/event'

const PERSPECTIVE_FOV = 20

function changeViewMode(mo, is3dMode) {
    mo.control.changeViewMode(is3dMode)
    function changeMode(object) {
        if (object.onViewModeChange) object.onViewModeChange(is3dMode)
        if (object.children && object.children.length > 0) {
            object.children.forEach(obj => changeMode(obj))
        }
    }
    changeMode(mo.building.object3D)
}

export function viewMixin(XMap) {
    Object.assign(XMap.prototype, {
        setDefaultView() {
            let camAngle = Math.PI / 2
            let camDir = [Math.cos(camAngle), Math.sin(camAngle)]
            let camLen = 5000
            let tiltAngle = (75.0 * Math.PI) / 180.0
            this._camera.position.set(-camDir[1] * camLen, Math.sin(tiltAngle) * camLen, camDir[0] * camLen)
            this._camera.lookAt(this._scene.position)

            this.control.reset()
            this.control.viewChanged = true
            return this
        },

        setViewMode(mode) {
            if ((mode !== ViewMode.MODE_2D && mode !== ViewMode.MODE_3D) || mode === this._currentViewMode) {
                return
            }
            this._currentViewMode = mode
            changeViewMode(this, mode === ViewMode.MODE_3D)
        },

        locationToViewport: (function() {
            const worldPosition = new THREE.Vector3()
            const screenPosition = new THREE.Vector4()
            return function parseLocation(location) {
                worldPosition.copy(location)
                let floor = this.building.getFloor(location.floor)
                if (!floor) {
                    throw new Error('invalid floor')
                }
                floor = floor.object3D
                if (!floor.visible) {
                    return {
                        x: -Infinity,
                        y: -Infinity,
                    }
                } else {
                    floor.localToWorld(worldPosition)
                    worldPosition.project(this._camera)
                    screenPosition
                        .copy(worldPosition)
                        .applyMatrix4(this.viewportMatrix)
                        .round()
                    return {
                        x: screenPosition.x,
                        y: screenPosition.y,
                    }
                }
            }
        })(),
    })
    Object.defineProperties(XMap.prototype, {
        viewportMatrix: {
            writable: false,
            value: new THREE.Matrix4(),
        },
    })
}

function initDom(mo) {
    mo.mapWrapper = document.createElement('div')
    mo.mapWrapper.style.overflow = 'hidden'
    mo.mapWrapper.style.width = '100%'
    mo.mapWrapper.style.height = '100%'
    mo.wrapper.appendChild(mo.mapWrapper)

    mo.overlayWrapper = document.createElement('div')
    mo.overlayWrapper.className = 'imap-overlays'
    mo.wrapper.appendChild(mo.overlayWrapper)

    mo.controlWrapper = document.createElement('div')
    mo.controlWrapper.className = 'imap-controls'
    mo.wrapper.appendChild(mo.controlWrapper)
}

function initThree(mo) {
    let width = mo.wrapper.clientWidth,
        height = mo.wrapper.clientHeight
    mo._canvasScale = Math.round(height / Math.sin((PERSPECTIVE_FOV / 180) * Math.PI))

    mo._scene = new THREE.Scene()
    mo._camera = new THREE.PerspectiveCamera(PERSPECTIVE_FOV, width / height, 140, 100000)

    //set up the lights
    let light = new THREE.AmbientLight(0x747474)
    mo._scene.add(light)

    light = new THREE.DirectionalLight(0xadadad, 1.2)
    light.position.set(4000, 4000, 4000).normalize()
    light.target.position.set(0, 0, 0)
    mo._scene.add(light)

    light = new THREE.DirectionalLight(0x333333)
    light.position.set(-4000, 2000, -4000).normalize()
    mo._scene.add(light)

    mo.renderer = new THREE.WebGLRenderer({
        antialias: true,
    })
    mo.renderer.autoClear = false
    mo.renderer.setClearColor('#ffffff')
    mo.renderer.setSize(width, height)
    let canvasDiv = mo.renderer.domElement
    mo.mapWrapper.appendChild(canvasDiv)
    canvasDiv.style.width = '100%'
    canvasDiv.style.height = '100%'
    canvasDiv.style.opacity = 0

    let hw = width / 2,
        hh = height / 2
    mo.viewportMatrix.set(hw, 0, 0, hw, 0, -hh, 0, hh)
}

export function initView(mo) {
    initDom(mo)
    initThree(mo)

    function refreshSize() {
        let width = mo.wrapper.clientWidth,
            height = mo.wrapper.clientHeight
        mo._canvasScale = Math.round(height / Math.sin((PERSPECTIVE_FOV / 180) * Math.PI))

        mo._camera.aspect = width / height
        mo._camera.updateProjectionMatrix()

        mo.renderer.setSize(width, height)
        let hw = width / 2,
            hh = height / 2
        mo.viewportMatrix.set(hw, 0, 0, hw, 0, -hh, 0, hh)
    }
    addEvent(window, 'resize', () => refreshSize())
}
