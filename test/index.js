import * as XMap from '../src'
// import * as XMap from '../src'
import Stats from './stats.min'
import { addEvent } from '../src/utils/event'

var map = new XMap.Map('#indoor-map', {
    viewMode: XMap.ViewMode.MODE_2D,
    // showAllFloors: true,
    // showNames: false,
    // showPubPoints: false
})
map.load('./data.json')
let location = new XMap.Location('F1', 100, 0)
var marker = new XMap.Marker(location, {
    icon: 'img/peopleMarker.png',
    size: new XMap.Point(25),
    offset: new XMap.Point(0, -12.5),
})
window.map = map
window.marker = marker
window.XMap = XMap
marker.on('click', e => console.log(e))
map.addOverlay(marker)
map.once('click', event => marker.setLocation(new XMap.Location(event.floor, event.x, event.y)))
map.loadTheme('light', 'theme/light.json').then(() => map.setTheme('light'))

addEvent(document.getElementById('button-2d'), 'click', () => map.setViewMode(XMap.ViewMode.MODE_2D))
addEvent(document.getElementById('button-3d'), 'click', () => map.setViewMode(XMap.ViewMode.MODE_3D))

const stats = new Stats()
stats.domElement.style.position = 'absolute'
stats.domElement.style.top = '0'
document.getElementsByTagName('body')[0].appendChild(stats.domElement)

function animate() {
    requestAnimationFrame(animate)
    stats.update()
}
animate()