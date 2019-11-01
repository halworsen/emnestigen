import React from "react";
import {Graphviz} from "graphviz-react";
import colorBetween from "color-between";
import buildGraphMixin from "../mixins/buildGraph.mixin.js";

import data from "../data/course_data.json";

import appConfig from "../config/emnestigen_config.json";

class GVCourseGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			chosen_course: ""
		};
	}

	initGraphData() {
		return ["digraph{\nbgcolor=\"#ecf0f1\"\nnode[style=filled, shape=circle, color=Gray]\nedge[dir=1]\n"];
	}

	addGraphEdge(graphData, code, otherCode, customConfig) {
		graphData.push(code + " -> " + otherCode + "[color=\"" + customConfig.color + "\"]\n");
	}

	addGraphNode(graphData, code, depth, max_depth) {
		let depthFraction = 0;
		if(max_depth > 0) {
			depthFraction = depth / max_depth;
		}

		const startColor = appConfig.interactiveGraph.nodes.startColor;
		const endColor = appConfig.interactiveGraph.nodes.endColor;
		const nodeColor = colorBetween(startColor, endColor, depthFraction, "hex");

		graphData.push(code + "[color=\"" + nodeColor + "\"]");
	}

	finalizeGraphData(graphData) {
		graphData.push("}");

		return graphData.join("");
	}

	render() {
		const code = this.props.activeCourse;
		const graphData = this.buildGraph(code, [
			{
				key: "required_courses",
				customConfig: {color: appConfig.gvGraph.link.requiredColor}
			},
			{
				key: "recommended_courses",
				customConfig: {color: appConfig.gvGraph.link.recommendedColor}
			}
		]);

		const graphConfig = {
			fit: true,
			width: this.props.width,
			height: this.props.height
		}

		let content = null;

		// Only display the graph if its graph data was generated (which it will be if the raw data exists)
		if(data[code]) {
			content = (<Graphviz
				key="gvCourseGraph"
				dot={graphData}
				options={graphConfig}
			/>);
		}

		return (<div className="graphContainer">{content}</div>);
	}
}

// Add the mixin for building graph data
Object.assign(GVCourseGraph.prototype, buildGraphMixin);

export default GVCourseGraph;
