import { SpriteMaterial, Texture, LinearFilter } from '../three.module'

const __needsUpdate__ = new Map()
const canvasScale = 2

class SpriteCanvasMaterial extends SpriteMaterial {
    constructor(options) {
        let canvas = document.createElement('canvas')
        let texture = new Texture(canvas)
        texture.minFilter = LinearFilter
        let { measure, compile } = options
        delete options.measure
        delete options.compile
        super({
            sizeAttenuation: false,
            transparent: true,
            depthWrite: false,
            ...options,
            map: texture,
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
            canvas.width = Math.ceil(size.width * canvasScale)
            canvas.height = Math.ceil(size.height * canvasScale)
            let context = canvas.getContext('2d')
            this.compile(context, canvasScale)
            this.map.needsUpdate = true
        }
    }

    get needsUpdate() {
        return __needsUpdate__.get(this)
    }

    get width() {
        return this.map.image.width / canvasScale
    }

    get height() {
        return this.map.image.height / canvasScale
    }
}

export default SpriteCanvasMaterial
