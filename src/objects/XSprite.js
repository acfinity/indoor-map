import { Vector2, Vector3, Vector4, Matrix4, Sprite, Box2, Triangle } from '../libs/threejs/three.module'

class XSprite extends Sprite {
    constructor(...args) {
        super(...args)

        // to resolve flash when first show
        this.scale.set(1e-7, 1e-7, 1)

        this.type = 'XSprite'

        Object.defineProperties(this, {
            boundBox: {
                enumerable: true,
                configurable: false,
                writable: false,
                value: new Box2(),
            },
        })
    }

    onBeforeRender(renderer, scene, camera) {
        if (this.width && this.height) {
            this.scale.set(this.width * camera.spriteScale, this.height * camera.spriteScale, 1)
        } else {
            this.visible = false
        }
    }
}

Object.defineProperties(XSprite.prototype, {
    isXSprite: {
        configurable: false,
        writable: false,
        value: true,
    },
})

Object.assign(
    XSprite.prototype,
    (function() {
        var intersectPoint = new Vector3()
        var worldScale = new Vector3()
        var mvPosition = new Vector3()
        var vpPosition = new Vector4()

        var alignedPosition = new Vector2()
        var rotatedPosition = new Vector2()
        var viewWorldMatrix = new Matrix4()

        var vA = new Vector3()
        var vB = new Vector3()
        var vC = new Vector3()

        var uvA = new Vector2()
        var uvB = new Vector2()
        var uvC = new Vector2()

        function transformVertex(vertexPosition, mvPosition, center, scale, sin, cos, updateBound) {
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

            !updateBound && vertexPosition.applyMatrix4(viewWorldMatrix)
        }

        return {
            updateBound: function box(renderer, scene, camera) {
                worldScale.set(this.width, this.height, 1)
                viewWorldMatrix.getInverse(this.modelViewMatrix).premultiply(this.matrixWorld)
                mvPosition.setFromMatrixPosition(this.modelViewMatrix)

                mvPosition.applyMatrix4(viewWorldMatrix)
                mvPosition.project(camera)

                vpPosition.copy(mvPosition).applyMatrix4(renderer.viewportMatrix)
                if (!this.material) return
                var rotation = this.material.rotation
                var sin, cos
                if (rotation !== 0) {
                    cos = Math.cos(rotation)
                    sin = Math.sin(rotation)
                }

                var center = this.center

                transformVertex(vA.set(-0.5, -0.5, 0), vpPosition, center, worldScale, sin, cos, true)
                transformVertex(vB.set(0.5, -0.5, 0), vpPosition, center, worldScale, sin, cos, true)
                transformVertex(vC.set(0.5, 0.5, 0), vpPosition, center, worldScale, sin, cos, true)

                this.boundBox.setFromPoints([vA, vB, vC])
            },
            raycast: function(raycaster, intersects) {
                worldScale.setFromMatrixScale(this.matrixWorld)
                viewWorldMatrix.getInverse(this.modelViewMatrix).premultiply(this.matrixWorld)
                mvPosition.setFromMatrixPosition(this.modelViewMatrix)

                if (!this.material.sizeAttenuation) {
                    worldScale.multiplyScalar(-mvPosition.z)
                }

                var rotation = this.material.rotation
                var sin, cos
                if (rotation !== 0) {
                    cos = Math.cos(rotation)
                    sin = Math.sin(rotation)
                }

                var center = this.center

                transformVertex(vA.set(-0.5, -0.5, 0), mvPosition, center, worldScale, sin, cos)
                transformVertex(vB.set(0.5, -0.5, 0), mvPosition, center, worldScale, sin, cos)
                transformVertex(vC.set(0.5, 0.5, 0), mvPosition, center, worldScale, sin, cos)

                uvA.set(0, 0)
                uvB.set(1, 0)
                uvC.set(1, 1)

                // check first triangle
                var intersect = raycaster.ray.intersectTriangle(vA, vB, vC, false, intersectPoint)

                if (intersect === null) {
                    // check second triangle
                    transformVertex(vB.set(-0.5, 0.5, 0), mvPosition, center, worldScale, sin, cos)
                    uvB.set(0, 1)

                    intersect = raycaster.ray.intersectTriangle(vA, vC, vB, false, intersectPoint)
                    if (intersect === null) {
                        return
                    }
                }

                var distance = raycaster.ray.origin.distanceTo(intersectPoint)
                if (distance < raycaster.near || distance > raycaster.far) return
                intersects.push({
                    distance: distance,
                    point: intersectPoint.clone(),
                    uv: Triangle.getUV(intersectPoint, vA, vB, vC, uvA, uvB, uvC, new Vector2()),
                    face: null,
                    object: this,
                })
            },
        }
    })()
)

export default XSprite
