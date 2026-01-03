import { useState } from 'react';
import { CreatorStateContext } from '../contexts/CreatorStateContext';
import CreateGameForm from './CreateGameForm';
export default function EditTab() {
	const [creatorState, setCreatorState] = useState([]);
	return (
		<CreatorStateContext value={{ creatorState, setCreatorState }}>
			<CreateGameForm />
		</CreatorStateContext>
	);
}
