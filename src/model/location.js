import { Vector3 } from '../libs/threejs'

class Location {
    constructor(floor, x, y, z = 0) {
        this.floor = floor
        this.x = x
        this.y = y
        this.z = z
        let localPosition = new Vector3(x, y, z)
        Object.defineProperties(this, {
            localPosition: {
                configurable: false,
                get: function() {
                    return localPosition.set(this.x, this.y, this.z)
                },
            },
        })
    }

    set(floor, x, y, z = 0) {
        this.floor = floor
        this.x = x
        this.y = y
        this.z = z
        return this
    }

    setFloor(floor) {
        this.floor = floor
        return this
    }

    setX(x) {
        this.x = x
        return this
    }

    setY(y) {
        this.y = y
        return this
    }

    setZ(z) {
        this.z = z
        return this
    }

    copy(location) {
        this.floor = location.floor
        this.x = location.x
        this.y = location.y
        this.z = location.z
        return this
    }

    clone() {
        return new Location(this.floor, this.x, this.y, this.z)
    }
}

export default Location
