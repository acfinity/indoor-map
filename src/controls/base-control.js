export default class BaseControl {
    constructor(renderer) {
        this.renderer = renderer
        this.canvas = this.renderer.canvas
    }
}
