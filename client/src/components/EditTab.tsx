import { useState } from 'react';
import type { Round } from './types/Round';
import DeleteRound from './Modals/DeleteRound';
import { CreatorStateContext } from '../contexts/CreatorStateContext';
import CreateGameForm from './CreateGameForm';
export default function EditTab() {
	const [creatorState, setCreatorState] = useState<Array<Round>>([]);
	const [selectedRound, setSelectedRound] = useState(0);
	type Article = Round & { round: number | null };
	const [article, setArticle] = useState<Article>({
		title: '',
		type: 'regular',
		category: '',
		text: '',
		tokens: [],
		round: null,
		groups: [],
	});
	const [show, setShow] = useState(false);

	return (
		<CreatorStateContext
			value={{
				creatorState,
				setCreatorState,
				selectedRound,
				setSelectedRound,
				article,
				setArticle,
			}}
		>
			<DeleteRound
				show={show}
				setShow={setShow}
				action={selectedRound === 0 ? 'Clear' : 'Delete'}
			/>
			<CreateGameForm setShow={setShow} />
		</CreatorStateContext>
	);
}
