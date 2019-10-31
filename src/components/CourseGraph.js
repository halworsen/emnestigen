import React from "react";
import {Graph} from "react-d3-graph";
import data from "../data/course_data.json"

import graphConfig from "../config/graph_config.json"
import appConfig from "../config/emnestigen_config.json"

class CourseGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			chosen_course: ""
		};

		// The depth at which the graph builder stops
		// This is to prevent crashes when building cyclic graphs (they exist in the dataset!)
		// I highly doubt any one course ultimately depends on more than 10 courses
		this.depthCutoff = 10;

		this.graph = React.createRef();
	}

	// Recursively build graph data
	buildGraph(course_code, linking_data) {
		let graph_data = {
			nodes: [],
			links: []
		};

		const colors = appConfig.nodes.depthColors;
		const sizes = appConfig.nodes.depthSizes;

		let generated_data = [];
		let recursiveBuild = function(graph_data, code, linking_data, depth=0) {
			if(depth > this.depthCutoff) {
				return false;
			}

			if(!data[code]) {
				return false;
			}

			// Add a node to the graph if it isn't already in the graph
			if(!generated_data.includes(code)) {
				const nodeSize = sizes[Math.min(depth, sizes.length-1)];
				const nodeColor = colors[Math.min(depth, colors.length-1)];

				graph_data.nodes.push({
					id: code,
					size: nodeSize,
					color: nodeColor
				});
				generated_data.push(code);
			}

			// Go through each data key to build the graph by,
			// recursively adding new nodes and links to the graph
			// with the custom link configurations
			for(var data_index in linking_data) {
				const info = linking_data[data_index];

				const data_key = info.key;
				const custom_config = info.custom_config

				for(var index in data[code][data_key]) {
					const other_code = data[code][data_key][index];

					let success = recursiveBuild(graph_data, other_code, linking_data, depth+1);
					
					const link_key = code+","+other_code;
					if(success && !generated_data.includes(link_key)) {
						const base_data = {
							source: code,
							target: other_code,
							strokeWidth: 3
						};

						let link_data = Object.assign({}, base_data, custom_config);

						graph_data.links.push(link_data);
						generated_data.push(link_key);
					}
				}
			}

			return true;
		}.bind(this);

		recursiveBuild(graph_data, course_code, linking_data);

		return graph_data;
	}

	render() {
		const code = this.props.activeCourse;
		const graphData = this.buildGraph(code, [
			{
				key: "required_courses",
				custom_config: {color: appConfig.link.requiredColor}
			},
			{
				key: "recommended_courses",
				custom_config: {color: appConfig.link.recommendedColor}
			}
		]);

		graphConfig.width = this.props.width;
		graphConfig.height = this.props.height;

		let content = null;

		// Only display the graph if its graph data was generated (which it will be if the raw data exists)
		if(data[code]) {
			console.log("fugue!")
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
