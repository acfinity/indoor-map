function invariant(key, action) {
    if (key[0] === '_') {
        throw new Error(`Invalid attempt to ${action} private "${key}" property`)
    }
}
const handler = {
    get(target, key) {
        invariant(key, 'get')
        return target[key]
    },
    set(target, key, value) {
        invariant(key, 'set')
        target[key] = value
        return true
    },
    construct: function(target, args = []) {
        return new Proxy(new target(...args), handler)
    },
}
function makeProxy(Class) {
    // return new Proxy(Class, handler)
    return Class
}

export { makeProxy }
