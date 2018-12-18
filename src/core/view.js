import {
    Vector3,
    Vector4,
    Matrix4,
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
} from '../libs/threejs/three.module'
import { addEvent } from '../utils/event'

const PERSPECTIVE_FOV = 20

export function viewMixin(XMap) {
    Object.assign(XMap.prototype, {
        setDefaultView() {
        },

        locationToViewport: (function() {
            const worldPosition = new Vector3()
            const screenPosition = new Vector4()
            return function parseLocation(location) {
                worldPosition.copy(location)
                let floor = this.building && this.building.getFloor(location.floor)
                if (!floor) {
                    throw new Error('invalid floor')
                }
                if (!floor || !floor.visible) {
                    return {
                        x: -Infinity,
                        y: -Infinity,
                        distance: Infinity,
                    }
                } else {
                    floor.localToWorld(worldPosition)
                    let distance = worldPosition.distanceTo(this._camera.position)
                    worldPosition.project(this._camera)
                    screenPosition
                        .copy(worldPosition)
                        .applyMatrix4(this.viewportMatrix)
                        .round()
                    return {
                        x: screenPosition.x,
                        y: screenPosition.y,
                        distance: distance,
                    }
                }
            }
        })(),
    })
    Object.defineProperties(XMap.prototype, {
        viewportMatrix: {
            writable: false,
            value: new Matrix4(),
        },
    })
}

function initDom(mo) {
    mo.$mapWrapper = document.createElement('div')
    mo.$mapWrapper.style.overflow = 'hidden'
    mo.$mapWrapper.style.width = '100%'
    mo.$mapWrapper.style.height = '100%'
    mo.$wrapper.appendChild(mo.$mapWrapper)

    mo.$overlayWrapper = document.createElement('div')
    mo.$overlayWrapper.className = 'xmap-overlays'
    mo.$wrapper.appendChild(mo.$overlayWrapper)

    mo.$controlWrapper = document.createElement('div')
    mo.$controlWrapper.className = 'xmap-controls'
    mo.$wrapper.appendChild(mo.$controlWrapper)
}

function initThree(mo) {
    let width = mo.$wrapper.clientWidth,
        height = mo.$wrapper.clientHeight
    mo._canvasScale = Math.round(height / Math.sin((PERSPECTIVE_FOV / 180) * Math.PI))

    mo._scene = new Scene()
    mo._camera = new PerspectiveCamera(PERSPECTIVE_FOV, width / height, 140, 100000)

    //set up the lights
    let light = new AmbientLight(0x747474)
    mo._scene.add(light)

    light = new DirectionalLight(0xadadad, 1.2)
    light.position.set(4000, 4000, 4000).normalize()
    light.target.position.set(0, 0, 0)
    mo._scene.add(light)

    light = new DirectionalLight(0x333333)
    light.position.set(-4000, 2000, -4000).normalize()
    mo._scene.add(light)

    mo.renderer = new WebGLRenderer({
        antialias: true,
        alpha: true
    })
    mo.renderer.autoClear = false
    mo.renderer.setClearColor('#ffffff')
    mo.renderer.setSize(width, height)
    let $canvasDiv = mo.renderer.domElement
    mo.$mapWrapper.appendChild($canvasDiv)
    $canvasDiv.style.width = '100%'
    $canvasDiv.style.height = '100%'
    $canvasDiv.style.opacity = 0

    let hw = width / 2,
        hh = height / 2
    mo.viewportMatrix.set(hw, 0, 0, hw, 0, -hh, 0, hh)
}

export function initView(mo) {
    initDom(mo)
    initThree(mo)

    function refreshSize() {
        let width = mo.$wrapper.clientWidth,
            height = mo.$wrapper.clientHeight
        mo._canvasScale = Math.round(height / Math.sin((PERSPECTIVE_FOV / 180) * Math.PI))

        mo._camera.aspect = width / height
        mo._camera.updateProjectionMatrix()

        mo.renderer.setSize(width, height)
        let hw = width / 2,
            hh = height / 2
        mo.viewportMatrix.set(hw, 0, 0, hw, 0, -hh, 0, hh)

        mo.updateProjectionMatrix = true
    }
    addEvent(window, 'resize', () => refreshSize())
}
