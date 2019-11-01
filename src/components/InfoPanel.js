import React from "react";
import data from "../data/course_data.json";

function CourseInput(props) {
	return (
		<div key="courseInputContainer">
			<form key="courseInputForm" className="courseInputForm">
				<textarea
					key="courseInputArea"
					placeholder="Skriv inn en emnekode!"
					className="courseInputTextArea"
					value={props.value}
					onChange={props.onChange}
				/>
			</form>
		</div>
	);
}

class InfoPanel extends React.Component {
	render() {
		let req_content;
		let rec_content;
		let course_name = "";

		const course_data = data[this.props.activeCourse];

		if(data[this.props.activeCourse]) {
			const req_knowledge = course_data.required_knowledge;
			const rec_knowledge = course_data.recommended_knowledge;
			course_name = course_data.name

			if(req_knowledge) {
				req_content = (
					<div key="reqKnowledgeContent">
						<h2>Obligatoriske forkunnskaper</h2>
						<p key="courseInfoReqKnowledge">{req_knowledge}</p>
						<br/>
					</div>
				);
			}

			if(rec_knowledge) {
				rec_content = (
					<div key="recKnowledgeContent">
						<h2>Anbefalte forkunnskaper</h2>
						<p key="courseInfoRecKnowledge">{rec_knowledge}</p>
						<br/>
					</div>
				);
			}
		}

		return (
			<div
				key="infoPanelContainer"
				className="infoPanel"
			>
				<hr/>

				<div
					key="infoPanelTitleBox"
					className="titleBox"
				>	
					<CourseInput key="courseInput" value={this.props.activeCourse} onChange={this.props.onSearch}/>
					<h3 key="courseInfoName" className="infoTitleName">{course_name}</h3>
				</div>

				<hr/>

				<div
					key="infoPanelInfoBox"
					className="infoBox"
				>
					{req_content}
					{rec_content}
				</div>
			</div>
		);
	}
}

export default InfoPanel;
