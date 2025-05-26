/**
 * Blend two graphs
 * @param viewGraph The active graph (from the graph view)
 * @param nextGraph The new graph, which is a subset of viewGraph
 */
function blendGraphs(viewGraph, nextGraph) {
    let linkCountMap = new Map();

    // would be nice to have asymmetric hashing such that hash(a,b) == hash(b,a)

    for (let link of nextGraph.links) {
        let sourceId = link.source.id || link.source;
        let targetId = link.target.id || link.target;

        linkCountMap.set(sourceId, (linkCountMap.get(sourceId) || 0) + 1);
        linkCountMap.set(targetId, (linkCountMap.get(targetId) || 0) + 1);
    }

    let viewLinks = new Set(viewGraph.links.flatMap(it => [`${it.source.id||it.source}-${it.target.id||it.target}`, `${it.target.id||it.target}-${it.source.id||it.source}`]))
    let nextLinks = new Set(nextGraph.links.flatMap(it => [`${it.source}-${it.target}`, `${it.target}-${it.source}`]))

    let newLinks = nextLinks.difference(viewLinks)
    let removeLinks = viewLinks.difference(nextLinks)

    for (let link of viewGraph.links) {
        let sourceId = link.source.id || link.source;
        let targetId = link.target.id || link.target;

        if (removeLinks.has(`${link.source.id||link.source}-${link.target.id||link.target}`)) {
            link.strength = 0.0
            link.strengthDelta = -0.01
        } else if (newLinks.has(`${link.source.id||link.source}-${link.target.id||link.target}`)) {
            let count = Math.min(linkCountMap.get(sourceId), linkCountMap.get(targetId))
            link.strength = 1.0 / count
            link.strengthDelta = 0.01
        } else {
            let count = Math.min(linkCountMap.get(sourceId), linkCountMap.get(targetId))
            link.strength = 1.0 / count
            link.strengthDelta = 0.0
        }
    }
}

export { blendGraphs }