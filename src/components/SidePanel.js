import React from 'react';
import data from "../config/course_data.json"

function CourseInput(props) {
	return (
		<form className="courseInputForm">
			<textarea
				className="courseInputTextArea"
				value={props.value}
				onChange={props.onChange}
			/>
		</form>
	);
}

class SidePanel extends React.Component {
	render() {
		let content = [<CourseInput value={this.props.activeCourse} onChange={this.props.onSearch}/>];

		if(!data[this.props.activeCourse]) {
			return (<div className="sidePanel"> {content} </div>);
		}

		const course_data = data[this.props.activeCourse];
		const title = this.props.activeCourse + " - " + course_data.name;
		const req_knowledge = course_data.required_knowledge;
		const rec_knowledge = course_data.recommended_knowledge;

		content.push(
			<div className="courseInfo">
				<h1>{title}</h1>
				<hr/>
				<h2>Obligatoriske forkunnskaper</h2>
				<p>{req_knowledge}</p>
				<br/>
				<h2>Anbefalte forkunnskaper</h2>
				<p>{rec_knowledge}</p>
			</div>
		);

		return (
			<div
				className="sidePanel"
			>
			{content}
		</div>);
	}
}

export default SidePanel;
