import BaseControl from './base-control'
import { compileTemplate, appendHTML } from '../utils/view'

const TEMPLATE = `
<ul class='imap-floor-control'>
  <% for(let i=0; i < data.length; i++) { %>
    <li><%= data[i] %></li>
  <% } %>
</ul>
`
const context = compileTemplate(TEMPLATE)

class FloorControl extends BaseControl {
    constructor(mo) {
        super()

        this.map = mo
        this.camera = mo._camera
        this.wrapper = mo.$controlWrapper
    }

    show(wrapper, building) {
        this.building = building

        const floors = new Map(building.floors.map(f => [f.info.name, f]))
        if (floors.size < 2) {
            return
        }
        appendHTML(wrapper, context(['All', ...building.floors.map(f => f.name).reverse()]))
        let elements = [...wrapper.getElementsByTagName('li')]
        elements.forEach(ele => ele.addEventListener('click', () => this.showFloor(floors.get(ele.innerHTML))))
    }

    showFloor(floor) {
        if (floor) {
            this.building.showFloor(floor.name)
        } else {
            this.building.showAllFloors()
        }
        this.building.updateBound(this.map)
    }
}

export default FloorControl
