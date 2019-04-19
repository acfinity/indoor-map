function addEvent(el, type, fn, capture) {
    el.addEventListener(type, fn, capture)
}

function removeEvent(el, type, fn, capture) {
    el.removeEventListener(type, fn, capture)
}

export { addEvent, removeEvent }
