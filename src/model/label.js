import { Vector2 } from '../libs/threejs/three.module'
import SpriteCanvasMaterial from '../libs/threejs/materials/SpriteCanvasMaterial'
import { mixinMapObject } from './map-object'
import XSprite from '../objects/XSprite'

const defaultIconSize = new Vector2(15, 15)
const __needsUpdate__ = new WeakMap()
const __options__ = new WeakMap()

class Label extends XSprite {
    constructor(text, options) {
        super()
        this.setText(text)
        __options__.set(this, {})
        this.setOptions(options)
        this.options = { ...options }

        this._initMaterial_()

        this.type = 'Label'
    }

    setText(text) {
        this.text = text
        this.name = text
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
            sizeAttenuation: false,
            transparent: true,
            alphaTest: 0.1,
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

mixinMapObject(Label)

Object.defineProperties(Label.prototype, {
    isLabel: {
        configurable: false,
        writable: false,
        value: true,
    },
})

export default Label
