import React from "react";
import {Graph} from "react-d3-graph";
import colorBetween from "color-between";
import buildGraphMixin from "../mixins/buildGraph.mixin.js";

import data from "../data/course_data.json";

import graphConfig from "../config/graph_config.json";
import appConfig from "../config/emnestigen_config.json";

class InteractiveCourseGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			chosen_course: "",
			moverNode: undefined
		};

		// The depth at which the graph builder stops
		// This is to prevent crashes when building cyclic graphs (they exist in the dataset!)
		// Tinkering and checking some big graphs has shown 5 to be a good cutoff
		this.depthCutoff = 5;

		this.graph = React.createRef();
	}

	initGraphData() {
		return ({
			nodes: [],
			links: []
		});
	}

	addGraphEdge(graphData, code, otherCode, customConfig) {
		const baseData = {
			source: code,
			target: otherCode,
			strokeWidth: 3
		};

		const linkData = Object.assign({}, baseData, customConfig);

		graphData.links.push(linkData);
	}

	addGraphNode(graphData, nodeData, max_depth) {
		let depthFraction = 0;
		if(max_depth > 0) {
			depthFraction = nodeData.depth / max_depth;
		}

		const startColor = appConfig.interactiveGraph.nodes.startColor;
		const endColor = appConfig.interactiveGraph.nodes.endColor;
		const nodeColor = colorBetween(startColor, endColor, depthFraction, "hex");

		const maxSize = appConfig.interactiveGraph.nodes.maxSize;
		const minSize = appConfig.interactiveGraph.nodes.minSize;
		const nodeSize = minSize + ((maxSize - minSize) * (1 - depthFraction));

		graphData.nodes.push({
			owner: this,
			id: nodeData.code,
			courseName: nodeData.data.name,
			size: nodeSize,
			color: nodeColor
		});
	}

	getNodeLabel(node) {
		const moverNode = node.owner.state.moverNode;
		if (node.id === moverNode) {
			return node.courseName;
		} else {
			return node.id;
		}
	}

	render() {
		const code = this.props.activeCourse;
		const graphData = this.buildGraph(code, [
			{
				key: "required_courses",
				customConfig: {color: appConfig.interactiveGraph.link.requiredColor}
			},
			{
				key: "recommended_courses",
				customConfig: {color: appConfig.interactiveGraph.link.recommendedColor}
			}
		]);

		graphConfig.width = this.props.width;
		graphConfig.height = this.props.height;

		graphConfig.node.labelProperty = this.getNodeLabel;

		let content = null;

		// Only display the graph if its graph data was generated (which it will be if the raw data exists)
		if(data[code]) {
			content = (
				<Graph
					ref={this.graph}
					key="interactiveCourseGraph"
					id="course-dependencies"
					data={graphData}
					config={graphConfig}
					onClickNode={this.props.onClickNode}
					onDoubleClickNode={() => this.graph.current.resetNodesPositions()}
					onMouseOverNode={(id) => this.setState({moverNode: id})}
					onMouseOutNode={() => this.setState({moverNode: undefined})}
				/>
			);
		}

		return content;
	}
}

// Add the mixin for building graph data
Object.assign(InteractiveCourseGraph.prototype, buildGraphMixin);

export default InteractiveCourseGraph;
