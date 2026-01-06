import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState, useRef } from 'react';
import { GameStateContext } from './contexts/GameStateContext';
import HomeScreen from './components/HomeScreen';
import PopUpMessage from './components/PopUpMessage';
import { PopUpMessageContext } from './contexts/PopUpMessageContext';
import type { Message } from './components/types/Message';
function App() {
	const [gameState, setGameState] = useState({ active: false });
	const [popUpState, setPopUpState] = useState<Message>({
		shown: false,
		status: '',
		message: '',
	});
	const defaultMessageLength = 1000;

	const messageTimeout = useRef<number | null>(null);
	const hideMessage = () => {
		if (messageTimeout.current !== null) {
			clearTimeout(messageTimeout.current);
			messageTimeout.current = null;
		}
		setPopUpState({
			shown: false,
			message: '',
			status: '',
		});
	};
	const showMessage = (
		status: 'info' | 'error' | 'warning' | '',
		message: string,
		duration?: number | null
	) => {
		if (popUpState.shown) hideMessage();

		setPopUpState({
			shown: true,
			status,
			message,
		});
		messageTimeout.current = setTimeout(
			hideMessage,
			duration || defaultMessageLength
		);
	};

	return (
		<GameStateContext value={{ gameState, setGameState }}>
			<PopUpMessageContext value={showMessage}>
				<PopUpMessage state={popUpState} />
				<HomeScreen />
			</PopUpMessageContext>
		</GameStateContext>
	);
}

export default App;
