import { findAllDegreesOfSeparation } from "./dijkstra.js"
import { score } from "./set-score.js"


function buildDomainGraph(graph, nodes, domainSets) {
    let allSetNodeIds = new Set(domainSets.flatMap(set => set.nodes || []).map(node => node.id))
    const degreesOfSeparation = {}
    for (let nodeId of allSetNodeIds) {
        degreesOfSeparation[nodeId] = findAllDegreesOfSeparation(graph.links, nodeId)
    }

    const rootNode = { "id": "___root", "name": "root", "type": "root", color: "#ffffff"    }

    const domainNodes = domainSets.map(set => {
        return {
            "id": `domain:${set.name}`,
            "name": `${set.name}`,
            "type" : "domain",
            "color" : "#ffffff"
        }
    })

    const domainLinks = []
    for (let node of graph.nodes) {
        const scores = domainSets.map( set => score(node, set, graph, degreesOfSeparation))
        scores.forEach( (score, idx) => {
            if (score > 0) {
                domainLinks.push({
                    'source' : node.id,
                    'target' : domainNodes[idx].id,
                    'strengthDelta' : 1.0,
                    'type': 'domain'
                })
            }
        })
    }

    const rootLinks = domainSets.map( set => {
        return {
            source: rootNode.id,
            target: `domain:${set.name}`,
            strengthDelta: 1.0,
        }

    })
    console.log(domainLinks)

    return {
        'nodes': domainNodes.concat([rootNode]),
        'links': domainLinks.concat(rootLinks)
    }
}


export { buildDomainGraph }