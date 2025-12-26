import InputContainer from './InputContainer';
export default function JoinTab() {
	const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (!e.currentTarget) return;
		const target = e.currentTarget as HTMLButtonElement;
		const joinType = target.getAttribute('id');
		if (!joinType) return;
		const form = document.querySelector('#join-form') as HTMLFormElement;
		const formData = new FormData(form);
		const data = {
			...Object.fromEntries(formData),
			joinType,
		};
		console.log(data);
	};

	return (
		<div className="p-2 d-flex flex-column">
			<form id="join-form" className="m-auto d-flex flex-column w-50">
				<InputContainer
					inputLabel={'Your Name'}
					id="player-name"
					name="name"
					maxLength={20}
				/>
				<InputContainer
					inputLabel={'Join Code'}
					id="join-code"
					name="joinCode"
					maxLength={4}
				/>
				<button
					className="btn btn-primary mb-3"
					id="join-play"
					onClick={handleSubmit}
				>
					Play
				</button>
				<button
					className="btn btn-warning"
					id="join-spectate"
					onClick={handleSubmit}
				>
					Spectate
				</button>
			</form>
		</div>
	);
}
