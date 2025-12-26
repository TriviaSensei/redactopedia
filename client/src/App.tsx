import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState } from 'react';
import { GameStateContext } from './contexts/GameStateContext';
import HomeScreen from './components/HomeScreen';
function App() {
	const [gameState, setGameState] = useState({ active: false });
	return (
		<GameStateContext value={{ gameState, setGameState }}>
			<HomeScreen />
		</GameStateContext>
	);
}

export default App;
