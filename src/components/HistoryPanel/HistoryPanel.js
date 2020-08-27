import React from 'react';
import './HistoryPanel.css';


function HistoryPanel(props) {
	const history = props.history;

	if(!history.length) {
		return null;
	}

	let historyButtons = [];
	for(let i = 0; i < history.length; i++) {
		const courseID = history[i];

		historyButtons.push((
			<button
				key={"historyButton_" + courseID}
				className="historyButton"
				onClick={(event) => {props.onHistoryClick(courseID)}}
			>
				<div className="historyNode"></div>
				{courseID}
			</button>
		));
	}

	return (
		<div className="historyPanel">
			<hr/>
			<h2 className="historyTitle">Historikk</h2>
			<hr/>
			<div className="historyButtonList">
				{historyButtons}
			</div>
		</div>
	);
}

export default HistoryPanel;