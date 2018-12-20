import { Vector3, Group } from '../libs/threejs/three.module'
import { mixinMapObject } from './map-object'
import Floor from './floor'
import TWEEN from '../libs/Tween'
import { ViewMode } from '../constants'

const FLOOR_SPACE = 600

class Building extends Group {
    constructor(attr = {}) {
        super()
        let {
            building,
            building: { groundFloors = 1, underFloors = 0, defaultFloor = 'F1' },
            floors = [],
            floorSize = floors.length,
        } = attr
        this.info = building
        if (
            groundFloors < 0 ||
            underFloors < 0 ||
            groundFloors + underFloors === 0 ||
            groundFloors + underFloors != floorSize
        ) {
            throw new Error('Invalid floor count.')
        }
        this.groundFloor = groundFloors
        this.underFloor = underFloors

        this.floors = []
        floors.forEach(f => {
            this.floors.push(new Floor(f))
        })

        this.initObject3D()

        this.showFloor(defaultFloor)

        this.onViewModeChange = () => {
            this.showAllFloors()
        }
    }

    initObject3D() {
        let object = this
        object.type = 'Building'
        object.sprites = []
        this.floors.forEach((floor, index) => {
            object.add(floor)
            object.sprites.push(...floor.sprites)
            floor.position.setZ(index * FLOOR_SPACE)
        })

        this.showAllFloors()

        object.rotateOnAxis(new Vector3(1, 0, 0), -Math.PI / 2)
    }

    updateBound(map) {
        this.floors
            .filter(it => it.visible)
            .forEach(floor => {
                for (let i in floor.sprites) {
                    const sprite1 = floor.sprites[i]
                    if (!map.showNames && !sprite1.isPubPoint) {
                        sprite1.visible = false
                        continue
                    }
                    if (!map.showPubPoints && sprite1.isPubPoint) {
                        sprite1.visible = false
                        continue
                    }
                    sprite1.updateBound(map)
                    sprite1.visible = true
                    for (let j = 0; j < i; j++) {
                        const sprite2 = floor.sprites[j]
                        if (sprite2.visible && sprite2.boundBox.intersectsBox(sprite1.boundBox)) {
                            sprite1.visible = false
                            break
                        }
                    }
                }
            })
    }

    showFloor(floorNum) {
        if (floorNum > this.groundFloor || floorNum < -this.underFloor || floorNum === 0) {
            throw new Error('Invalid floor number.')
        }
        let current = this.getFloor(this.currentFloorNum)
        let target = this.getFloor(floorNum)
        if (current == target) {
            return
        }
        this.currentFloorNum = floorNum

        if (!this._shouldShowAll_()) {
            if (current) current.visible = false
            target.visible = true
        }

        let index = this.children.filter(obj => obj.isFloor).findIndex(it => it === target)
        new TWEEN.Tween(this.position)
            .to({ y: -index * FLOOR_SPACE }, current != null ? 150 : 0)
            .onComplete(() => this.updateBound(this.$map))
            .start()
    }

    showAllFloors() {
        this.children.forEach(obj => {
            if (obj.isFloor) {
                obj.visible = this._shouldShowAll_() || obj === this.getFloor(this.currentFloorNum)
            }
        })
    }

    getCurrentFloor() {
        return this.currentFloorNum
    }

    getFloor(floorNum) {
        return this.floors.find(f => f.name == floorNum)
    }

    _shouldShowAll_() {
        return !this.$map || (this.$map.viewMode === ViewMode.MODE_3D && this.$map.showAllFloors)
    }
}

mixinMapObject(Building, 'Building')

Object.defineProperties(Building.prototype, {
    floorNames: {
        get: function() {
            return this.floors ? this.floors.map(it => it.name) : []
        },
    },
})

export default Building
