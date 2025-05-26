import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const toolsUrl = "https://raw.githubusercontent.com/Creative-Coding-Map/ccm-published-data/refs/heads/main/tools/tools.json"
const techniquesUrl = "https://raw.githubusercontent.com/Creative-Coding-Map/ccm-published-data/refs/heads/main/techniques/techniques.json"

/**
 * Fetches data related to tools, techniques, and tags from specified URLs and processes it.
 *
 * @return {Promise<Object>} A promise that resolves to an object containing:
 *   - `tools`: An array of tool entries sorted alphabetically by their keys.
 *   - `techniques`: An array of technique entries sorted alphabetically by their keys.
 *   - `tags`: A sorted array of unique tags extracted from tools and techniques.
 */
async function fetchCcmData() {
    const ccmData = {
        'tools':
            Object.entries((await d3.json(toolsUrl)).tools)
                .sort((a, b) => a[0].localeCompare(b[0])),
        'techniques':
            Object.entries((await d3.json(techniquesUrl)).techniques)
                .sort((a, b) => a[0].localeCompare(b[0]))
    }

    ccmData.tags = [...new Set(
        (ccmData.tools.concat(ccmData.techniques))
            .flatMap((it) => it[1].tags || []))].sort()

    return ccmData
}

export { fetchCcmData }