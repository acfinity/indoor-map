class Point {
    constructor(x, y = x) {
        this.x = x
        this.y = y
    }

    setX(x) {
        this.x = x

        return this
    }

    setY(y) {
        this.y = y

        return this
    }

    setWidth(value) {
        return this.setX(value)
    }

    setHeight(value) {
        return this.setY(value)
    }

    floor() {
        this.x = Math.floor(this.x)
        this.y = Math.floor(this.y)

        return this
    }

    ceil() {
        this.x = Math.ceil(this.x)
        this.y = Math.ceil(this.y)

        return this
    }

    round() {
        this.x = Math.round(this.x)
        this.y = Math.round(this.y)

        return this
    }

    set width(value) {
        this.x = value
    }

    get width() {
        return this.x
    }

    set height(value) {
        this.y = value
    }

    get height() {
        return this.y
    }
}

export default Point
