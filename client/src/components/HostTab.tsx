export default function HostTab() {
	const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (!e.currentTarget) return;
		const target = e.currentTarget as HTMLButtonElement;
		const joinType = target.getAttribute('id');
		if (!joinType) return;
		const form = document.querySelector('#host-form') as HTMLFormElement;
		if (!form) return;
		const formData = new FormData(form);
		const data = {
			...Object.fromEntries(formData),
			joinType,
		};
		console.log(data);
	};
	return (
		<div className="p-2 d-flex flex-column">
			<form id="host-form" className="m-auto d-flex flex-column w-50">
				<label htmlFor="game-file" className="btn btn-primary mb-3">
					Choose File
				</label>
				<input
					className="d-none"
					type="file"
					accept=".json"
					name="gameFile"
					id="game-file"
				/>
				<button
					className="btn btn-primary"
					id="join-spectate"
					onClick={handleSubmit}
				>
					Create Game
				</button>
			</form>
		</div>
	);
}
