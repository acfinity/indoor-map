import { SpriteMaterial, Texture, LinearFilter } from '../three.module'

const __needsUpdate__ = new Map()

class SpriteCanvasMaterial extends SpriteMaterial {
    constructor({ measure, compile }) {
        let canvas = document.createElement('canvas')
        let texture = new Texture(canvas)
        texture.minFilter = LinearFilter
        super({
            map: texture,
            sizeAttenuation: false,
            transparent: true,
            alphaTest: 0.1,
        })
        this.measure = measure
        this.compile = compile

        this.needsUpdate = true
    }

    set needsUpdate(value) {
        __needsUpdate__.set(this, value)
        if (value && this.map) {
            let canvas = this.map.image
            canvas.width = 512
            canvas.height = 512
            let size = this.measure(canvas.getContext('2d'))
            canvas.width = Math.ceil(size.width)
            canvas.height = Math.ceil(size.height)
            let context = canvas.getContext('2d')
            context.imageSmoothingEnabled = true
            this.compile(context)
            this.map.needsUpdate = true
        }
    }

    get needsUpdate() {
        return __needsUpdate__.get(this)
    }

    get width() {
        return this.map.image.width
    }

    get height() {
        return this.map.image.height
    }
}

export default SpriteCanvasMaterial
