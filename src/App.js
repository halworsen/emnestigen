import React from 'react';
import './App.css';

import CourseGraph from "./components/CourseGraph.js"
import InfoPanel from "./components/InfoPanel.js"

import appConfig from "./config/emnestigen_config.json"

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
            activeCourse: ""
        };

        this.updateSize = this.updateSize.bind(this);
    }

    onSearchUpdate(event) {
        this.setState({
            width: this.state.width,
            height: this.state.height,
            activeCourse: event.target.value.toUpperCase()
        });
    }

    onNodeSelected(nodeId) {
        this.setState({
            width: this.state.width,
            height: this.state.height,
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
        return (
            <div key="appContainer" className="appContainer">
                <InfoPanel
                    key="infoPanel"
                    activeCourse={this.state.activeCourse}
                    onSearch={(event) => this.onSearchUpdate(event)}
                />

                <CourseGraph
                    key="courseGraph"
                    width={this.state.width}
                    height={this.state.height}
                    activeCourse={this.state.activeCourse}
                    onClickNode={(node) => this.onNodeSelected(node)}
                />

                <div className="about">
                    <p>
                        {appConfig.aboutBlurb ? appConfig.aboutBlurb : "Appen ble ikke konfigurert riktig 😢"}
                        <span> | </span>
                        <a
                            className="ghLink"
                            href={appConfig.repository_url}
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
