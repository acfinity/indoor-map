/**
 * make an easing function
 * @param {Number} [count=1] bounce times
 * @param {Number} [decay=0.5] decay of bouncing height
 * @param {Number} [delay=0] delay after bouncing
 * @return {Function} easing function
 */
export function bounceEasing(count = 1, decay = 0.5, delay = 0) {
    let q = Math.sqrt(decay)
    let t = (1 - delay) / ((1 - Math.pow(q, count)) / (1 - q)) / 2
    let s = 1 / Math.pow(t, 2)
    let i, temp
    return k => {
        temp = t
        for (i = 0; i < count; i++) {
            if (k < 2 * temp) {
                return (Math.pow(temp, 2) - Math.pow(k - temp, 2)) * s
            }
            k -= 2 * temp
            temp *= q
        }
        return 0
    }
}
