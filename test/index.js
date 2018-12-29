import * as XMap from '../src'
// import * as XMap from '../src'
import Stats from './stats.min'
import { addEvent } from '../src/utils/event'

var map = new XMap.Map('#indoor-map', {
    // viewMode: XMap.ViewMode.MODE_2D,
    // showAllFloors: true,
    // showNames: false,
    // showPubPoints: false
})
map.load('./data.json')
window.map = map
window.XMap = XMap

let location = new XMap.Location('F1', 100, 0)
var marker = new XMap.Marker(location, {
    icon: 'img/marker_red_sprite.png',
    size: new XMap.Point(19, 25),
    offset: new XMap.Point(0, -12.5),
})
marker.on('click', e => console.log(e))
window.marker = marker
map.on('click', e => console.log(e))
map.on('rightClick', e => console.log(e))
marker.jump({ duration: 0.8, delay: 0.4 })
map.addOverlay(marker)

let locations = [{ x: 400, y: 0 }, { x: 20, y: 400 }, { x: -400, y: 0 }, { x: 20, y: -400 }]
var polygon = new XMap.Polygon({
    color: '#3CF9DF',
    opacity: 0.3,
    lineColor: '#3CF9DF',
    lineWidth: 4,
    floor: 'F1',
    points: locations,
})
polygon.on('click', e => console.log(e))
window.polygon = polygon
map.addOverlay(polygon)

var rectangle = new XMap.Polygon({
    color: '#e5b2ff',
    opacity: 0.3,
    lineColor: '#e5b2ff',
    lineWidth: 4,
    floor: 'F1',
    points: { type: 'rectangle', center: { x: 300, y: 300 }, width: 100, height: 100 },
})
map.addOverlay(rectangle)

var circle = new XMap.Polygon({
    color: '#f22a8d',
    opacity: 0.3,
    lineColor: '#f22a8d',
    lineWidth: 4,
    floor: 'F1',
    points: { type: 'circle', center: { x: -300, y: -300 }, radius: 200, segments: 50 },
})
map.addOverlay(circle)
window.circle = circle

map.loadTheme('light', 'theme/light.json').then(() => map.setTheme('light'))

addEvent(document.getElementById('button-home'), 'click', () => map.flyHome())
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
