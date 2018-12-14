import { Vector2, Vector3, Vector4, Matrix4, Box2, Sprite } from '../libs/threejs/three.module'
import SpriteCanvasMaterial from '../libs/threejs/materials/SpriteCanvasMaterial'
import { mixinMapObject } from './map-object'

function getValue(value) {
    return typeof value === 'function' ? value() : value
}

const defaultIconSize = new Vector2(15, 15)
const __needsUpdate__ = new Map()

class Label extends Sprite {
    constructor(text, options = {}) {
        super()
        this.text = text
        this.options = options

        this._initMaterial_()

        this.type = 'Label'
        this.boundBox = new Box2()
    }

    setText(text) {
        this.text = text
    }

    _initMaterial_() {
        let icon, iconPosition, iconSize
        let fontface = this.options.fontface || 'sans-serif'
        let fontsize = this.options.fontSize || 15
        let strokeColor = this.options.strokeColor || 'white'
        let strokeWidth = this.options.strokeWidth || 3
        let color = this.options.color || 'rgba(0,0,0,1)'
        this.material = new SpriteCanvasMaterial({
            measure: context => {
                context.font = fontsize + 'px ' + fontface
                let metrics = context.measureText(this.text)
                let width = metrics.width || 1
                let height = fontsize * 1.2
                if (this.options.icon) {
                    icon = getValue(this.options.icon)
                    iconPosition = getValue(this.options.iconPosition) || 'left'
                    iconSize = getValue(this.options.iconSize) || defaultIconSize
                    if (iconPosition == 'top') {
                        height += iconSize.height
                    } else {
                        width += iconSize.width + 2
                    }
                } else {
                    icon = null
                }
                width += strokeWidth * 2
                height += strokeWidth * 2
                return { width, height }
            },
            compile: (context, scale) => {
                let offsetX = strokeWidth,
                    offsetY = strokeWidth
                if (icon) {
                    if (iconPosition == 'top') {
                        context.drawImage(
                            icon,
                            ((this.width - iconSize.width) / 2) * scale,
                            offsetY * scale,
                            iconSize.width * scale,
                            iconSize.height * scale
                        )
                        offsetY += iconSize.height
                    } else {
                        context.drawImage(
                            icon,
                            offsetX * scale,
                            ((this.height - iconSize.height) / 2) * scale,
                            iconSize.width * scale,
                            iconSize.height * scale
                        )
                        offsetX += iconSize.width + 2
                    }
                }
                context.font = fontsize * scale + 'px ' + fontface
                context.fillStyle = color
                context.strokeStyle = strokeColor
                context.lineWidth = strokeWidth * scale
                context.strokeText(this.text, offsetX * scale, (fontsize + offsetY) * scale)
                context.fillText(this.text, offsetX * scale, (fontsize + offsetY) * scale)
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
