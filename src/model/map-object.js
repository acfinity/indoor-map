import { eventMixin } from '../core/event'

export const mixinMapObject = function(Class) {
    eventMixin(Class)
    Object.defineProperties(Class.prototype, {
        isMapObject: {
            configurable: false,
            writable: false,
            value: true,
        },
        $map: {
            get: function() {
                return this.parent && this.parent.$map
            },
        },
    })
}
