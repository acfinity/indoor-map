export const addEvent = (el, type, fn, capture) => {
    el.addEventListener(type, fn, capture)
}

export const removeEvent = (el, type, fn, capture) => {
    el.removeEventListener(type, fn, capture)
}
