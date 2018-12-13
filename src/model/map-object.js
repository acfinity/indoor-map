import { eventMixin } from '../core/event'

export const mixinMapObject = function(Class, type) {
    eventMixin(Class)
    Object.assign(Class.prototype, {})
    Object.defineProperties(Class.prototype, {
        canvasScale: {
            enumerable: false,
            configurable: true,
            get: function reactiveGetter() {
                return this.$map ? this.$map._canvasScale : 1
            },
        },
        isMapObject: {
            writable: false,
            value: true,
        },
    })
    if (type) {
        Object.defineProperties(Class.prototype, {
            [`is${type}`]: {
                writable: false,
                value: true,
            },
        })
    }
}
