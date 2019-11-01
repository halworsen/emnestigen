import React from "react";
import "./App.css";
import InteractiveCourseGraph from "./components/InteractiveCourseGraph.js";
import GVCourseGraph from "./components/GraphVizCourseGraph.js";
import InfoPanel from "./components/InfoPanel.js";
import appConfig from "./config/emnestigen_config.json";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
            graphType: "D3G",
            activeCourse: ""
        };

        this.updateSize = this.updateSize.bind(this);
    }

    toggleGraphType() {
        const newType = (this.state.graphType === "D3G") ? "GV" : "D3G";
        this.setState({
            width: this.state.width,
            height: this.state.height,
            graphType: newType,
            activeCourse: this.state.activeCourse
        })
    }

    onSearchUpdate(event) {
        this.setState({
            width: this.state.width,
            height: this.state.height,
            graphType: this.state.graphType,
            activeCourse: event.target.value.toUpperCase()
        });
    }

    onNodeSelected(nodeId) {
        this.setState({
            width: this.state.width,
            height: this.state.height,
            graphType: this.state.graphType,
            activeCourse: nodeId
        })
    }

    componentDidMount() {
        this.updateSize();
        window.addEventListener("resize", this.updateSize);
    }

    updateSize() {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight,
            activeCourse: this.state.activeCourse
        });
    }

    render() {
        let graphClass = "graphContainer";
        let graph;

        if(this.state.graphType === "D3G") {
            graph = (
                <InteractiveCourseGraph
                    key="courseGraph"
                    className="d3gGraph"
                    activeCourse={this.state.activeCourse}
                    width={this.state.width}
                    height={this.state.height}
                    onClickNode={(id) => this.onNodeSelected(id)}
                />
            );
        } else if(this.state.graphType === "GV") {
            graphClass += " gvGraph";
            graph = (
                <GVCourseGraph
                    key="courseGraph"
                    className="gvGraph"
                    activeCourse={this.state.activeCourse}
                    width={this.state.width}
                    height={this.state.height}
                />
            );
        }

        return (
            <div key="appContainer" className="appContainer">
                <InfoPanel
                    key="infoPanel"
                    activeCourse={this.state.activeCourse}
                    onSearch={(event) => this.onSearchUpdate(event)}
                />

                <div className={graphClass}>
                    {graph}
                </div>

                <div
                    className="graphToggler"
                    onClick={() => this.toggleGraphType()}
                >
                    <p>{this.state.graphType}</p>
                </div>

                <div className="about">
                    <p>
                        {appConfig.aboutBlurb ? appConfig.aboutBlurb : "Appen ble ikke konfigurert riktig 😢"}
                        <span> | </span>
                        <a
                            className="ghLink"
                            href={appConfig.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    </p>
                </div>
            </div>
        );
    }
}

export default App;
