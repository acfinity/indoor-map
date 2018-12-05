import THREE from '../libs/threejs/index'

export const parsePoints = array => {
    var points = []
    for (var i = 0; i < array.length; i += 2) {
        var point = new THREE.Vector2(array[i], array[i + 1])
        if (i > 0) {
            if (points[points.length - 1].manhattanDistanceTo(point) > 1e-4) {
                points.push(point)
            }
        } else {
            points.push(point)
        }
    }
    return points
}

export const compileTemplate = template => {
    const evalExpr = /<%=(.+?)%>/g
    const expr = /<%([\s\S]+?)%>/g

    /**
     * @prettier --print-width=80
     */
    template = template.replace(evalExpr, '`); \n  echo( $1 ); \n  echo(`').replace(expr, '`); \n $1 \n  echo(`')

    template = 'echo(`' + template + '`);'

    let script = `(function parse(data){
      let output = "";
      function echo(html){
        output += html;
      }
      ${template}
      return output;
    })`

    return eval(script)
}

export const appendHTML = function(element, html) {
    var divTemp = document.createElement('div'),
        nodes = null,
        fragment = document.createDocumentFragment()
    divTemp.innerHTML = html
    nodes = divTemp.childNodes
    for (var i = 0, length = nodes.length; i < length; i += 1) {
        fragment.appendChild(nodes[i].cloneNode(true))
    }
    element.appendChild(fragment)

    nodes = null
    fragment = null
}
