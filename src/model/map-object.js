import { eventMixin } from '../core/events'

export function mixinMapObject(Class) {
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
