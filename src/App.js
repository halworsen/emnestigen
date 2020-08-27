import React from "react";
import "./App.css";
import InteractiveCourseGraph from "./components/InteractiveCourseGraph.js";
import GVCourseGraph from "./components/GraphVizCourseGraph.js";
import InfoPanel from "./components/InfoPanel/InfoPanel.js";
import HistoryPanel from "./components/HistoryPanel/HistoryPanel.js";
import appConfig from "./config/emnestigen_config.json";
import data from "./data/course_data.json";

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
            graphType: "D3G",
            activeCourse: "",
            history: []
        };

        this.updateSize = this.updateSize.bind(this);
    }

    toggleGraphType() {
        const newType = (this.state.graphType === "D3G") ? "GV" : "D3G";

        this.setState({
            graphType: newType
        })
    }

    updateActiveCourse(courseID) {
        courseID = courseID.toUpperCase();

        this.pushHistory(courseID);
        this.setState({
            activeCourse: courseID
        });
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

    pushHistory(courseID) {
        // Only push to history if its a valid course and its one that isn't already in history
        const { history } = this.state;
        if (!data[courseID] || history.includes(courseID)) {
            return;
        }

        let updatedHistory = this.state.history;
        updatedHistory.push(courseID);

        while(updatedHistory.length > appConfig["maxHistoryLength"]) {
            updatedHistory.shift();
        }

        this.setState({
            history: updatedHistory
        })
    }

    render() {
        const { activeCourse, width, height, graphType, history } = this.state;
        let graphClass = "graphContainer";
        let graph;

        if(graphType === "D3G") {
            graph = (
                <InteractiveCourseGraph
                    key="courseGraph"
                    className="d3gGraph"
                    activeCourse={activeCourse}
                    width={width}
                    height={height}
                    onClickNode={(courseID) => this.updateActiveCourse(courseID)}
                />
            );
        } else if(graphType === "GV") {
            graphClass += " gvGraph";
            graph = (
                <GVCourseGraph
                    key="courseGraph"
                    className="gvGraph"
                    activeCourse={activeCourse}
                    width={width}
                    height={height * 0.95}
                />
            );
        }

        return (
            <div key="appContainer" className="appContainer">
                <HistoryPanel
                    history={history}
                    onHistoryClick={(courseID) => this.updateActiveCourse(courseID)}
                />

                <InfoPanel
                    key="infoPanel"
                    activeCourse={activeCourse}
                    onSearch={(courseID) => this.updateActiveCourse(courseID)}
                />

                <div className={graphClass}>
                    {graph}
                </div>

                <div
                    className="graphToggler"
                    onClick={() => this.toggleGraphType()}
                >
                    <p>{graphType}</p>
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
