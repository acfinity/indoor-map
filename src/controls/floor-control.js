import BaseControl from './base-control'
import { ViewMode } from '../constants'

class FloorControl extends BaseControl {
    constructor(mm) {
        super(mm)

        this.$elAll = null
        this.$elFloor = null

        this._init_()
    }

    _init_() {
        let mm = this.$map
        this.$el = document.createElement('ul')
        this.$el.classList = ['xmap-floor-control']
        this.$el.style.display = 'none'
        mm.$controlWrapper.appendChild(this.$el)
        mm.on(
            'mapLoaded',
            (this._mapLoaded_ = () => {
                this._show_(mm.building)
            })
        )
        mm.on(
            'stateChanged',
            (this._stateChanged_ = () => {
                this._refresh_()
            })
        )
        mm.on(
            'floorChanged',
            (this._floorChanged_ = floor => {
                this.setFloor(floor)
            })
        )
        if (mm.building) {
            this._show_(mm.building)
        }
    }

    destory() {
        if (this.$map) {
            this.$map.off('mapLoaded', this._mapLoaded_)
            this.$map.off('stateChanged', this._stateChanged_)
            this.$map.off('floorChanged', this._floorChanged_)
            this.$map.$controlWrapper.appendChild(this.$el)
        }
    }

    _refresh_() {
        if (!this.$map || !this.$map.building) {
            this.$el.style.display = 'none'
        } else if (this.$elAll) {
            if (this.$map.viewMode === ViewMode.MODE_2D) {
                this.$elAll.style.display = 'none'
            } else {
                this.$elAll.style.display = 'block'
                if (this.$map.showAllFloors) {
                    this.$elAll.classList.add('active')
                } else {
                    this.$elAll.classList.remove('active')
                }
            }
        }
    }

    _show_(building) {
        this.building = building
        const floors = new Map(building.floors.map(f => [f.info.name, f]))
        if (floors.size < 2) {
            this.$el.style.display = 'none'
            this.$elAll = null
            this.$elFloor = null
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
                li.addEventListener('click', () => this.showFloor(li))
                this.$el.appendChild(li)
            })
        let [elAll, ...elFloor] = Array.from(this.$el.children)
        this.$elAll = elAll
        this.$elFloor = elFloor
        this.$el.style.display = 'block'

        this.$elAll.classList.add('btn-all')
        this._refresh_()
        this.setFloor(this.$map.currentFloor)
    }

    showFloor(li) {
        let floor = li.childNodes.item(0).data
        if (this.$elAll != li) {
            this.$elFloor.forEach(el => {
                if (el === li) {
                    el.classList.add('active')
                } else {
                    el.classList.remove('active')
                }
            })
            this.$map.setFloor(floor)
        } else {
            this.$elAll.classList.toggle('active')
            this.$map.setShowAllFloors(this.$elAll.classList.contains('active'))
        }
    }

    setFloor(floor) {
        if (this.$elFloor) {
            let active = false
            this.$elFloor.forEach(el => {
                let floorNum = el.childNodes.item(0).data
                if (floor == floorNum) {
                    el.classList.add('active')
                    active = true
                } else {
                    el.classList.remove('active')
                }
            })
            if (!active) this.$elFloor[this.$elFloor.length - 1].classList.add('active')
        }
    }
}

export default FloorControl
