import Queue from "queue-fifo";
import data from "../data/course_data.json";

const buildGraphMixin = {
	// Tinkering has shown that 5 is a resonable depth to stop at
	depthCutoff: 5,

	buildGraph(courseCode, linkingData) {
		// Have the class initialize the graph data
		let graphData = this.initGraphData();

		if(graphData === null) {
			return null;
		}

		// Holds all dequeued nodes. Used to hold node depths and indicate which nodes have been explored
		let exploredNodes = [];
		// Holds unique string keys representing links that have been generated already
		let generatedLinks = [];
		let maxDepth = 0;

		let queue = new Queue();
		queue.enqueue({code: courseCode, depth: 0});
		while(!queue.isEmpty()) {
			const course_node = queue.dequeue();

			const code = course_node.code;
			const depth = course_node.depth;

			// Stop building the graph if we've gone too deep
			if(depth > this.depthCutoff) {
				break;
			}

			// If there is no data associated with the course code, ignore it as it cannot be a real course
			if(!data[code]) {
				continue;
			}

			// Mark the node as explored
			exploredNodes.push(course_node);

			// Go through each data key to build the graph by,
			// and build links from them
			for(var linkingIndex in linkingData) {
				const info = linkingData[linkingIndex];

				const dataKey = info.key;
				const customConfig = info.customConfig;

				// Add each course in whatever list we're dealing with
				for(var dataIndex in data[code][dataKey]) {
					const otherCode = data[code][dataKey][dataIndex];

					// Only explore the node if it hasn't been explored before
					const been_explored = exploredNodes.some((node) => {return (node.code === otherCode);});
					if(!been_explored) {
						queue.enqueue({code: otherCode, depth: depth + 1});
						maxDepth = Math.max(maxDepth, depth + 1);
					}

					// But also check if links have been made, a single node can have multiple links after all
					const linkKey = code+","+otherCode;
					if(!generatedLinks.includes(linkKey)) {
						// Have the class add the edge to the graph data
						this.addGraphEdge(graphData, code, otherCode, customConfig);
						generatedLinks.push(linkKey);
					}
				}
			}
		}

		for(var nodeIndex in exploredNodes) {
			const node = exploredNodes[nodeIndex];
			// Have the class add the node to the graph data
			// We do it here so we can do a gradual coloring of the nodes
			// Neither Graphviz nor the interactive graph care about the order in which we add this information
			this.addGraphNode(graphData, node.code, node.depth, maxDepth)
		}

		// Allow the class to "finish" the graph data somehow
		// But also let classes ignore this step by simply not defining the method
		if(typeof this.finalizeGraphData == "function") {
			graphData = this.finalizeGraphData(graphData);
		}

		return graphData;
	}
}

export default buildGraphMixin;
