import { eventMixin } from '../core/event'

export const mixinMapObject = function(Class, type) {
    eventMixin(Class)
    Object.assign(Class.prototype, {})
    Object.defineProperties(Class.prototype, {
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
