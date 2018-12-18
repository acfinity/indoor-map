export default class BaseControl {
    constructor(mm) {
        if (typeof mm !== 'object' || !mm.isMap) {
            throw new Error('params error')
        }
        this.$map = mm
    }

    onAdd() {}

    onRemove() {}
}
