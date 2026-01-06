import type { Dispatch, SetStateAction } from 'react';
import { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import type { Round } from '../types/Round';
import { CreatorStateContext } from '../../contexts/CreatorStateContext';
export default function DeleteRound(props: {
	show: boolean;
	setShow: Dispatch<SetStateAction<boolean>>;
	action: string;
}) {
	const { selectedRound, setSelectedRound, setArticle, setCreatorState } =
		useContext(CreatorStateContext);

	const handleClose = () => props.setShow(false);

	const handleDeleteRound = () => {
		//if there's a round selected, remove it from the creatorState
		if (selectedRound !== 0) {
			setCreatorState((prev: Array<Round>) => {
				return prev.filter((rd, i) => {
					return rd !== null && i !== selectedRound - 1;
				});
			});
			//...and set the selected round to 0 (the add new round option)
			setSelectedRound(0);
		}
		//clear the article
		clearRound();
	};

	const clearRound = () => {
		//clear the category
		const cs = document.querySelector('#category-select') as HTMLSelectElement;
		if (cs) cs.selectedIndex = 0;
		//clear the article
		setArticle({
			title: '',
			type: 'regular',
			category: '',
			text: '',
			tokens: [],
			round: null,
			groups: [],
		});
		handleClose();
	};

	return (
		<Modal show={props.show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>{`${props.action} round?`}</Modal.Title>
			</Modal.Header>
			<Modal.Body>{`Are you sure you want to ${props.action.toLowerCase()} this round? This cannot be undone.`}</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					No
				</Button>
				<Button variant="primary" onClick={handleDeleteRound}>
					Yes
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
