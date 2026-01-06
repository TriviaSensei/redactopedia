type msgState = {
	state: {
		message: string;
		status: 'error' | 'warning' | 'info' | '';
		shown: boolean;
	};
};
export default function PopUpMessage(props: msgState) {
	const { state } = props;
	return (
		<div
			className={`pop-up-message${state.shown ? '' : ' d-none'}${
				state.shown ? ` message-${state.status}` : ''
			}`}
		>
			{state.message}
		</div>
	);
}
