import BaseControl from './base-control'

class FloorControl extends BaseControl {
    constructor(mo) {
        super()

        this.map = mo
        this.camera = mo._camera
        this.$el = document.createElement('ul')
        this.$el.classList = ['imap-floor-control']
        this.$el.style.display = 'none'

        mo.$controlWrapper.appendChild(this.$el)
    }

    show(building) {
        this.building = building

        const floors = new Map(building.floors.map(f => [f.info.name, f]))
        if (floors.size < 2) {
            this.$el.style.display = 'none'
            return
        }
        while (this.$el.lastChild) this.$el.removeChild(this.$el.lastChild)

        building.floors
            .map(f => f.name)
            .concat('All')
            .reverse()
            .forEach(it => {
                let li = document.createElement('li')
                li.appendChild(document.createTextNode(it))
                li.addEventListener('click', () => this.showFloor(floors.get(li.innerHTML)))
                this.$el.appendChild(li)
            })
        this.$el.style.display = 'block'
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
