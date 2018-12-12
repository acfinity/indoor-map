import {
    Vector2,
    Vector3,
    Vector4,
    Matrix4,
    Box2,
    Texture,
    Sprite,
    SpriteMaterial,
    LinearFilter,
} from '../libs/threejs/index'
import { mixinMapObject } from './map-object'

class Label extends Sprite {
    constructor(text, options = {}) {
        let canvas = document.createElement('canvas')
        let texture = new Texture(canvas)
        texture.minFilter = LinearFilter
        let spriteMaterial = new SpriteMaterial({
            map: texture,
            sizeAttenuation: false,
            transparent: true,
            alphaTest: 0.1,
        })

        super(spriteMaterial)

        this.options = options
        this.texture = texture
        this.canvas = canvas

        this.type = 'Label'
        this.boundBox = new Box2()
        this.worldScale = new Vector3()

        this.setText(text)
    }

    setText(text) {
        this.text = text
        let fontface = this.options['fontface'] || 'sans-serif'
        let fontsize = this.options.fontsize || 16
        let color = this.options.color || 'rgba(0,0,0,1)'

        let canvas = this.canvas
        canvas.width = 512
        let context = canvas.getContext('2d')
        context.font = fontsize + 'px ' + fontface
        let metrics = context.measureText(this.text)
        canvas.width = Math.ceil(metrics.width) || 1
        canvas.height = Math.ceil(fontsize * 1.44)
        context = canvas.getContext('2d')
        context.font = fontsize + 'px ' + fontface

        // text color
        context.fillStyle = color

        context.strokeStyle = '#ffffff'
        context.lineWidth = 2
        context.strokeText(this.text, 0, fontsize)
        context.fillText(this.text, 0, fontsize)

        this.texture.needsUpdate = true

        this.originScale = this.scale.clone()
        this.width = canvas.width
        this.height = canvas.height
        return
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

export default Label
