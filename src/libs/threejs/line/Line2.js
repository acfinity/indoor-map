/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

import { LineGeometry } from './LineGeometry'
import { LineMaterial } from './LineMaterial'
import { LineSegments2 } from './LineSegments2'

function Line2(geometry, material) {
    LineSegments2.call(this)

    this.type = 'Line2'

    this.geometry = geometry !== undefined ? geometry : new LineGeometry()
    this.material = material !== undefined ? material : new LineMaterial({ color: Math.random() * 0xffffff })
}

Line2.prototype = Object.assign(Object.create(LineSegments2.prototype), {
    constructor: Line2,

    isLine2: true,

    copy: function(source) {
        // todo

        return this
    },

    onBeforeRender: function(renderer) {
        let size = renderer.getSize()
        this.material.resolution.set(size.width, size.height)
    },
})

export { Line2 }
