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

		// The depth at which the graph builder stops
		// This is to prevent crashes when building cyclic graphs (they exist in the dataset!)
		// I highly doubt any one course ultimately depends on more than 50 courses
		this.depthCutoff = 50;

		this.graph = React.createRef();
	}

	// Recursively build graph data
	buildGraph(course_code, linking_data) {
		let graph_data = {
			nodes: [],
			links: []
		};

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
				const nodeSize = this.depthSize[Math.min(depth, this.depthSize.length-1)];
				const nodeColor = this.depthColor[Math.min(depth, this.depthColor.length-1)];

				graph_data.nodes.push({
					id: code,
					size: nodeSize,
					color: nodeColor
				});
				generated_data.push(code);
			}

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
				custom_config: {color: "#ff0000"}
			},
			{
				key: "recommended_courses",
				custom_config: {}
			}
		]);

		graphConfig.width = this.props.width;
		graphConfig.height = this.props.height;

		let content = null;

		// Only display the graph if its graph data was generated (which it will be if the raw data exists)
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
