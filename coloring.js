import { findAllDegreesOfSeparation } from "./dijkstra.js"
import { score } from "./set-score.js"

function argmax(array) {
    return array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
}

function colorGraph(graph, colorSets) {
    let allSetNodeIds = new Set(colorSets.flatMap(set => set.nodes || []).map(node => node.id))
    const degreesOfSeparation = {}
    for (let nodeId of allSetNodeIds) {
        degreesOfSeparation[nodeId] = findAllDegreesOfSeparation(graph.links, nodeId)
    }

    for (let node of graph.nodes) {
        const scores = colorSets.map( set => score(node, set, graph, degreesOfSeparation))
        const bestIdx = argmax(scores)
        if (scores[bestIdx] > 0) {
            const bestSet = colorSets[bestIdx]
            node.color = bestSet.color
        } else {
            node.color = '#000000'
        }
    }
}

export { colorGraph }