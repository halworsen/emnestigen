import React from 'react';
import './App.css';

import CourseGraph from "./components/CourseGraph.js"
import SidePanel from "./components/SidePanel.js"

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

    onNodeSelected(node) {
        const course_code = node.id;

        this.setState({
            width: this.state.width,
            height: this.state.height,
            activeCourse: course_code
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
        const graphWidth = this.state.width;

        return (
            <div className="appContainer">
                <SidePanel activeCourse={this.state.activeCourse} onSearch={(event) => this.onSearchUpdate(event)}/>
                <CourseGraph width={graphWidth} height={this.state.height} activeCourse={this.state.activeCourse} onClickNode={(node) => this.onNodeSelected(node)}/>
            </div>
        );
    }
}

export default App;
