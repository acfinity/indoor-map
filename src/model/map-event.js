class MapEvent {
    constructor({ type, x, y, floor, target, currentTarget, domEvent, address, hovered, outside }) {
        Object.defineProperties(this, {
            type: {
                configurable: false,
                writable: false,
                value: type,
            },
            x: {
                configurable: false,
                writable: false,
                value: x,
            },
            y: {
                configurable: false,
                writable: false,
                value: y,
            },
            floor: {
                configurable: false,
                writable: false,
                value: floor,
            },
            target: {
                configurable: false,
                writable: false,
                value: target,
            },
            currentTarget: {
                configurable: false,
                writable: false,
                value: currentTarget,
            },
            domEvent: {
                configurable: false,
                writable: false,
                value: domEvent,
            },
            address: {
                configurable: false,
                writable: false,
                value: address,
            },
            hovered: {
                configurable: false,
                writable: false,
                value: hovered,
            },
            outside: {
                configurable: false,
                writable: false,
                value: outside,
            },
        })
    }
}

export default MapEvent
