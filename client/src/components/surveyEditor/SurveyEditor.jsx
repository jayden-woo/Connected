import React, { useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import ProgressBar from 'react-bootstrap/ProgressBar';

import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { EditText } from 'react-edit-text';

import uploadImage from '../../services/uploadImageService';
import http from '../../services/httpService';
import notify from '../../services/notifyService';

import QuestionEditor from './QuestionEditor';

export default function SurveyEditor() {
	const [survey, setSurvey] = useState({ questions: [] });
	const [thumbnail, setThumbnail] = useState({ src: '', alt: '' });
	const [progressBar, setProgressBar] = useState({
		visible: false,
		progress: 0,
	});

	const imageSelector = useRef();

	const handleAdd = (type) => {
		const newQuestions = [
			...survey.questions,
			{
				question: '',
				questionType: type,
				id: uuidv4(),
			},
		];
		setSurvey((prevState) => ({
			...prevState,
			questions: newQuestions,
		}));
	};

	const handleDelete = (id) => {
		const newQuestions = [...survey.questions];
		const index = survey.questions.findIndex((q) => q.id === id);
		newQuestions.splice(index, 1);
		setSurvey((prevState) => ({
			...prevState,
			questions: newQuestions,
		}));
	};

	const updateQuestion = (id, key, value) => {
		const newQuestions = [...survey.questions];
		const index = survey.questions.findIndex((q) => q.id === id);
		newQuestions[index][key] = value;
		setSurvey((prevState) => ({
			...prevState,
			questions: newQuestions,
		}));
	};

	// TODO: proper validation
	const validate = () => {
		if (survey.questions.length === 0) {
			alert('Survey cannot be empty.');
			return false;
		}

		/* eslint-disable-next-line */
		for (const q of survey.questions) {
			if (q.question === '') {
				alert('All questions must have a title.');
				return false;
			}

			if (q.questionType !== 'short answer') {
				if (!q.choices || q.choices.length < 2) {
					alert('Multiple option question must have at least 2 options.');
					return false;
				}

				/* eslint-disable-next-line */
				for (const c of q.choices) {
					if (c === '') {
						alert('Question cannot have empty option.');
						return false;
					}
				}
			}
		}

		return true;
	};

	const onSubmit = async () => {
		if (!validate()) {
			return;
		}

		const newQuestions = [];

		survey.questions.forEach((q, index) => {
			const newQ = _.cloneDeep(q);
			newQ.index = index;
			delete newQ.id;

			if (newQ.choices) {
				const choices = newQ.choices.map((c) => c.content);
				newQ.choices = choices;
			}

			newQuestions.push(newQ);
		});

		const data = {
			title: survey.title,
			subTitle: survey.subTitle,
			questions: newQuestions,
			creator: 'auth0|6110b5c4c61fd70077d2819d',
			thumbnail: survey.thumbnail,
		};

		if (!data.thumbnail) delete data.thumbnail;

		try {
			await http.post('http://localhost:3000/api/surveys', data);
			notify.successNotify('Successfully Published!');
		} catch (e) {
			notify.errorNotify(e.response.data.message);
		}
	};

	return (
		<div className="se__container">
			<div className="se__top-cut-off" />
			<div className="se__title-section">
				<Container className="se__title-container">
					<Row>
						<Col sm={9}>
							<EditText
								className="edit-text se__title"
								placeholder="Add title here ..."
								onSave={({ value }) =>
									setSurvey((prevState) => ({ ...prevState, title: value }))
								}
							/>
							<EditText
								className="edit-text se__sub-title"
								placeholder="Add sub title here ..."
								onSave={({ value }) =>
									setSurvey((prevState) => ({ ...prevState, subTitle: value }))
								}
							/>
						</Col>
						<Col>
							{thumbnail.src && (
								<Image
									className="se__thumbnail"
									src={thumbnail.src}
									alt={thumbnail.alt}
								/>
							)}
							{!thumbnail.src && <div className="se__thumbnail" />}
							<input
								type="file"
								onChange={(e) => {
									uploadImage.handleSelect(e, setThumbnail);
								}}
								ref={imageSelector}
								accept="image/*"
							/>
							<Button
								className="se__thumbnail-btn shadow-none"
								onClick={() => imageSelector.current.click()}
							>
								Add Thumbnail
							</Button>
							<Button
								className="se__thumbnail-btn shadow-none"
								disabled={!thumbnail.src}
								onClick={async () => {
									const url = await uploadImage.handleUpload(
										setProgressBar,
										thumbnail,
										() => notify.successNotify('Successfully Uploaded!'),
										() =>
											notify.errorNotify('Upload failed, please try again.'),
									);
									setSurvey((prevState) => ({ ...prevState, thumbnail: url }));
								}}
							>
								Upload
							</Button>
						</Col>
					</Row>
					{progressBar.visible && (
						<ProgressBar
							className="se__progress-bar"
							now={progressBar.progress}
						/>
					)}
				</Container>
			</div>
			<div className="se__content">
				<Container>
					<Row className="align-items-center justify-content-between">
						<Col className="text-start" style={{ padding: 0 }}>
							<Button
								className="se__btn-add btn--red shadow-none"
								onClick={() => handleAdd('short answer')}
							>
								+ Add Short Answer
							</Button>
						</Col>
						<Col className="text-center" style={{ padding: 0 }}>
							<Button
								className="se__btn-add btn--blue shadow-none"
								onClick={() => handleAdd('single choice')}
							>
								+ Add Single Choice
							</Button>
						</Col>
						<Col className="text-end" style={{ padding: 0 }}>
							<Button
								className="se__btn-add btn--green shadow-none"
								onClick={() => handleAdd('multiple choice')}
							>
								+ Add Multiple Choice
							</Button>
						</Col>
					</Row>
				</Container>
				{survey.questions.map((q) => (
					<QuestionEditor
						key={q.id}
						id={q.id}
						questionType={q.questionType}
						handleDelete={handleDelete}
						updateQuestion={updateQuestion}
					/>
				))}
			</div>
			<div className="se__bottom-cut-off">
				<a href="#top">BACK TO TOP</a>
			</div>
			<div className="se__publish">
				<Button className="se__btn-cancel shadow-none">Cancel</Button>
				<Button className="se__btn-publish shadow-none" onClick={onSubmit}>
					Publish
				</Button>
			</div>
		</div>
	);
}
