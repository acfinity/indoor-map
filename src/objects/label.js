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

function Label(text, options = {}) {
    this.options = options

    let canvas = document.createElement('canvas')
    let texture = new Texture(canvas)
    texture.minFilter = LinearFilter
    this.texture = texture
    this.canvas = canvas
    let spriteMaterial = new SpriteMaterial({
        map: texture,
        sizeAttenuation: false,
    })

    Sprite.call(this, spriteMaterial)

    this.type = 'Label'
    this.boundBox = new Box2()
    this.worldScale = new Vector3()

    this.setText(text)
}

Label.prototype = Object.assign(Object.create(Sprite.prototype), {
    constructor: Label,
    isLabel: true,
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
        canvas.width = metrics.width || 1
        canvas.height = fontsize * 1.44
        context = canvas.getContext('2d')
        context.font = fontsize + 'px ' + fontface

        // text color
        context.fillStyle = color

        context.strokeStyle = '#ffffff'
        context.lineWidth = 3
        context.strokeText(this.text, 0, fontsize)
        context.fillText(this.text, 0, fontsize)

        this.texture.needsUpdate = true

        this.scale.set(canvas.width / 2339, canvas.height / 2339, 1.0)
        this.originScale = this.scale.clone()
        this.width = canvas.width
        this.height = canvas.height
        return
    },
    updateBound: (function() {
        const worldScale = new Vector3()
        const mvPosition = new Vector3()
        const vpPosition = new Vector4()

        const alignedPosition = new Vector2()
        const rotatedPosition = new Vector2()
        const viewWorldMatrix = new Matrix4()

        const vA = new Vector3()
        const vB = new Vector3()
        const vC = new Vector3()

        const viewportMatrix = new Matrix4()

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

        return function box(camera) {
            worldScale.set(this.width, this.height, 1)
            viewWorldMatrix.getInverse(this.modelViewMatrix).premultiply(this.matrixWorld)
            mvPosition.setFromMatrixPosition(this.modelViewMatrix)

            mvPosition.applyMatrix4(viewWorldMatrix)

            mvPosition.project(camera)

            var a = 800 / 2
            var b = 800 / 2
            viewportMatrix.set(a, 0, 0, a /**/, 0, -b, 0, b /**/)
            vpPosition.copy(mvPosition).applyMatrix4(viewportMatrix)

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
    })(),
})

export default Label
