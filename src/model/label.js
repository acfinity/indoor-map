import { Vector2, Vector3, Vector4, Matrix4, Box2, Sprite } from '../libs/threejs/three.module'
import SpriteCanvasMaterial from '../libs/threejs/materials/SpriteCanvasMaterial'
import { mixinMapObject } from './map-object'

const defaultIconSize = new Vector2(15, 15)
const __needsUpdate__ = new WeakMap()
const __options__ = new WeakMap()

class Label extends Sprite {
    constructor(text, options) {
        super()
        this.text = text
        __options__.set(this, {})
        this.setOptions(options)
        this.options = { ...options }

        this._initMaterial_()

        this.type = 'Label'
        this.boundBox = new Box2()
    }

    setText(text) {
        this.text = text
    }

    setOptions({
        color = 'rgba(0,0,0,1)',
        face = 'sans-serif',
        size = 15,
        strokeColor = 'white',
        strokeWidth = 3,
    } = {}) {
        __options__.get(this).fontColor = color
        __options__.get(this).fontFace = face
        __options__.get(this).fontSize = size
        __options__.get(this).strokeColor = strokeColor
        __options__.get(this).strokeWidth = strokeWidth
    }

    setIcon({ icon, iconSize = defaultIconSize, iconPosition = 'left' } = {}) {
        let beforeIcon = __options__.get(this).icon
        beforeIcon && beforeIcon.removeEventListener('load', this._iconLoaded_)
        if (icon) {
            icon.addEventListener(
                'load',
                (this._iconLoaded_ = () => {
                    this._updateMaterial_()
                })
            )
        }
        __options__.get(this).icon = icon
        __options__.get(this).iconSize = iconSize
        __options__.get(this).iconPosition = iconPosition
    }

    _initMaterial_() {
        let options = __options__.get(this)
        this.material = new SpriteCanvasMaterial({
            measure: context => {
                context.font = options.fontSize + 'px ' + options.fontFace
                let metrics = context.measureText(this.text)
                let width = metrics.width || 1
                let height = options.fontSize * 1.2
                if (options.icon && options.icon.image) {
                    if (options.iconPosition == 'top') {
                        height += options.iconSize.height
                    } else {
                        width += options.iconSize.width + 2
                    }
                }
                width += options.strokeWidth * 2
                height += options.strokeWidth * 2
                return { width, height }
            },
            compile: (context, scale) => {
                let offsetX = options.strokeWidth,
                    offsetY = options.strokeWidth
                if (options.icon && options.icon.image) {
                    if (options.iconPosition == 'top') {
                        context.drawImage(
                            options.icon.image,
                            ((this.width - options.iconSize.width) / 2) * scale,
                            offsetY * scale,
                            options.iconSize.width * scale,
                            options.iconSize.height * scale
                        )
                        offsetY += options.iconSize.height
                    } else {
                        context.drawImage(
                            options.icon.image,
                            offsetX * scale,
                            ((this.height - options.iconSize.height) / 2) * scale,
                            options.iconSize.width * scale,
                            options.iconSize.height * scale
                        )
                        offsetX += options.iconSize.width + 2
                    }
                }
                context.font = options.fontSize * scale + 'px ' + options.fontFace
                context.fillStyle = options.fontColor
                context.strokeStyle = options.strokeColor
                context.lineWidth = options.strokeWidth * scale
                context.strokeText(this.text, offsetX * scale, (options.fontSize + offsetY) * scale)
                context.fillText(this.text, offsetX * scale, (options.fontSize + offsetY) * scale)
            },
        })
    }

    _updateMaterial_() {
        this.material.needsUpdate = true
        this.scale.set(this.width / this.canvasScale, this.height / this.canvasScale, 1)
    }

    set needsUpdate(value) {
        __needsUpdate__.set(this, value)
        if (value && this.material) {
            this._updateMaterial_()
        }
    }

    get needsUpdate() {
        return __needsUpdate__.get(this)
    }

    get width() {
        return this.material.width
    }

    get height() {
        return this.material.height
    }
}

const updateBound = (function() {
    const worldScale = new Vector3()
    const mvPosition = new Vector3()
    const vpPosition = new Vector4()

    const alignedPosition = new Vector2()
    const rotatedPosition = new Vector2()
    const viewWorldMatrix = new Matrix4()

    const vA = new Vector3()
    const vB = new Vector3()
    const vC = new Vector3()

    function transformVertex(vertexPosition, mvPosition, center, scale, sin, cos) {
        // compute position in camera space
        alignedPosition
            .subVectors(vertexPosition, center)
            .addScalar(0.5)
            .multiply(scale)
        // to check if rotation is not zero
        if (sin !== undefined) {
            rotatedPosition.x = cos * alignedPosition.x - sin * alignedPosition.y
            rotatedPosition.y = sin * alignedPosition.x + cos * alignedPosition.y
        } else {
            rotatedPosition.copy(alignedPosition)
        }
        vertexPosition.copy(mvPosition)
        vertexPosition.x += rotatedPosition.x
        vertexPosition.y += rotatedPosition.y
    }

    return function box(map) {
        worldScale.set(this.width, this.height, 1)
        viewWorldMatrix.getInverse(this.modelViewMatrix).premultiply(this.matrixWorld)
        mvPosition.setFromMatrixPosition(this.modelViewMatrix)

        mvPosition.applyMatrix4(viewWorldMatrix)
        mvPosition.project(map._camera)

        vpPosition.copy(mvPosition).applyMatrix4(map.viewportMatrix)
        if (!this.material) return
        var rotation = this.material.rotation
        var sin, cos
        if (rotation !== 0) {
            cos = Math.cos(rotation)
            sin = Math.sin(rotation)
        }

        var center = this.center

        transformVertex(vA.set(-0.5, -0.5, 0), vpPosition, center, worldScale, sin, cos)
        transformVertex(vB.set(0.5, -0.5, 0), vpPosition, center, worldScale, sin, cos)
        transformVertex(vC.set(0.5, 0.5, 0), vpPosition, center, worldScale, sin, cos)

        this.boundBox.setFromPoints([vA, vB, vC])
    }
})()

Object.assign(Sprite.prototype, {
    updateBound,
    updateScale() {
        this.scale.set(this.width / this.canvasScale, this.height / this.canvasScale, 1)
    },
})
mixinMapObject(Sprite)

mixinMapObject(Label, 'Label')

export default Label
