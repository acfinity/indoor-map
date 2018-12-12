import { eventMixin } from '../core/event'

export const mixinMapObject = function(Class) {
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
        [`is${Class.name}`]: {
            writable: false,
            value: true,
        }
    })
}
