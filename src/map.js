import THREE from './libs/threejs/index'
import MapLoader from './loaders/map-loader'
import ThemeLoader from './loaders/theme-loader'
import OrbitControl from './controls/orbit-control'
import FloorControl from './controls/floor-control'
import { addEvent } from './utils/event'
import { mapObejctMixins } from './model/map-object'
import { overlayMixins } from './overlay/index.js'
import { ViewMode } from './constants'

const PERSPECTIVE_FOV = 20
const viewportMatrix = new THREE.Matrix4()

class Map {
    constructor(el, options = {}) {
        this.options = options
        this.wrapper = typeof el == 'string' ? document.querySelector(el) : el
        this.wrapper.style.overflow = 'hidden'

        this.currentScale = 1

        this._overlays = new Set()

        mapObejctMixins(this)
        overlayMixins(this)

        this._initView()
        this._initLoaders()

        this.themeLoader.load('normal', '/theme/normal.json')
    }

    _initDom() {
        this.mapWrapper = document.createElement('div')
        this.mapWrapper.style.overflow = 'hidden'
        this.mapWrapper.style.width = '100%'
        this.mapWrapper.style.height = '100%'
        this.wrapper.appendChild(this.mapWrapper)

        this.overlayWrapper = document.createElement('div')
        this.overlayWrapper.className = 'imap-overlays'
        this.wrapper.appendChild(this.overlayWrapper)

        this.controlWrapper = document.createElement('div')
        this.controlWrapper.className = 'imap-controls'
        this.wrapper.appendChild(this.controlWrapper)
    }

    _initView() {
        this._initDom()

        let width = this.wrapper.clientWidth,
            height = this.wrapper.clientHeight
        this._wrapperSize = new THREE.Vector2(width, height)
        this._canvasScale_ = Math.round(height / Math.sin((PERSPECTIVE_FOV / 180) * Math.PI))

        this._scene = new THREE.Scene()
        this._camera = new THREE.PerspectiveCamera(PERSPECTIVE_FOV, width / height, 140, 100000)

        this.control = new OrbitControl(this._camera, this.mapWrapper)
        this.control.onClickListener = e => this._onClicked(e)
        this.control.onHoverListener = e => this._onHover(e)

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        })
        this.renderer.autoClear = false

        this.floorControl = new FloorControl(this.renderer, this._camera)

        //set up the lights
        let light = new THREE.DirectionalLight(0xffffff)
        light.position.set(-4000, 5000, -6000)
        this._scene.add(light)

        light = new THREE.DirectionalLight(0xffffff)
        light.position.set(4000, 5000, 6000)
        this._scene.add(light)

        //canvas div
        this.renderer.setSize(width, height)
        let canvasDiv = this.renderer.domElement
        this.mapWrapper.appendChild(canvasDiv)
        canvasDiv.style.width = '100%'
        canvasDiv.style.height = '100%'

        let hw = this._wrapperSize.width / 2,
            hh = this._wrapperSize.height / 2
        viewportMatrix.set(hw, 0, 0, hw, 0, -hh, 0, hh)
    }

    _initLoaders() {
        this.mapLoader = new MapLoader(false)
        this.themeLoader = new ThemeLoader()

        addEvent(window, 'resize', () => this._refreshSize())
        addEvent(window, 'keydown', e => {
            switch (e.keyCode) {
                case 79:
                    this.building.object3D.scale.multiplyScalar(0.8)
                    break
                case 80:
                    this.building.object3D.scale.multiplyScalar(1.25)
                    break
            }
        })
    }

    load(fileName) {
        this.mapLoader.load(fileName).then(building => {
            this.floorControl.show(this.controlWrapper, building)
            this.building = building
            this.renderer.setClearColor('#F2F2F2')
            this._scene.add(building.object3D)
            // building.showAllFloors()
            building.showFloor('F1')

            this._overlays.forEach(overlay => this._addOverlay(overlay))

            this.setDefaultView()
            this.animate()
            this.building.updateBound(this._camera)
        })
    }

    getMapStyle() {
        return this.themeLoader.getTheme()
    }

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
    }

    addOverlay(overlay) {
        this._overlays.add(overlay)
        this._addOverlay(overlay)
    }

    removeOverlay(...overlays) {
        this._removeOverlays(overlays)
    }

    clearOverlays() {
        this._removeOverlays(this._overlays)
    }

    setViewMode(mode) {
        if ((mode !== ViewMode.MODE_2D && mode !== ViewMode.MODE_3D) || mode === this._currentViewMode) {
            return
        }
        this._currentViewMode = mode
        this._changeViewMode(mode === ViewMode.MODE_3D)
    }

    _changeViewMode(is3dMode) {
        this.control.changeViewMode(is3dMode)
        function changeViewMode(object) {
            if (object.onViewModeChange) object.onViewModeChange(is3dMode)
            if (object.children && object.children.length > 0) {
                object.children.forEach(obj => changeViewMode(obj))
            }
        }
        changeViewMode(this.building.object3D)
    }

    _removeOverlays(overlays) {
        overlays.forEach(overlay => {
            overlay.removeFromParent()
            this._overlays.delete(overlay)
        })
    }

    _addOverlay(overlay) {
        if (this.building) {
            let floorObj = this.building.getFloor(overlay.floor).object3D
            floorObj.add(overlay.object3D)
            overlay.onAppend && overlay.onAppend(floorObj)
        }
    }

    _onClicked(e) {
        // e.preventDefault();

        let mouse = new THREE.Vector2()
        if (e.type == 'touchstart') {
            mouse.x = (e.touches[0].clientX / this._wrapperSize.width) * 2 - 1
            mouse.y = -(e.touches[0].clientY / this._wrapperSize.height) * 2 + 1
        } else {
            mouse.x = (e.clientX / this._wrapperSize.width) * 2 - 1
            mouse.y = -(e.clientY / this._wrapperSize.height) * 2 + 1
        }
        let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5)
        if (!this._raycaster) {
            this._raycaster = new THREE.Raycaster()
        }
        this._raycaster.setFromCamera(vector, this._camera)
        let intersects = this._raycaster.intersectObjects([...this._overlays].map(overlay => overlay.object3D), false)
        if (intersects.length > 0) {
            let marker = intersects[0].object.handler
            marker.onClick && marker.onClick()
        }
    }

    _onHover(e) {
        // e.preventDefault();

        let mouse = new THREE.Vector2()
        if (e.type == 'touchstart') {
            mouse.x = (e.touches[0].clientX / this._wrapperSize.width) * 2 - 1
            mouse.y = -(e.touches[0].clientY / this._wrapperSize.height) * 2 + 1
        } else {
            mouse.x = (e.clientX / this._wrapperSize.width) * 2 - 1
            mouse.y = -(e.clientY / this._wrapperSize.height) * 2 + 1
        }
        let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5)
        if (!this._raycaster) {
            this._raycaster = new THREE.Raycaster()
        }
        let intersects
        this._raycaster.setFromCamera(vector, this._camera)
        intersects = this._raycaster.intersectObjects([...this._overlays].map(overlay => overlay.object3D), false)
        let hoveredEntity
        if (intersects.length > 0) {
            hoveredEntity = intersects[0]
        }
        if (hoveredEntity && hoveredEntity.object === this._hoveredEntity) {
            return
        } else {
            if (this._hoveredEntity != null) {
                this._hoveredEntity.handler.onHover && this._hoveredEntity.handler.onHover(false)
            }
            if (hoveredEntity != null) {
                this._hoveredEntity = hoveredEntity.object
                this._hoveredEntity.handler.onHover && this._hoveredEntity.handler.onHover(true)
            } else {
                this._hoveredEntity = null
            }
        }
    }

    _refreshSize() {
        let width = this.wrapper.clientWidth,
            height = this.wrapper.clientHeight
        this._wrapperSize = new THREE.Vector2(width, height)
        this._canvasScale_ = Math.round(height / Math.sin((PERSPECTIVE_FOV / 180) * Math.PI))

        this._camera.aspect = width / height
        this._camera.updateProjectionMatrix()

        this.renderer.setSize(width, height)
    }

    animate() {
        requestAnimationFrame(() => this.animate())
        this.control.update()
        if (this.control.viewChanged) {
            this.building && this.building.updateBound(this._camera)
        }

        this.renderer.clear()

        this.renderer.render(this._scene, this._camera)

        this.renderer.clearDepth()
        // this._relocate()
        this.control.viewChanged = false
    }

    _relocate() {
        let obj = this.testInfoWindow
        obj.worldPosition.copy(obj.localPosition)
        let floor = this.building.getFloor(obj.floor).object3D
        if (!floor.visible) {
            obj.view.style.display = 'none'
        } else {
            obj.view.style.display = 'block'
            floor.localToWorld(obj.worldPosition)
            obj.worldPosition.project(this._camera)
            obj.screenPosition
                .copy(obj.worldPosition)
                .applyMatrix4(viewportMatrix)
                .ceil()
            obj.view.style.left = obj.screenPosition.x + 'px'
            obj.view.style.top = obj.screenPosition.y - obj.view.clientHeight + 'px'
        }
    }
}

Object.defineProperties(Map.prototype, {
    _canvasScale: {
        get: function() {
            if (this._camera instanceof THREE.PerspectiveCamera) {
                return this._canvasScale_
            } else {
                return 1
            }
        },
    },
})

export default Map
