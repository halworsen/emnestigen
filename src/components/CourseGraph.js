import React from "react";
import {Graph} from "react-d3-graph";
import data from "../config/course_data.json"
import graphConfig from "../config/graph_config.json"

class CourseGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			chosen_course: ""
		};

		// For both of these, any depth equal to or beyond the length of the list will use the last element
		// Sizes for different "depths" of course dependencies
		this.depthSize = [2000, 1200, 800, 400];
		// Colors for different "depths" of course dependencies
		this.depthColor = ["#0094FF", "#FFD800", "#FF0000", "#808080"];

		this.graph = React.createRef();
	}

	// Recursively build graph data
	buildGraph(course_code, data_key) {
		let graph_data = {
			nodes: [],
			links: []
		};

		let generated_data = [];
		let recursiveBuild = function(graph_data, code, data_key, depth) {
			if(!data[code]) {
				return false;
			}

			// Add a node to the graph if it isn't already in the graph
			if(!generated_data.includes(code)) {
				const nodeSize = this.depthSize[Math.min(depth, this.depthSize.length-1)];
				const nodeColor = this.depthColor[Math.min(depth, this.depthColor.length-1)];

				graph_data.nodes.push({
					id: code,
					size: nodeSize,
					color: nodeColor
				});
				generated_data.push(code);
			}

			for(var index in data[code][data_key]) {
				const other_code = data[code][data_key][index];

				let success = recursiveBuild(graph_data, other_code, data_key, depth+1);
				
				const link_key = code+","+other_code;
				if(success && !generated_data.includes(link_key)) {
					graph_data.links.push({source: code, target: other_code, strokeWidth: 3});
					generated_data.push(link_key);
				}
			}

			return true;
		}.bind(this);

		recursiveBuild(graph_data, course_code, data_key, 0);

		return graph_data;
	}

	render() {
		const code = this.props.activeCourse;
		const graphData = this.buildGraph(code, "recommended_courses");

		graphConfig.width = this.props.width;
		graphConfig.height = this.props.height;

		let content = null;

		// Early return if the graph wasn't generated
		if(data[code]) {
			content = (<Graph ref={this.graph}
				id="course-dependencies"
				data={graphData}
				config={graphConfig}
				onClickNode={this.props.onClickNode}
				onDoubleClickNode={() => this.graph.current.resetNodesPositions()}
			/>);
		}

		return (<div className="graphContainer">{content}</div>);
	}
}

export default CourseGraph;
