function findShortestPath(edges, start, end) {

    console.log(edges)
    // Build adjacency list from edges (bidirectional)
    const graph = buildUndirectedGraph(edges);

    // Set of visited nodes
    const visited = new Set();

    // Distance from start to each node
    const distances = {};

    // Previous node in optimal path from source
    const previous = {};

    // Priority queue (simplistic implementation)
    const queue = [];

    // Initialize distances with Infinity for all nodes except start
    for (const node in graph) {
        distances[node] = node === start ? 0 : Infinity;
        previous[node] = null;
        queue.push(node);
    }

    // Main Dijkstra algorithm
    while (queue.length > 0) {
        // Find node with minimum distance
        queue.sort((a, b) => distances[a] - distances[b]);
        const current = queue.shift();

        // If we reached the end node, we're done
        if (current === end) {
            break;
        }

        // If the current node is unreachable
        if (distances[current] === Infinity) {
            break;
        }

        visited.add(current);

        // For each neighbor of current node
        for (const neighbor in graph[current]) {
            if (visited.has(neighbor)) continue;

            // Calculate new distance
            const weight = graph[current][neighbor];
            const newDistance = distances[current] + weight;

            // If new distance is better
            if (newDistance < distances[neighbor]) {
                distances[neighbor] = newDistance;
                previous[neighbor] = current;
            }
        }
    }

    // Reconstruct the path
    const path = [];
    let current = end;

    // No path found
    if (previous[end] === null && end !== start) {
        return {distance: Infinity, path: []};
    }

    while (current) {
        path.unshift(current);
        current = previous[current];
    }

    return {
        distance: distances[end],
        path: path
    };
}

/**
* Find all shortest paths between two nodes using Dijkstra's algorithm for undirected graphs
* @param {Array<{source: string, target: string, weight: number}>} edges - Array of edge objects
* @param {string} start - Starting node
* @param {string} end - Ending node
* @returns {Object} - Object containing the distance and array of all shortest paths
*/
function findAllShortestPaths(edges, start, end) {
    // Build adjacency list from edges (bidirectional)
    const graph = buildUndirectedGraph(edges);

    // Distance from start to each node
    const distances = {};

    // Keep track of all nodes with the same minimum distance
    const previous = {};

    // Initialize data structures
    for (const node in graph) {
        distances[node] = node === start ? 0 : Infinity;
        previous[node] = [];
    }

    // Priority queue
    const queue = Object.keys(graph).map(node => ({
        node,
        distance: distances[node]
    }));

    // Set to track processed nodes
    const processed = new Set();

    // Main Dijkstra algorithm
    while (queue.length > 0) {
        // Sort queue by distance
        queue.sort((a, b) => a.distance - b.distance);

        // Get node with minimum distance
        const { node: current, distance } = queue.shift();

        // If current distance is infinity, remaining nodes are unreachable
        if (distance === Infinity) break;

        // Mark as processed
        processed.add(current);

        // For each neighbor of the current node
        for (const neighbor in graph[current]) {
            if (processed.has(neighbor)) continue;

            // Calculate distance through current node
            const weight = graph[current][neighbor];
            const newDistance = distances[current] + weight;

            // If we found a shorter path to neighbor
            if (newDistance < distances[neighbor]) {
                // Update distance
                distances[neighbor] = newDistance;

                // Clear previous paths and add new shortest path
                previous[neighbor] = [current];

                // Update queue with new distance
                const index = queue.findIndex(item => item.node === neighbor);
                if (index !== -1) {
                    queue[index].distance = newDistance;
                }
            }
            // If we found an equally short path
            else if (newDistance === distances[neighbor]) {
                // Add this path as an alternative
                previous[neighbor].push(current);
            }
        }
    }

    // Reconstruct all paths
    const allPaths = [];

    // Helper function to recursively build all paths
    function buildPaths(node, path) {

        if (!node) {
            return;
        }

        // If we reached the start, we have a complete path
        if (node === start) {
            allPaths.push([...path, node]);
            return;
        }

        // No path to this node
        if (!previous[node] ||  previous[node].length === 0) {
            return;
        }

        // Try all previous nodes
        for (const prev of previous[node]) {
            // Avoid cycles
            if (!path.includes(prev)) {
                buildPaths(prev, [...path, node]);
            }
        }
    }

    // Start building paths from the end node
    buildPaths(end, []);

    // Reverse paths to get them in start->end order
    const formattedPaths = allPaths.map(path => path.reverse());

    return {
        distance: distances[end],
        paths: formattedPaths
    };
}

/**
* Find the minimum spanning tree using Prim's algorithm
* @param {Array<{source: string, target: string, weight: number}>} edges - Array of edge objects
* @param {string} startNode - Starting node for the MST
* @returns {Object} - Object containing the total weight and edges of the MST
*/
function minimumSpanningTree(edges, startNode) {

    console.log(edges)

    // Build adjacency list from edges (bidirectional)
    const graph = buildUndirectedGraph(edges);

    console.log(graph)
    // If the graph is empty or the start node doesn't exist
    if (!graph[startNode]) {
        console.log(`start node '${startNode}' not in graph`)
        return { totalWeight: 0, mstEdges: [] };
    }

    // Set of nodes included in MST
    const included = new Set([startNode]);

    // Edges in the MST
    const mstEdges = [];

    // Total weight of the MST
    let totalWeight = 0;

    // Continue until all connected nodes are included
    while (included.size < Object.keys(graph).length) {
        let minEdge = null;
        let minWeight = Infinity;
        let nextNode = null;

        // Find the minimum weight edge connecting an included node to a non-included node
        for (const node of included) {
            for (const neighbor in graph[node]) {
                if (!included.has(neighbor) && graph[node][neighbor] < minWeight) {
                    minWeight = graph[node][neighbor];
                    minEdge = { source: node, target: neighbor, weight: minWeight };
                    nextNode = neighbor;
                }
            }
        }

        // If no edge is found, the graph is disconnected
        if (!nextNode) {
            break;
        }

        // Add the edge to MST
        mstEdges.push(minEdge);
        totalWeight += minWeight;

        // Include the new node
        included.add(nextNode);
    }

    // Check if MST includes all nodes
    if (included.size < Object.keys(graph).length) {
        console.warn('The graph is disconnected. The MST only covers a portion of the graph.');
    }

    return {
        totalWeight,
        mstEdges,
        includedNodes: Array.from(included)
    };
}

/**
 * Build an adjacency list graph from an array of edges, treating all edges as undirected
 * @param {Array<{source: string, target: string, weight: number}>} edges
 * @returns {Object} Adjacency list for an undirected graph
 */
function buildUndirectedGraph(edges) {


    console.log("building graph from edges")
    console.log(edges)
    const graph = {};

    // Initialize graph with empty adjacency lists
    for (const edge of edges) {

        let source = edge.source.id || edge.source
        let target = edge.target.id || edge.target

        if (!graph[source]) graph[source] = {};
        if (!graph[target]) graph[target] = {};
    }

    // Fill adjacency lists with weights (bidirectional)
    for (const edge of edges) {
        // Assuming the weight property exists, otherwise default to 1
        const weight = edge.weight !== undefined ? edge.weight : 1;

        let source = edge.source.id || edge.source
        let target = edge.target.id || edge.target

        // Add edge in both directions
        graph[source][target] = weight;
        graph[target][source] = weight; // This is the key change for undirected graphs
    }

    console.log("I made a graph")
    console.log(graph)
    return graph;
}
//
// // Example usage for undirected graph
// const undirectedEdges = [
//     {source: 'A', target: 'B', weight: 4},
//     {source: 'A', target: 'C', weight: 2},
//     {source: 'B', target: 'C', weight: 1},
//     {source: 'B', target: 'D', weight: 5},
//     {source: 'C', target: 'D', weight: 8},
//     {source: 'C', target: 'E', weight: 10},
//     {source: 'D', target: 'E', weight: 2}
// ];
//
// const result = findShortestPath(undirectedEdges, 'A', 'E');
// console.log(`Shortest distance: ${result.distance}`);
// console.log(`Shortest path: ${result.path.join(' -> ')}`);
// }

export {  findShortestPath, findAllShortestPaths, minimumSpanningTree }