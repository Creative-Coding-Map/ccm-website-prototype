/**
 * Builds node objects from the provided CCM data object by transforming tools, techniques, and tags into separate node collections.
 *
 * @param {Object} ccmData - The CCM data object containing arrays of tools, techniques, and tags.
 * @param {Array} ccmData.tools - An array of tools, where each tool is represented as an array with its identifier as the first element.
 * @param {Array} ccmData.techniques - An array of techniques, where each technique is an array with its identifier as the first element and an object containing additional details as the second element.
 * @param {Array} ccmData.tags - An array of tags, where each tag is represented as a string.
 * @return {Object} An object containing tool, technique, and tag nodes, along with a combined list of all nodes:
 *                  - toolNodes: An array of tool node objects.
 *                  - techniqueNodes: An array of technique node objects.
 *                  - tagNodes: An array of tag node objects.
 *                  - allNodes: A combined array containing all nodes.
 */
function buildNodesFromCcmData(ccmData) {
    const toolNodes = ccmData.tools.map((it, idx) => {
        return {"id": it[0], "name": it[0], "type": "tool", "ccmData": it}
    })

    const techniqueNodes = ccmData.techniques.map((it, idx) => {
        return {"id": it[0], "name": it[1].name, "type": "technique", "ccmData": it}
    })

    const tagNodes = ccmData.tags.map((it, idx) => {
        return {"id": it, "name": it, "type": "tag"}
    })

    return {
        'toolNodes' : toolNodes,
        'techniqueNodes' : techniqueNodes,
        'tagNodes' : tagNodes,
        'allNodes' : toolNodes.concat(techniqueNodes).concat(tagNodes)
    }
}


function buildGraph(ccmData, nodes, mst) {
    const {toolNodes, techniqueNodes, tagNodes, allNodes } = nodes

    let enableToolTagLinks = true;
    let enableTechniqueTagLinks = true;
    let enableDependencyLinks = true;
    let enableSupportLinks = true;
    let enableTechniqueLinks = true;

    let nodesById = {}

    const links = [];

    nodesById = {}
    ccmData.tools.forEach(n => {
        const tooln = toolNodes.find(it => it.name === n[0])
        nodesById[n[0]] = tooln
        if (enableToolTagLinks && !mst) {
            (n[1].tags || []).forEach(t => {
                if (true) {
                    const tn = tagNodes.find(it => it.name === t)
                    nodesById[t] = tn
                    const link = {
                        source: tn.id,
                        target: tooln.id,
                        type: "tag",
                        curvature: 0.0
                    }
                    links.push(link)
                }
            });
        }
        if (enableDependencyLinks && !mst) {
            (n[1].dependsOn || []).forEach(t => {
                const dependn = toolNodes.find(it => it.name === t)
                if (dependn) {
                    const link = {
                        source: dependn.id,
                        target: tooln.id,
                        type: "dependency",
                        curvature: 0.0
                    }
                    links.push(link)
                }
            })
        }
        if (enableSupportLinks && !mst) {
            (n[1].supports || []).forEach(t => {
                const supportn = toolNodes.find(it => it.name === t)
                if (supportn) {
                    const link = {
                        source: supportn.id,
                        target: tooln.id,
                        type: "support",
                        curvature: 0.0
                    }
                    links.push(link)
                }
            })
        }
        if (enableTechniqueLinks && !mst) {
            Object.entries(n[1].actions || {}).forEach(a => {
                (a[1].techniques || []).forEach(t => {
                    const link = {
                        source: tooln.id,
                        target: t,
                        type: "tool-technique"
                    }
                    links.push(link)
                })
            })
        }



    })
    if (mst) {
        for (let link of mst) {
            links.push(link)
        }
    }
    ccmData.techniques.forEach(n => {
        const techniquen = techniqueNodes.find(it => it.id === n[0])
        nodesById[n[0]] = techniquen
        if (enableTechniqueTagLinks && !mst) {
            (n[1].tags || []).forEach(t => {
                if (true) {
                    const tagn = tagNodes.find(it => it.name === t)
                    const link = {
                        source: tagn.id,
                        target: techniquen.id,
                        type: "tag",
                        curvature: 0.0
                    }
                    links.push(link)
                }
            });
        }
    })

    for (let link of links) {
        link.strengthDelta = 1.0
    }

    const graph = {"nodes": allNodes, "links": links}
    return graph
}

export { buildGraph, buildNodesFromCcmData }