/**
 * a 2d Canvas renderer for fast rendering
 * Created by gaimeng on 15/2/2.
 */

import Controller2D from './controls/indicator-control'
import Canvas2DRenderer from './canvas-2d-renderer'
import default2dTheme from './theme'
import IndoorMapLoader from '../loader'
import Size from '../model/size'
import Overlay from '../overlay/overlay'
import {
    overlayMixins
} from '../overlay'

class Map {

    constructor(el, options = {}) {
        this.wrapper = typeof el == 'string' ? document.querySelector(el) : el
        this.wrapper.style.overflow = 'hidden'

        this.options = {
            showNames: true,
            showPubPoints: true,
            selectable: true,
            movable: true,
            ...options
        }

        this.refresh()

        this.overlays = []
        this.renderer = new Canvas2DRenderer(this)
        this.controls = new Controller2D(this.renderer)
        overlayMixins(this.renderer)

        this.animate()
    }

    refresh() {
        this.wrapperSize = new Size(this.wrapper.clientWidth, this.wrapper.clientHeight)
    }

    reset() {
        this.renderer.reset()
        this.controls.reset()
    }

    load(fileName) {
        this.reset()
        this.theme = default2dTheme
        var loader = new IndoorMapLoader(false)
        loader.load(fileName)
            .then(mall => {
                this.mall = mall;
                this.showFloor()
            })
    }

    getMall() {
        return this.mall;
    }

    setSelectable(selectable) { }

    onSelectObject(event) {
        event.preventDefault()
    }

    theme() {
        return this.theme;
    }

    showFloor(floorid) {
        if (this.mall == null) {
            return;
        }

        this.adjustCamera();

        return this
    }

    setDefaultView() {
        this.renderer.setDefaultView();

        this.controls.reset();
        this.controls.viewChanged = true;
    }

    adjustCamera() {
        this.setDefaultView();
    }

    addOverlay(overlay) {
        this.overlays.push(overlay)
        this.renderer.render()
    }

    getAllOverlays() {
        return this.overlays
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.controls.viewChanged) {
            this.renderer.render(this.mall)
            this.controls.viewChanged = false
        }
    }
}

export const IndoorMap2d = Map